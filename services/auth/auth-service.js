import dotenv from 'dotenv';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
import config from 'config';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../../db/index.js';
import mailService from '../mail/mail-service.js';
import tokenService from '../token/token-service.js';
import jwtService from '../token/jwt-service.js';
import oauthService from '../token/oauth-service.js';
import ApiError from '../../exceptions/api-error.js';
import TypeServices from '../../constants/values/type-services.js';
import ModuleDto from '../../dtos/auth/module-dto.js';
import AttributeDto from '../../dtos/auth/attribute-dto.js';
import SuccessDto from '../../dtos/response/success-dto.js';
import RefreshDto from '../../dtos/auth/refresh-dto.js';

/* Сервис авторизации пользователей */
class AuthService {
    /**
     * Регистрация нового пользователя
     * @param {*} data Информация о пользователе для регистрации
     * @returns Авторизационные данные пользователя
     */
    async signUp(data) {
        const t = await db.sequelize.transaction();

        try {
            const userEmail = await db.Users.findOne({ where: { email: data.email } });
            const userNick = await db.DataUsers.findOne({ where: { nickname: data.nickname } });
            const userPhone = await db.DataUsers.findOne({ where: { phone_num: data.phone_num } });

            if ((userEmail) || (userNick) || (userPhone)) {
                const message = (userEmail) ? `Пользователь с почтовым адресом ${data.email} уже существует`
                    : (userNick) ? `Пользователь с никнеймом ${data.nickname} уже существует`
                        : `Данный мобильный телефон занят`;

                throw ApiError.BadRequest(message);
            }

            // Хэширование пароля
            const hashedPassword = await bcrypt.hash(data.password, 16);
            const user = await db.Users.create({
                email: data.email,
                password: hashedPassword
            }, { transaction: t });

            // Добавление типа авторизации
            await db.AuthTypes.create({
                users_id: user.id,
                type: 0
            }, { transaction: t });

            // Генерация ссылки для активации аккаунта
            const link = uuid();

            await db.Activations.create({
                users_id: user.id,
                is_activated: false,
                activation_link: link
            }, { transaction: t });

            // Отправка сообщения о активации пользовательского аккаунта
            await mailService.sendActivationMail(data.email, `${config.get("url.client")}/auth/activate/${link}`);

            // Генерация токенов доступа и обновления
            const tokens = jwtService.generateTokens({
                users_id: user.id
            });

            // Сохранение токенов в БД
            await tokenService.saveTokens(user.id, tokens.access_token, tokens.refresh_token, t);
            const dateNow = (new Date()).toISOString().slice(0, 10);

            // Добавление информации о пользователе
            await db.DataUsers.create({
                name: data.name, surname: data.surname, nickname: data.nickname, phone_num: data.phone_num,
                location: data.location, date_birthday: data.date_birthday, users_id: user.id,
                ref_image: '', date_register: dateNow
            }, { transaction: t });

            // Установка прав доступа к модулям системы (default)
            const modules = await db.UsersModules.create({
                player: true, judge: false, creator: false, moderator: false,
                manager: false, admin: false, super_admin: false,
                users_id: user.id
            }, { transaction: t });

            // Установка атрибутов пользователя (default)
            const attributes = await db.UsersAttributes.create({
                read: true, write: false, update: false, delete: false, users_id: user.id
            }, { transaction: t });

            // Установка роли пользователя (default)
            await db.UsersRoles.create({
                users_id: user.id, users_groups_id: null, name_role: "player"
            }, { transaction: t });

            // Добавление информации о игроке (default):
            await db.DataPlayers.create({
                rating: 0, commands_id: null, users_id: user.id
            }, { transaction: t });

            //добавление координат пользователя
            await db.CoordPlayers.create({
                lat: 0, lng: 0, users_id: user.id
            }, { transaction: t });

            // Фиксация изменений в БД
            await t.commit();

            return {
                tokens: {
                    ...tokens
                },
                users_id: user.id,
                type_auth: 0,
                modules: {
                    ...(new ModuleDto(modules.dataValues))
                },
                attributes: {
                    ...(new AttributeDto(attributes.dataValues))
                }
            };
        } catch (e) {
            await t.rollback();
            throw ApiError.BadRequest(e.message);
        }
    }

    /**
     * Авторизация пользователя
     * @param {*} data Информация о пользователе для авторизации
     * @returns Авторизационные данные пользователя
     */
    async signIn(data) {
        const t = await db.sequelize.transaction();

        try {
            const user = await db.Users.findOne({ where: { email: data.email } });

            if (!user) {
                throw ApiError.BadRequest(`Аккаунта с почтовым адресом ${data.email} не существует`);
            }

            // Контроль метода авторизации
            const authType = await db.AuthTypes.findOne({
                where: {
                    users_id: user.id
                }
            });

            if (authType.type !== 0) {
                throw ApiError.Forbidden(`Аккаунт с почтовым адресом ${data.email} должен авторизовываться через сервис ${TypeServices[authType.type]}`)
            }

            // Проверка пароля
            const isMatch = await bcrypt.compare(data.password, user.password);
            if (!isMatch) {
                throw ApiError.BadRequest("Неверный пароль, повторите попытку");
            }

            const userAttributes = await db.UsersAttributes.findOne({ where: { users_id: user.id } });
            const userModules = await db.UsersModules.findOne({ where: { users_id: user.id } });
            const userGroup = await db.UsersGroups.findOne({ where: { users_id: user.id } });
            let userGroupModules = null;
            let userGroupAttributes = null;

            let resultModules = {
                player: false,
                judge: false,
                creator: false,
                moderator: false,
                manager: false,
                admin: false,
                super_admin: false
            };

            let resultAttributes = {
                read: false,
                write: false,
                update: false,
                delete: false
            };

            if (userGroup && userGroup.id) {
                userGroupModules = await db.GroupsModules.findOne({ where: { users_groups_id: userGroup.id } });
                userGroupAttributes = await db.GroupsAttributes.findOne({ where: { users_groups_id: userGroup.id } });

                if ((!userGroupModules) && (userGroupAttributes)) {
                    throw ApiError.InternalServerError('В группе пользователей нет данных о доступных модулях');
                } else if ((userGroupModules) && (!userGroupAttributes)) {
                    throw ApiError.InternalServerError('В группе пользователей нет данных о атрибутах действий');
                } else {
                    resultModules = {
                        player: userGroupModules.player,
                        judge: userGroupModules.judge,
                        creator: userGroupModules.creator,
                        moderator: userGroupModules.moderator,
                        manager: userGroupModules.manager,
                        admin: userGroupModules.admin,
                        super_admin: userGroupModules.super_admin
                    };

                    resultAttributes = {
                        read: userGroupAttributes.read,
                        write: userGroupAttributes.write,
                        update: userGroupAttributes.dataValues.update,
                        delete: userGroupAttributes.delete
                    };
                }
            }

            if ((!user) || (!userAttributes) || (!userModules)) {
                throw ApiError.BadRequest('Данный пользователь не зарегистрирован');
            }

            //определение доступа пользователя к функциональным модулям
            resultModules = {
                player: (userModules.player || resultModules.player),
                judge: (userModules.judge || resultModules.judge),
                creator: (userModules.creator || resultModules.creator),
                moderator: (userModules.moderator || resultModules.moderator),
                manager: (userModules.manager || resultModules.manager),
                admin: (userModules.admin || resultModules.admin),
                super_admin: (userModules.super_admin || resultModules.super_admin)
            };

            //определение действий пользователя в функциональных модулях
            resultAttributes = {
                read: (userAttributes.read || resultAttributes.read),
                write: (userAttributes.write || resultAttributes.write),
                update: (userAttributes.dataValues.update || resultAttributes.update),
                delete: (userAttributes.delete || resultAttributes.delete)
            };

            // Генерация токенов доступа и обновления
            const tokens = jwtService.generateTokens({ users_id: user.id });

            // Сохранение токенов
            await tokenService.saveTokens(user.id, tokens.access_token, tokens.refresh_token, t);

            // Фиксация изменений в БД
            await t.commit();

            return {
                tokens: {
                    ...tokens
                },
                users_id: user.id,
                type_auth: 0,
                modules: {
                    ...(new ModuleDto(resultModules))
                },
                attributes: {
                    ...(new AttributeDto(resultAttributes))
                }
            };
        } catch (e) {
            await t.rollback();
            throw ApiError.BadRequest(e.message);
        }
    }

    /**
     * Выход пользователя из системы
     * @param {*} data Информация о пользователе
     * @returns Результат выхода из системы пользователя
     */
    async logout(data) {
        const t = await db.sequelize.transaction();

        try {
            const isExists = await tokenService.isExistsUser(data.users_id, data.access_token, data.refresh_token, data.type_auth);

            if (!isExists) {
                throw ApiError.BadRequest('Данный пользователь не авторизован');
            }

            if (data.type_auth === 1) {
                await oauthService.removeTokenByAccessToken(access_token);
            }

            await tokenService.removeTokenByUserId(data.users_id, t);
            await t.commit();

            return new SuccessDto(true);
        } catch (e) {
            await t.rollback();
            throw ApiError.BadRequest(e.message);
        }
    }


    /**
     * Активация аккаунта пользователя
     * @param {string} activationLink Ссылка активации
     * @returns {SuccessDto} Результат активации аккаунта
     */
    async activate(activationLink) {
        const t = await db.sequelize.transaction();
        try {
            const user = await db.Activations.findOne({
                where: {
                    activation_link: activationLink
                }
            });

            if (!user) {
                throw ApiError.BadRequest("По данной ссылке активации аккаунта не обнаружено ни одного пользователя");
            }

            user.is_activated = true;
            await user.save();

            return new SuccessDto(true);
        } catch (e) {
            await t.rollback();
            throw ApiError.BadRequest(e.message);
        }
    }

    /**
     * Обновление токена доступа пользователя
     * @param {RefreshDto} data 
     * @returns Авторизационные данные пользователя
     */
    async refreshToken(data) {
        const t = await db.sequelize.transaction();

        try {
            // Декодирование токена обновления (с пользовательскими данными)
            let user = null;

            switch (Number(data.type_auth)) {
                case 0: {
                    user = jwtService.validateRefreshToken(data.refresh_token);
                    break;
                }

                case 1: {
                    const findData = await tokenService.findUserByRefreshToken(data.refresh_token, data.type_auth);
                    user = {
                        users_id: findData.id,
                        email: findData.email
                    };

                    break;
                }
            }

            let candidat = null;
            if (data.type_auth == 1) {
                // При OAuth2 авторизации для определения внутреннего ID пользователя
                // необходимо осуществить его поиск в базе данных
                candidat = await db.Users.findOne({ where: { email: user.email } });
                user.users_id = candidat.id;
            }

            // Поиск записи о токене в базе данных по токену и пользовательскому ID
            const tokenExists = await tokenService.findToken(data.refresh_token, user.users_id);

            // Проверка валидности токена
            if ((!user) || (!tokenExists)) {
                throw ApiError.Forbidden('Пользователь не авторизован');
            }

            // Поиск информации о пользователе
            if (!candidat) {
                candidat = await db.Users.findOne({ where: { id: user.users_id } });
            }

            if (!candidat) {
                throw ApiError.BadRequest(`Аккаунта с почтовым адресом ${email} не существует`);
            }

            // Определение типа вторизации
            const authType = await db.AuthTypes.findOne({
                where: {
                    users_id: candidat.id
                }
            });

            if (authType.type !== data.type_auth) {
                throw ApiError.BadRequest('Была осуществлена модификация аутентификационных данных. Необходимо авторизоваться заново');
            }

            // Логика определения прав доступа
            const candidatAttributes = await db.UsersAttributes.findOne({ where: { users_id: candidat.id } });
            const candidatModules = await db.UsersModules.findOne({ where: { users_id: candidat.id } });
            const candidatGroup = await db.UsersGroups.findOne({ where: { users_id: candidat.id } });
            let candidatGroupModules = null;
            let candidatGroupAttributes = null;

            let resultModules = {
                player: false,
                judge: false,
                creator: false,
                moderator: false,
                manager: false,
                admin: false,
                super_admin: false
            };

            let resultAttributes = {
                read: false,
                write: false,
                update: false,
                delete: false
            };

            if (candidatGroup && candidatGroup.id) {
                candidatGroupModules = await db.GroupsModules.findOne({ where: { users_groups_id: candidatGroup.id } });
                candidatGroupAttributes = await db.GroupsAttributes.findOne({ where: { users_groups_id: candidatGroup.id } });

                if ((!candidatGroupModules) && (candidatGroupAttributes)) {
                    throw ApiError.InternalServerError('В группе пользователей нет данных о доступных модулях');
                } else if ((candidatGroupModules) && (!candidatGroupAttributes)) {
                    throw ApiError.InternalServerError('В группе пользователей нет данных о атрибутах действий');
                } else {
                    resultModules = {
                        player: candidatGroupModules.player,
                        judge: candidatGroupModules.judge,
                        creator: candidatGroupModules.creator,
                        moderator: candidatGroupModules.moderator,
                        manager: candidatGroupModules.manager,
                        admin: candidatGroupModules.admin,
                        super_admin: candidatGroupModules.super_admin
                    };

                    resultAttributes = {
                        read: candidatGroupAttributes.read,
                        write: candidatGroupAttributes.write,
                        update: candidatGroupAttributes.dataValues.update,
                        delete: candidatGroupAttributes.delete
                    };
                }
            }

            if ((!candidat) || (!candidatAttributes) || (!candidatModules)) {
                throw ApiError.NotFound('Данный пользователь не зарегистрирован');
            }

            //определение доступа пользователя к функциональным модулям
            resultModules = {
                player: (candidatModules.player || resultModules.player),
                judge: (candidatModules.judge || resultModules.judge),
                creator: (candidatModules.creator || resultModules.creator),
                moderator: (candidatModules.moderator || resultModules.moderator),
                manager: (candidatModules.manager || resultModules.manager),
                admin: (candidatModules.admin || resultModules.admin),
                super_admin: (candidatModules.super_admin || resultModules.super_admin)
            };

            // Определение действий пользователя в функциональных модулях
            resultAttributes = {
                read: (candidatAttributes.read || resultAttributes.read),
                write: (candidatAttributes.write || resultAttributes.write),
                update: (candidatAttributes.dataValues.update || resultAttributes.update),
                delete: (candidatAttributes.delete || resultAttributes.delete)
            };

            let accessToken = null;
            // Логика обновления токенов доступа по токенам обновления
            switch (authType.type) {
                case 0: {
                    accessToken = jwtService.generateTokens({ users_id: candidat.id }).access_token;
                    break;
                }

                case 1: {
                    accessToken = oauthService.refreshAccessToken(data.refresh_token);
                    break;
                }
            }

            if (!accessToken) {
                throw ApiError.UnathorizedError('Необходима авторизация');
            }

            await tokenService.saveTokens(candidat.id, accessToken, data.refresh_token, t);

            await t.commit();

            return {
                tokens: {
                    access_token: accessToken, 
                    refresh_token: data.refresh_token
                },
                users_id: user.id,
                type_auth: 0,
                modules: {
                    ...(new ModuleDto(resultModules))
                },
                attributes: {
                    ...(new AttributeDto(resultAttributes))
                }
            };
        } catch (e) {
            await t.rollback();
            throw ApiError.BadRequest(e.message);
        }
    }
}

export default new AuthService();
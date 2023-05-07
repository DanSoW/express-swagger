import dotenv from 'dotenv';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

import db from '../../db/index.js';

/* Сервис для работы с токенами в базе данных */
class TokenService {
    /**
     * Сохранение токена доступа и обновления в БД
     * @param {int} userId Идентификатор пользователя
     * @param {string} accessToken Токен доступа
     * @param {string} refreshToken Токен обновления
     * @param {*} t Транзакция
     * @returns Токены доступа и обновления, сохранённые в БД
     */
    async saveTokens(userId, accessToken, refreshToken, t){
        // Получение конкретной записи о токене пользователя из БД
        let token = await db.Tokens.findOne({
            where: {
                users_id: userId
            }
        });

        // Перезапись данных токена, в случае если он был найден
        if(token){
            token.access_token = accessToken;
            token.refresh_token = refreshToken;

            return await token.save();
        }

        // Создание новой записи о токена пользователя
        token = await db.Tokens.create({
            users_id: userId,
            access_token: accessToken,
            refresh_token: refreshToken
        }, { transaction: t });

        return token;
    }

    /**
     * Удаление токенов доступа и обновления по идентификатору пользователя
     * @param {int} userId Идентификатор пользователя
     * @returns Удалённый объект модели Tokens
     */
    async removeTokenByUserId(userId, t){
        return await db.Tokens.destroy({
            where: {
                users_id: userId
            }
        }, { transaction: t});
    }

    /**
     * Поиск объекта модели Tokens, по токену обновления
     * @param {string} refreshToken Токен обновлени
     * @returns Найденный объект модели Tokens
     */
    async findToken(refreshToken) {
        return await db.Tokens.findOne({
            where: {
                refresh_token: refreshToken
            }
        });
    }

    /**
     * Поиск объекта модели Tokens, по идентификатору пользователя
     * @param {int} userId Идентификатор пользователя
     * @returns Найденный объект модели Tokens
     */
    async findTokenByUserId(userId){
        return await db.Tokens.findOne({
            where: {
                users_id: userId
            }
        });
    }

    /**
     * Поиск токенов по идентификатору пользователя
     * @param {int} userId Идентификатор пользователя
     * @returns Найденный объект модели Tokens
     */
    async findTokenByUserId(userId) {
        return await db.Tokens.findOne({
            where: {
                users_id: userId
            }
        });
    }

    /**
     * Поиск токенов пользователя по идентификатору и токену доступа
     * @param {int} userId Идентификатор пользователя
     * @param {string} accessToken Токен доступа
     * @returns Найденный объект типа Tokens
     */
    async findTokenByAccessToken(userId, accessToken){
        return await db.Tokens.findOne({
            where: {
                users_id: userId,
                access_token: accessToken
            }
        });
    }

    /**
     * Определение пользователя по токену обновления и типу авторизации
     * @param {string} refreshToken Токен обновления
     * @param {int} authType Тип авторизации
     * @returns Найденный объект модели Users
     */
    async findUserByRefreshToken(refreshToken, authType){
        let token = await db.Tokens.findOne({
            where: {
                refresh_token: refreshToken
            }
        });

        if(token){
            const authData = await db.AuthTypes.findOne({
                where: {
                    type: authType,
                    users_id: token.users_id
                }
            });

            if(!authData){
                return false;
            }
        }

        const user = await db.Users.findOne({
            where: {
                id: token.users_id
            }
        });

        return {
            id: user.id,
            email: user.email
        };
    }

    /**
     * Проверка существования пользователя в системе с определёнными параметрами
     * @param {int} users_id Идентификатор пользователя
     * @param {string} access_token Токен доступа
     * @param {string} refresh_token Токен обновления
     * @param {int} type_auth Тип авторизации
     * @returns Результат проверки существования пользователя
     */
    async isExistsUser(users_id, access_token, refresh_token, type_auth){
        const token = await db.Tokens.findOne({
            where: {
                users_id: users_id,
                access_token: access_token,
                refresh_token: refresh_token
            }
        });

        const type = await db.AuthTypes.findOne({
            where: {
                users_id: users_id,
                type: type_auth
            }
        });

        return (token && type);
    }
}

export default new TokenService();
import ApiError from '../exceptions/api-error';
import jwtService from '../services/token/jwt-service';
import oauthService from '../services/token/oauth-service';
import tokenService from '../services/token/token-service';
import { User, Tokens } from '../db.js';

/**
 * Middleware для проверки авторизационных данных пользователя
 * @param {*} req Запрос от пользователя 
 * @param {*} res Ответ пользователю
 * @param {*} next 
 * @returns 
 */
const authMiddleware = async function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            return next(ApiError.UnathorizedError());
        }

        const authData = authorizationHeader.split(' ');
        const accessToken = authData[2];

        if (!accessToken) {
            return next(ApiError.UnathorizedError());
        }

        let userData = null;

        switch (Number(authData[1])) {
            case 0: {
                // Авторизация с помощью сервиса NetMan (обычная авторизация)
                userData = tokenServiceJWT.validateAccessToken(accessToken);
                break;
            }

            case 1: {
                // Авторизация с помощью сервиса Google OAuth2
                userData = await tokenServiceOAuth2.validateAccessToken(accessToken);
                const candidat = await User.findOne({
                    where: {
                        email: userData.email
                    }
                });
                userData.users_id = candidat.id;

                break;
            }
        }

        // Поиск токена доступа по определённому ID пользователя (для предотвращения подделки токенов доступа)
        const findToken = await tokenService.findTokenByAccessToken(userData.users_id, accessToken);

        if ((!userData) || (!findToken)) {
            return next(ApiError.UnathorizedError());
        }

        next();
    } catch (e) {
        return next(ApiError.UnathorizedError());
    }
};

export default authMiddleware;

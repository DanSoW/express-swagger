import dotenv from 'dotenv';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
import jwt from 'jsonwebtoken';

/* Сервис для работы с JWT-токенами */
class JWTService {
    /**
     * Генерация токена доступа и обновления
     * @param {object} payload Полезна нагрузка
     * @returns Access и Refresh-токены
     */
    generateTokens(payload) {
        return {
            access_token: jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' }),
            refresh_token: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
        }
    }

    /**
     * Проверка токена доступа
     * @param {string} token Токен доступа
     * @returns Результат валидации токена доступа
     */
    validateAccessToken(token){
        try{
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        }catch(e){
            return false;
        }
    }

    /**
     * Проверка токена обновления
     * @param {string} token Токен обновления
     * @returns Результат валидации токена обновления
     */
    validateRefreshToken(token){
        try{
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        }catch(e){
            return false;
        }
    }
}

export default new JWTService();
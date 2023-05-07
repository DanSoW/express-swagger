import dotenv from 'dotenv';
dotenv.config({ path: `.${process.env.NODE_ENV}.env` });
import config from 'config';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import GoogleApi from '../../constants/addresses/google.api.js';
import { google } from 'googleapis';

/* Сервис для работы с Google OAuth */
class OAuthService {
    OAuthClient;

    constructor(){
        // Создание экземпляра объекта OAuth2
        this.OAuthClient = new google.auth.OAuth2(
            process.env.OAUTH_CLIENT_ID,
            process.env.OAUTH_SECRET,
            config.get('url.client')
        );
    }

    /**
     * Обновление токена доступа
     * @param {string} refreshToken Токен обновления
     * @returns Обновлённый токен доступа
     */
    refreshAccessToken(refreshToken){
        this.OAuthClient.credentials.refresh_token = refreshToken;

        let accessToken = null;
        this.OAuthClient.refreshAccessToken((error, tokens) => {
            if(!error){
                accessToken = tokens.access_token;
            }
        });

        return accessToken;
    }

    /**
     * Генерация токенов доступа и обновления
     * @param {string} code Код, для генерации токенов (полученный с google-сервисов)
     * @returns Токен доступа и обновления
     */
    async generateTokens(code){
        const { tokens } = await this.OAuthClient.getToken(code);

        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        };
    }

    /**
     * Валидация токена доступа
     * @param {string} token Токен доступа
     * @returns Результат проверки токена доступа на валидность
     */
    async validateAccessToken(token) {
        try{
            let verified_email = false;

            // Проверка валидности токена доступа
            await fetch(GoogleApi.sequrityOauth + token)
                .then(res => res.json())
                .then(json => {
                    verified_email = json.verified_email;
                });
            
            if(!verified_email){
                return false;
            }

            let data = {};
            
            // Получение данных о пользователе по его токену
            await fetch(GoogleApi.userData + token)
                .then(res => res.json())
                .then(json => {
                    data = json;
                });

            return data;
        }catch(e){
            console.log(e);
            return false;
        }
    }

    /**
     * Удаление токенов доступа и обновления пользователя по токену доступа
     * @param {string} token Токен доступа
     */
    async removeTokenByAccessToken(token){
        await this.OAuthClient.revokeToken(token);
    }
}

export default new OAuthService();
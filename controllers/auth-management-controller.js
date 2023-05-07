import { validationResult } from "express-validator";
import ApiError from "../exceptions/api-error.js";
import SignInDto from "../dtos/auth/sign-in-dto.js";
import authManagementService from "../services/auth/auth-management-service.js";
import LogoutDto from "../dtos/auth/logout-dto.js";
import RefreshDto from "../dtos/auth/refresh-dto.js";

/* Контроллер авторизации */
class AuthController {
    async signIn(req, res, next){
        try{
            // Проверяем корректность входных данных
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные регистрационные данные', errors.array()));
            }

            const body = new SignInDto(req.body);
            const data = await authManagementService.signIn(body);
            
            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }

    async logout(req, res, next){
        try{
            // Проверяем корректность входных данных
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные регистрационные данные', errors.array()));
            }

            const body = new LogoutDto(req.body);
            const data = await authManagementService.logout(body);
            
            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }

    async refreshToken(req, res, next) {
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные данные для выхода из системы', errors.array()));
            }

            const body = new RefreshDto(req.body);
            const data = await authManagementService.refreshToken(body);

            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }
}

export default new AuthController();
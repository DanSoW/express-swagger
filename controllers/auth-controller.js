import { validationResult } from "express-validator";
import ApiError from "../exceptions/api-error.js";
import SignUpDto from "../dtos/auth/sign-up-dto.js";
import SignInDto from "../dtos/auth/sign-in-dto.js";
import authService from "../services/auth/auth-service.js";
import LogoutDto from "../dtos/auth/logout-dto.js";
import RefreshDto from "../dtos/auth/refresh-dto.js";

/* Контроллер авторизации */
class AuthController {
    async signUp(req, res, next){
        try{
            // Проверяем корректность входных данных
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные регистрационные данные', errors.array()));
            }

            const body = new SignUpDto(req.body);
            const data = await authService.signUp(body);
            console.log(data);

            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }

    async signIn(req, res, next){
        try{
            // Проверяем корректность входных данных
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные авторизационные данные', errors.array()));
            }

            const body = new SignInDto(req.body);
            const data = await authService.signIn(body);
            
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
                return next(ApiError.BadRequest('Некорректные данные для выхода из системы', errors.array()));
            }

            const body = new LogoutDto(req.body);
            const data = await authService.logout(body);
            
            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }

    async activate(req, res, next) {
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()){
                return next(ApiError.BadRequest('Некорректные данные для выхода из системы', errors.array()));
            }

            const { activation_link } = req.body;
            const data = await authService.activate(activation_link);

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
            const data = await authService.refreshToken(body);

            return res.status(201).json(data);
        }catch(e){
            next(e);
        }
    }
}

export default new AuthController();
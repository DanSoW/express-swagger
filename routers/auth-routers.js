import { Router } from 'express';
import { check } from 'express-validator';
import authController from '../controllers/auth-controller.js';
import authManagementController from '../controllers/auth-management-controller.js';
import AuthRoute from '../constants/routes/auth.js';
import AuthDto from '../dtos/auth/auth-dto.js';
import ApiError from '../exceptions/api-error.js';
import LogoutDto from '../dtos/auth/logout-dto.js';
import SuccessDto from '../dtos/response/success-dto.js';
import ActivationLinkDto from '../dtos/auth/activation-link-dto.js';
import RefreshDto from '../dtos/auth/refresh-dto.js';

const router = new Router();

/**
 * @typedef SignUpDto
 * @property {string} email.required
 * @property {string} password.required
 * @property {string} phone_num.required
 * @property {string} location.required
 * @property {string} date_birthday.required
 * @property {string} nickname.required
 * @property {string} name.required
 * @property {string} surname.required
 */

/**
 * Регистрация пользователя
 * @route POST /auth/sign-up
 * @group Авторизация (пользователь) - Функции для авторизации пользователя
 * @param {SignUpDto.model} input.body.required Входные данные
 * @returns {AuthDto.model} 200 - Авторизационные данные пользователя
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.signUp, // Константа конкретного адреса
    [
        // Валидация входных данных
        check('email', 'Введите корректный email').isEmail(),
        check('password', 'Минимальная длина пароля должна быть 6 символов, а максимальная длина пароля - 32 символа')
            .isLength({ min: 6, max: 32 }),
        check('phone_num', 'Некорректный номер телефона').isMobilePhone("ru-RU"),
        check('location', 'Максимальная длина местоположение не может быть меньше 3 символов')
            .isLength({ min: 3 }),
        check('date_birthday', "Некорректная дата рождения").isDate({
            format: "YYYY-MM-DD"
        }),
        check('nickname', 'Минимальная длина для никнейма равна 2 символам')
            .isLength({ min: 2 }),
        check('name', 'Минимальная длина для имени равна 2 символам')
            .isLength({ min: 2 }),
        check('surname', 'Минимальная длина для фамилии равна 2 символам')
            .isLength({ min: 2 })
    ],
    authController.signUp // Конкретный метод контроллера
);

/**
 * Авторизация пользователя
 * @route POST /auth/sign-in
 * @group Авторизация (пользователь) - Функции для авторизации пользователя
 * @param {SignInDto.model} input.body.required Входные данные
 * @returns {AuthDto.model} 200 - Авторизационные данные пользователя
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.signIn,
    [
        check('email', 'Введите корректный email').isEmail(),
        check('password', 'Минимальная длина пароля должна быть 6 символов')
            .isLength({ min: 6 }),
        check('password', 'Максимальная длина пароля равна 30 символам')
            .isLength({ max: 30 })
    ],
    authController.signIn
);

/**
 * Выход пользователя из системы
 * @route POST /auth/logout
 * @group Авторизация (пользователь) - Функции для авторизации пользователя
 * @param {LogoutDto.model} input.body.required Входные данные
 * @returns {SuccessDto.model} 200 - Флаг, определяющий успех операции выхода пользователя из системы
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.logout,
    [
        check('type_auth', 'Некорректные данные для выхода из системы').isNumeric()
    ],
    authController.logout
);

/**
 * Авторизация пользователя
 * @route POST /auth/management/sign-in
 * @group Авторизация (для управляющего сайта) - Функция для авторизации пользователя
 * @param {SignInDto.model} input.body.required Входные данные
 * @returns {AuthDto.model} 200 - Авторизационные данные пользователя
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.managementSignIn,
    [
        check('email', 'Введите корректный email').isEmail(),
        check('password', 'Минимальная длина пароля должна быть 6 символов')
            .isLength({ min: 6 }),
        check('password', 'Максимальная длина пароля равна 30 символам')
            .isLength({ max: 30 })
    ],
    authManagementController.signIn
);

/**
 * Авторизация пользователя
 * @route POST /auth/management/logout
 * @group Авторизация (для управляющего сайта) - Функция для авторизации пользователя
 * @param {LogoutDto.model} input.body.required Входные данные
 * @returns {SuccessDto.model} 200 - Флаг, определяющий успех операции выхода пользователя из системы
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.managementLogout,
    [
        check('type_auth', 'Некорректные данные для выхода из системы').isNumeric()
    ],
    authManagementController.logout
);

/**
 * Выход пользователя из системы
 * @route POST /auth/activate
 * @group Авторизация (пользователь) - Функции для авторизации пользователя
 * @param {ActivationLinkDto.model} input.body.required Входные данные
 * @returns {SuccessDto.model} 200 - Флаг, определяющий успех операции подтверждения пользователя
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.activateLink,
    [
        check('activation_link', 'Некорректная ссылка активации').isUUID(4)
    ],
    authController.activate
);

/**
 * Выход пользователя из системы
 * @route POST /auth/refresh/token
 * @group Авторизация (пользователь) - Функции для авторизации пользователя
 * @param {RefreshDto.model} input.body.required Входные данные
 * @returns {AuthDto.model} 200 - Авторизационные данные пользователя
 * @returns {ApiError.model} default - Ошибка запроса
 */
router.post(
    AuthRoute.refreshToken,
    [
        check('type_auth', 'Некорректные данные для обновления токена доступа').isNumeric()
    ],
    authController.refreshToken
);

export default router;
import ApiError from "../exceptions/api-error.js";

/**
 * Middleware для обработки ошибок
 * @param {*} err Ошибка
 * @param {*} req Запрос пользователя
 * @param {*} res Ответ пользователю
 * @param {*} next 
 * @returns 
 */
const errorMiddleware = (err, req, res, next) => {
    if(err instanceof ApiError){
        return res.status(err.status).json({
            message: err.message,
            errors: err.errors
        });
    }

    return res.status(500).json({
        message: 'Непредвиденная ошибка'
    });
};

export default errorMiddleware;
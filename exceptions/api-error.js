import FieldError from "./field-error.js";

/**
 * @typedef ApiError
 * @property {string} message.required
 * @property {Array.<FieldError>} errors.required
 */
class ApiError extends Error {
    status;
    message;
    errors;

    constructor(status, message, errors=[]){
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors;
    }

    static UnathorizedError(message = 'Пользователь не авторизован'){
        return new ApiError(401, message);
    }

    static BadRequest(message, errors=[]){
        return new ApiError(400, message, errors);
    }

    static Forbidden(message = 'Пользователь не имеет доступа для осуществления функции'){
        return new ApiError(403, message);
    }

    static InternalServerError(message = 'Внутренняя сервераня ошибка'){
        return new ApiError(500, message);
    }

    static NotFound(message = 'Не найдено'){
        return new ApiError(404, message);
    }
}

export default ApiError;
import TokenDto from "./token-dto.js";
import ModuleDto from "./module-dto.js";
import AttributeDto from "./attribute-dto.js";

/**
 * @typedef AuthDto
 * @property {TokenDto.model} tokens.required
 * @property {number} users_id.required
 * @property {number} type_auth.required
 * @property {ModuleDto.model} refresh_token.required
 * @property {AttributeDto.model} attributes.required
 */
class AuthDto {
    tokens;         // Токены
    users_id;       // Идентификатор пользователя
    type_auth;      // Тип авторизации
    modules;        // Модель
    attributes;     // Атрибуты

    constructor(model){
        this.tokens = model.tokens;
        this.users_id = model.tokens;
        this.type_auth = model.type_auth;
        this.modules = model.modules;
        this.attributes = model.attributes;
    }
}

export default AuthDto;

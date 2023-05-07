/**
 * @typedef LogoutDto
 * @property {number} users_id.required.required
 * @property {string} access_token.required.required
 * @property {string} refresh_token.required.required
 * @property {number} type_auth.required.required
 */
class LogoutDto {
    users_id;
    access_token;
    refresh_token;
    type_auth;

    constructor(model) {
        this.users_id = model.users_id;
        this.access_token = model.access_token;
        this.refresh_token = model.refresh_token;
        this.type_auth = model.type_auth;
    }
}

export default LogoutDto;
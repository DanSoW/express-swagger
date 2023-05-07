/**
 * @typedef RefreshDto
 * @property {string} refresh_token.required
 * @property {number} type_auth.required
 */
class RefreshDto {
    refresh_token;
    type_auth;

    constructor(model) {
        this.refresh_token = model.refresh_token;
        this.type_auth = model.type_auth;
    }
}

export default RefreshDto;
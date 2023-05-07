/**
 * @typedef TokenDto
 * @property {string} access_token.required
 * @property {string} refresh_token.required
 */
class TokenDto {
    access_token;
    refresh_token;

    constructor(model){
        this.access_token = model.access_token;
        this.refresh_token = model.refresh_token;
    }
}

export default TokenDto;
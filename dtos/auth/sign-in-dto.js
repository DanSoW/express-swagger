/**
 * @typedef SignInDto
 * @property {string} email.required
 * @property {string} password.required
 */
class SignInDto {
    email;
    password;

    constructor(model) {
        this.email = model.email;
        this.password = model.password;
    }
}

export default SignInDto;
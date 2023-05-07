/**
 * @typedef SuccessDto
 * @property {boolean} success.required
 */
class SuccessDto {
    success;

    constructor(success){
        this.success = success;
    }
}

export default SuccessDto;
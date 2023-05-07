/**
 * @typedef ActivationLinkDto
 * @property {string} activation_link.required
 */
class ActivationLinkDto {
    activation_link;

    constructor(model){
        this.activation_link = model.activation_link
    }
}

export default ActivationLinkDto;
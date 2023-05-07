/**
 * @typedef FieldError
 * @property {string} type.required
 * @property {string} value.required
 * @property {string} msg.required
 * @property {string} path.required
 * @property {string} location.required
 */
class FieldError {
    type;
    value;
    msg;
    path;
    location;

    constructor(model){
        this.type = model.type;
        this.value = model.value;
        this.msg = model.msg;
        this.path = model.path;
        this.location = model.location;
    }
}

export default FieldError;
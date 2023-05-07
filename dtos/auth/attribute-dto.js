/**
 * @typedef AttributeDto
 * @property {boolean} read.required
 * @property {boolean} write.required
 * @property {boolean} update.required
 * @property {boolean} delete.required
 */
class AttributeDto {
    read;
    write;
    update;
    delete;

    constructor(model) {
        this.read = model.read;
        this.write = model.write;
        this.update = model.update;
        this.delete = model.delete;
    }
}

export default AttributeDto;
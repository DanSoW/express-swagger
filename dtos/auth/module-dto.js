/**
 * @typedef ModuleDto
 * @property {boolean} player.required
 * @property {boolean} judge.required
 * @property {boolean} creator.required
 * @property {boolean} moderator.required
 * @property {boolean} manager.required
 * @property {boolean} admin.required
 * @property {boolean} super_admin.required
 */
class ModuleDto {
    player;
    judge;
    creator;
    moderator;
    manager;
    admin;
    super_admin;

    constructor(model) {
        this.player = model.player;
        this.judge = model.judge;
        this.creator = model.creator;
        this.moderator = model.moderator;
        this.manager = model.manager;
        this.admin = model.admin;
        this.super_admin = model.super_admin;
    }
}

export default ModuleDto;
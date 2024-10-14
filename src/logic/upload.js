const Base = require('./base.js');

module.exports = class extends Base {

  async putAction() {
    const { userInfo } = this.ctx.state;

    if (think.isEmpty(userInfo)) {
      return this.fail(401);
    }

    if (this.id && userInfo.type !== 'administrator') {
      return this.fail(403);
    }
  }
};

const Base = require('./base.js');

module.exports = class extends Base {

  async putAction() {
    const { userInfo } = this.ctx.state;

    if (think.isEmpty(userInfo)) {
      return this.fail(401);
    }
		
  }
};

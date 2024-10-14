const BaseRest = require('./rest.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')

module.exports = class extends BaseRest {
  constructor(ctx) {
    super(ctx);
    this.modelInstance = this.getModel('Users');
  }

  async postAction() {
    const { path } = this.post();
		const { file } = this.file()

		// const s3instance = think.service('s3client').s3instance();
		const customDomain = think.service('s3client').customDomain();

		console.log(customDomain)

    return this.jsonOrSuccess({ success: true });
  }

	
};

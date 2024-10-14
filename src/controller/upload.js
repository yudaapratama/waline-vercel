const BaseRest = require('./rest.js');
const { PutObjectCommand } = require('@aws-sdk/client-s3')

module.exports = class extends BaseRest {
  constructor(...args) {
    super(...args);
  }

  async putAction() {
		const { file } = this.file()
		const s3instance = await think.service('s3client').s3Instance();
		const customDomain = await think.service('s3client').customDomain();
		
		const randomHash = crypto.randomBytes(15).toString('hex')
		const fileExtension = file.name.split('.').pop()
		
		const key = `profile/${randomHash}.${fileExtension}`;
		
		const uploadParams = {
			Bucket: 'backup', 
			Key: key,
			Body: file, 
			ContentType: file.type, 
		};
			
		try {
			const command = new PutObjectCommand(uploadParams);
			await s3instance.send(command);

		} catch (error) {
			return this.fail(`Failed to upload, error: ${error.message}`)
		}
			
		const fileUrl = `${customDomain}/${key}`;
		return this.success({
			url: fileUrl
		});

	}	
};

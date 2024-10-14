const { S3Client } = require("@aws-sdk/client-s3")

const s3Key = {
	region: process.env.APP_S3_REGION,
	endpoint: process.env.APP_S3_ENDPOINT,
	accessKeyId: process.env.APP_S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.APP_S3_SECRET_ACCESS_KEY,
	customDomain: process.env.APP_S3_CUSTOM_DOMAIN,
}

module.exports = class extends think.Service {

	s3Instance() {
		const instance = new S3Client({
			region: s3Key.region,
			endpoint: s3Key.endpoint,
			credentials: {
				accessKeyId: s3Key.accessKeyId,
				secretAccessKey: s3Key.secretAccessKey
			},
			forcePathStyle: true,
		})

		return instance
	}

	customDomain() { return s3Key.customDomain }

}
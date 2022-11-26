const S3 = require("aws-sdk/clients/s3");
const s3 = new S3();

const setGenerateStorageUrl = (basedKey) => {
  const generateStorageUrl = (
    objectKey,
    action = "getObject",
    expires = 360,
  ) => {
    try {
      const params = {
        Bucket: "api-factory-storage",
        Key: `${basedKey}/${objectKey}`,
        Expires: expires,
      };
      const signedUrl = s3.getSignedUrl(action, params);

      return {
        statusCode: 200,
        body: signedUrl,
      };
    } catch (error) {
      return {
        statueCode: error.status || 500,
        body: error.message,
      };
    }
  };

  return generateStorageUrl;
};

module.exports = setGenerateStorageUrl;

const S3 = require("aws-sdk/clients/s3");
const s3 = new S3();

const setGeneratePresignedUrl = (basedKey) => {
  const generatePresignedUrl = (
    objectKey,
    action = "GetObject",
    expires = 360,
  ) => {
    try {
      let params = {
        Bucket: "api-factory-storage",
        Key: `${basedKey}/${objectKey}`,
        Expires: expires,
      };

      const signedUrl = s3.getSignedUrl(action, params);

      return {
        statusCode: 200,
        body: JSON.stringify(signedUrl),
      };
    } catch (error) {
      return {
        statueCode: 500,
        body: JSON.stringify(error.message),
      };
    }
  };

  return generatePresignedUrl;
};

module.exports = setGeneratePresignedUrl;

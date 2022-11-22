const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const tableName = "user_function";

const findUserFunction = async (functionKey) => {
  const params = {
    TableName: tableName,
    Key: { function_key: functionKey },
  };

  return await dynamoDB.get(params).promise();
};
const setDynamoDbCustomLibrary = () => {};

module.exports = { findUserFunction, setDynamoDbCustomLibrary };

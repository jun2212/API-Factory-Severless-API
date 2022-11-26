const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const findUserFunction = async (functionKey) => {
  const params = {
    TableName: "user_function",
    Key: { function_key: functionKey },
  };

  return await dynamoDB.get(params).promise();
};

const setDynamoDbCustomLibrary = (user_id) => {
  const getDbData = async (divisionKey) => {
    const params = {
      TableName: "API-FACTORY-DB",
      Key: { user_id: user_id, division_key: divisionKey },
    };

    const { Item } = await dynamoDB.get(params).promise();

    delete Item["user_id"];
    delete Item["division_key"];

    return Item;
  };

  const setDbData = async (divisionKey, data) => {
    const Item = {
      user_id: user_id,
      division_key: divisionKey,
    };

    for (const key in data) {
      if (key === "user_id" || key === "division_key") {
        throw new Error("invalid column name");
      }

      Item[key] = data[key];
    }

    const params = {
      TableName: "API-FACTORY-DB",
      Item: Item,
    };

    return await dynamoDB.put(params).promise();
  };

  return { getDbData, setDbData };
};

module.exports = { findUserFunction, setDynamoDbCustomLibrary };

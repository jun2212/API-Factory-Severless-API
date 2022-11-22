const { NodeVM } = require("vm2");
const {
  findUserFunction,
  setDynamoDbCustomLibrary,
} = require("./lib/dynamoDbUtil");
const setGeneratePresignedUrl = require("./lib/setGeneratePresignedUrl");

const handleResponse = (status, body) => {
  return {
    statusCode: status,
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
};

const apiHandler = async (event) => {
  const { http } = event.requestContext;

  if (!event.queryStringParameters) {
    return handleResponse(400, {
      error: "status 400 : No query parameter",
    });
  }

  const { functionKey } = event.queryStringParameters;

  if (!functionKey) {
    return handleResponse(400, {
      error: "status 400 : Invalid query parameter",
    });
  }

  const { Item } = await findUserFunction(functionKey);

  if (!Item) {
    return handleResponse(400, { error: "status 400 : Incorrect key" });
  }

  const { method, code, user_id } = Item;

  if (http.method !== method) {
    return handleResponse(400, { error: "status 400 : Incorrect method" });
  }

  let textParameters = "";

  if ((method === "POST" || method === "PUT") && event.body) {
    const { parameters } = JSON.parse(event.body);

    if (!parameters) {
      return handleResponse(400, {
        error: "status 400 : Incorrect body parameter",
      });
    }

    parameters.forEach((param) => {
      if (typeof param === "string") {
        textParameters += `"${param}",`;
      } else {
        textParameters += `${param},`;
      }
    });
  }

  const generatePresignedUrl = setGeneratePresignedUrl(user_id);

  const sandbox = {
    generatePresignedUrl,
  };

  const vm = new NodeVM({
    console: "inherit",
    sandbox: sandbox,
    require: {
      external: {
        modules: ["lodash", "axios", "dayjs"],
      },
      root: "./",
    },
  });

  try {
    const result = await vm.run(
      `${code} module.exports = APIFunction(${textParameters});`,
      "./node_modules/axios",
      "./node_modules/lodash",
      "./node_modules/dayjs",
    );

    return handleResponse(200, { result: result });
  } catch (error) {
    return handleResponse(400, { error: error.message });
  }
};

module.exports = { apiHandler };

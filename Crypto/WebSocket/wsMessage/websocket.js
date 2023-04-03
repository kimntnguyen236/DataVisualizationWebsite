// Import external libraries
const AWS = require('aws-sdk');
const db = require('database');

// Lambda function to send messages to connected clients
module.exports.getSendMessagePromises = async (message, domainName, stage) => {
  // Get connection IDs of clients
  const connectionIds = (await db.getConnectionIds()).Items;
  console.log('Connected clients:', connectionIds);

  // Create API Gateway management class
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  });

  // Try to send message to connected clients
  return connectionIds.map(async ({ ConnectionId }) => {
    try {
      const params = {
        ConnectionId,
        Data: message
      };
      await apigwManagementApi.postToConnection(params).promise();
      console.log(`Message "${message}" sent to "${ConnectionId}"`);
    } catch (error) {
      if (error.statusCode === 410) {
        console.warn(`Connection "${ConnectionId}" is gone.`);
        await db.deleteConnectionId(ConnectionId);
      } else {
        console.error(error);
        throw error;
      }
    }
  });
};

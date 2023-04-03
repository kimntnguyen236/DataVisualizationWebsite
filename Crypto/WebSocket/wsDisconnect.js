import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

// Create new DynamoDB client
const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  // Get connection ID from event
  const connId = event.requestContext.connectionId;
  console.log("Disconnecting client with ID: " + connId);

  // Parameters for deleting connection ID from DynamoDB
  const params = {
    TableName: "WebSocketClients",
    Key: {
      ConnectionId: { "S": connId }
    }
  };

  // Delete connection ID from DynamoDB
  try {
    await ddbClient.send(new DeleteItemCommand(params));
    console.log("Connection ID deleted.");

    // Return response
    return {
      statusCode: 200,
      body: "Client disconnected. ID: " + connId
    };
  } catch (err) {
    console.log("Error disconnecting client with ID: " + connId + ": " + JSON.stringify(err));
    return {
      statusCode: 500,
      body: "Server Error: " + JSON.stringify(err)
    };
  }
};

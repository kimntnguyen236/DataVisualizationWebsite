import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// Create new DynamoDB client
const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    
    // Log event
    console.log(JSON.stringify(event));
    
    // Get connection ID from event
    const connId = event.requestContext.connectionId;
    console.log("Client connected with ID: " + connId);
    
    // Parameters for storing connection ID in DynamoDB
    const params = {
    TableName: "WebSocketClients",
    Item: {
      ConnectionId: { "S": connId }
    }
    };

  // Store connection Id for later communication with client
  try {
    await ddbClient.send(new PutItemCommand(params));
    console.log("Connection ID stored.");

    // Return response
    return {
      statusCode: 200,
      body: "Client connected with ID: " + connId
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Server Error: " + JSON.stringify(err)
    };
  }
};

// Import external libraries
const AWS = require('aws-sdk');
const ws = require('websocket');

// Create new DocumentClients
const cryptoClient = new AWS.DynamoDB.DocumentClient();
const textSentimentClient = new AWS.DynamoDB.DocumentClient();

// Hard-coded domain name and stage - use when pushing messages from server to client
let domainName = 'wss://0jd4dlkrmk.execute-api.us-east-1.amazonaws.com';
let stage = 'prod';

// Lambda function entry point
exports.handler = async (event) => {
  try {
    const connId = event.requestContext.connectionId;

    // Get latest data from CryptoData table
    const cryptoData = await cryptoClient.scan({ TableName: 'CryptoData' }).promise();

    // Get latest data from TextSentiment table
    const textSentimentData = await textSentimentClient.scan({ TableName: 'TextSentiment' }).promise();

    // Allocate domain name and stage dynamically
    domainName = event.requestContext.domainName;
    stage = event.requestContext.stage;
    console.log(`Domain: ${domainName} stage: ${stage}`);

    // Send latest data to client
    const message = JSON.stringify({ cryptoData, textSentimentData });
    await ws.sendMessage(connId, message, domainName, stage);

    // Broadcast the latest data to all connected clients
    const sendMessagePromises = await ws.getSendMessagePromises(message, domainName, stage);
    await Promise.all(sendMessagePromises);

  } catch(err) {
    return { statusCode: 500, body: `Error: ${JSON.stringify(err)}` };
  }

  // Success
  return { statusCode: 200, body: 'Data sent successfully.' };
};

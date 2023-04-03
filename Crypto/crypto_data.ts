const axios = require('axios');
import { DynamoDBClient, BatchWriteItemCommand, UpdateTableCommand } from "@aws-sdk/client-dynamodb";

// Define interface for response data from Alpha Vantage API
interface AlphaVantageData {
    [key: string]: {
        [key: string]: string
    }
}

async function uploadDataToDynamoDB(data: any[]) {
    // Create new DynamoDBClient
    const client = new DynamoDBClient({
        region: "us-east-1",
        endpoint: "https://dynamodb.us-east-1.amazonaws.com"
    });

    // Batch data into chunks of 25 items each
    const chunkSize = 25;
    const chunks: any[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    // Remove duplicates from each chunk
    const chunksWithoutDuplicates: any[][] = [];
    for (let chunk of chunks) {
        const uniqueItems = Array.from(new Set(chunk.map((item) => JSON.stringify(item)))).map((itemString) => JSON.parse(itemString));
        chunksWithoutDuplicates.push(uniqueItems);
    }

    // Upload data to DynamoDB in parallel
    const promises = chunks.map(async (chunk) => {
        const params = {
            RequestItems: {
                "CryptoData": chunk.map((item) => ({
                    PutRequest: {
                        Item: {
                            Currency: { S: item.Currency },
                            PriceTimeStamp: { N: item.PriceTimeStamp.toString() },
                            Price: { N: item.Price.toString() }
                        }
                    }
                }))
            }
        };
        try {
            const command = new BatchWriteItemCommand(params);
            const response = await client.send(command);
            console.log(`Uploaded ${chunk.length} items to DynamoDB`);
        } catch (err) {
            console.error(`Error uploading data to DynamoDB: ${err}`);
        }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
}

async function downloadDataFromAlphaVantage(symbol: string) {
    const apiKey = "AK084GQ67JCBRS4Z";
    const url = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${apiKey}`;
    try {
        const response = await axios.get(url);
        const data: AlphaVantageData = response.data;

        // Map data to an array of objects that can be uploaded to DynamoDB
        const dataArray: { Currency: string, PriceTimeStamp: number, Price: number }[] = [];
        for (let date in data["Time Series (Digital Currency Daily)"]) {
            const item = {
                Currency: symbol,
                PriceTimeStamp: new Date(date).getTime(),
                Price: parseFloat(data["Time Series (Digital Currency Daily)"][date]["4b. close (USD)"])
            };
            dataArray.push(item);
        }
        return dataArray;
    } catch (error) {
        console.error(`Error downloading data for ${symbol}: ${error}`);
        return null;
    }
}

async function downloadAndUploadToDynamoDB(symbol: string) {
    try {
        // Download data from Alpha Vantage API
        const data = await downloadDataFromAlphaVantage(symbol);

        // check if the data array is empty or null
        if (!data || data.length === 0) {
            console.error(`No data found for ${symbol}`);
            return;
        }

        // Upload data to DynamoDB
        await uploadDataToDynamoDB(data);
        console.log(`Uploaded data for ${symbol} to DynamoDB`);
    } catch (error) {
        console.error(`Error processing ${symbol}: ${error}`);
    }
}


async function updateTableThroughput(tableName: string, readCapacityUnits: number, writeCapacityUnits: number) {
    // Create new DynamoDBClient
    const client = new DynamoDBClient({ region: "us-east-1" });
    // creates an object params with the table name and the new read and write capacity units
    const params = {
        TableName: tableName,
        BillingMode: "PROVISIONED",
        ProvisionedThroughput: {
            ReadCapacityUnits: readCapacityUnits,
            WriteCapacityUnits: writeCapacityUnits,
        },
    };
    try {

        const command = new UpdateTableCommand(params);
        const response = await client.send(command);
        console.log(`Table ${tableName} throughput updated`);
    } catch (err) {
        console.error(`Error updating table ${tableName} throughput: ${err}`);
    }
}

// Call the updateTableThroughput function with the table name and the desired read and write capacity units
updateTableThroughput("CryptoData", 50, 50);

// Call downloadAndUploadToDynamoDB function for BTC, ETH, XRP, DOGE
downloadAndUploadToDynamoDB("BTC");
downloadAndUploadToDynamoDB("ETH");
downloadAndUploadToDynamoDB("XRP");
downloadAndUploadToDynamoDB("DOGE");
downloadAndUploadToDynamoDB("DOT");

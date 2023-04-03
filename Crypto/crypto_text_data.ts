import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { detect } from 'langdetect';
const axios = require('axios');

interface Item {
  symbol: string;
  timestamp: number;
  title: string;
}

async function uploadDataToDynamoDB(data: Item[]) {
  // Create new DynamoDBClient
  const client = new DynamoDBClient({ region: "us-east-1" });

  // Batch data into chunks of 25 items each
  const chunks: Item[][] = [];
  const chunkSize = 25;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  // Remove duplicates from each chunk
  const chunksWithoutDuplicates: Item[][] = [];
  for (let chunk of chunks) {
    const uniqueItems = Array.from(new Set(chunk.map((item) => JSON.stringify(item)))).map((itemString) => JSON.parse(itemString));
    chunksWithoutDuplicates.push(uniqueItems);
  }

  // Upload data to DynamoDB in parallel
  const promises = chunksWithoutDuplicates.map(async (chunk) => {
    const params = {
      RequestItems: {
        "TextData": chunk.map((item) => ({
          PutRequest: {
            Item: {
              CryptoSymbol: { S: item.symbol },
              CryptoTimeStamp: { N: item.timestamp.toString() },
              Title: { S: item.title }
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


async function downloadDataFromNewsAPI(symbol: string): Promise<Item[] | null> {
  const apiKey = "27340958cb7941d08d80f6e5dc711962";
  const url = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const { articles } = response.data;

    const dataArray: Item[] = [];
    for (const article of articles) {
      const { title, publishedAt } = article;

      const item: Item = {
        symbol,
        timestamp: Date.parse(publishedAt),
        title,
      };
      dataArray.push(item);
    }

    return dataArray;
  } catch (err) {
    console.error(`Error downloading data from News API: ${err}`);
    return null;
  }
}

async function main() {
  const symbols = ["BTC", "ETH", "XRP", "DOGE", "DOT"];
  const data = await Promise.all(symbols.map(downloadDataFromNewsAPI));
  const filteredData = data.filter((item): item is Item[] => item !== null);
  const flattenedData = filteredData.flat();
  await uploadDataToDynamoDB(flattenedData);
}
// Example
// async function main() {
//     const symbol = "BTC"; // Bitcoin
//     const data = await downloadDataFromNewsAPI(symbol);
//     if (data !== null) {
//         await uploadDataToDynamoDB(data);
//     }
// }

main();

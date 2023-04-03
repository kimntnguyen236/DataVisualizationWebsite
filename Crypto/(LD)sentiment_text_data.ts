import { DynamoDBClient, ScanCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ComprehendClient, DetectSentimentCommand } from "@aws-sdk/client-comprehend";

const ddb = new DynamoDBClient({ region: 'us-east-1' });
const comprehend = new ComprehendClient({ region: 'us-east-1' });

export const handler = async (event) => {
    try {
        const scanParams = {
            TableName: 'TextData'
        };
        const scanResult = await ddb.send(new ScanCommand(scanParams));
        
        const putRequests = scanResult.Items.map(async item => {
            const cryptoSymbol = item.CryptoSymbol?.S;
            const cryptoTimeStamp = item.CryptoTimeStamp?.N;
            const title = item.Title?.S;
            
            if (!cryptoSymbol || !cryptoTimeStamp || !title) {
                console.log("Skipping record with missing attributes");
                return null;
            }
            
            const params = {
                LanguageCode: 'en',
                Text: title
            };
            try {
                const sentimentResult = await comprehend.send(new DetectSentimentCommand(params));
                const sentiment = sentimentResult.Sentiment;

                const sentimentItem = {
                    CryptoSymbol: {S: cryptoSymbol},
                    CryptoTimeStamp: {N: cryptoTimeStamp},
                    Sentiment: {S: sentiment}
                };

                const putParams = {
                    TableName: 'TextSentiment',
                    Item: sentimentItem
                };

                await ddb.send(new PutItemCommand(putParams));
                console.log(`Stored sentiment data for ${cryptoSymbol} at ${cryptoTimeStamp}`);

                return true;
            } catch (err) {
                console.error(`Error analyzing sentiment data for ${cryptoSymbol} at ${cryptoTimeStamp}: ${err}`);
                return null;
            }
        });
        
        const items = await Promise.all(putRequests);
        const itemCount = items.filter(Boolean).length;
        
        console.log(`Stored sentiment data for ${itemCount} records`);
        
    } catch (err) {
        console.error(`Error analyzing and storing sentiment data: ${err}`);
    }
};

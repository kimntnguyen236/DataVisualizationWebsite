"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var axios = require('axios');
function uploadDataToDynamoDB(data) {
    return __awaiter(this, void 0, void 0, function () {
        var client, chunks, chunkSize, i, chunk, chunksWithoutDuplicates, _i, chunks_1, chunk, uniqueItems, promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new client_dynamodb_1.DynamoDBClient({ region: "us-east-1" });
                    chunks = [];
                    chunkSize = 25;
                    for (i = 0; i < data.length; i += chunkSize) {
                        chunk = data.slice(i, i + chunkSize);
                        chunks.push(chunk);
                    }
                    chunksWithoutDuplicates = [];
                    for (_i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
                        chunk = chunks_1[_i];
                        uniqueItems = Array.from(new Set(chunk.map(function (item) { return JSON.stringify(item); }))).map(function (itemString) { return JSON.parse(itemString); });
                        chunksWithoutDuplicates.push(uniqueItems);
                    }
                    promises = chunksWithoutDuplicates.map(function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                        var params, command, response, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    params = {
                                        RequestItems: {
                                            "TextData": chunk.map(function (item) { return ({
                                                PutRequest: {
                                                    Item: {
                                                        CryptoSymbol: { S: item.symbol },
                                                        CryptoTimeStamp: { N: item.timestamp.toString() },
                                                        Title: { S: item.title }
                                                    }
                                                }
                                            }); })
                                        }
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    command = new client_dynamodb_1.BatchWriteItemCommand(params);
                                    return [4 /*yield*/, client.send(command)];
                                case 2:
                                    response = _a.sent();
                                    console.log("Uploaded ".concat(chunk.length, " items to DynamoDB"));
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    console.error("Error uploading data to DynamoDB: ".concat(err_1));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Wait for all promises to resolve
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    // Wait for all promises to resolve
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function downloadDataFromNewsAPI(symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, url, response, articles, dataArray, _i, articles_1, article, title, publishedAt, item, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiKey = "27340958cb7941d08d80f6e5dc711962";
                    url = "https://newsapi.org/v2/everything?q=".concat(symbol, "&apiKey=").concat(apiKey);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios.get(url)];
                case 2:
                    response = _a.sent();
                    articles = response.data.articles;
                    dataArray = [];
                    for (_i = 0, articles_1 = articles; _i < articles_1.length; _i++) {
                        article = articles_1[_i];
                        title = article.title, publishedAt = article.publishedAt;
                        item = {
                            symbol: symbol,
                            timestamp: Date.parse(publishedAt),
                            title: title
                        };
                        dataArray.push(item);
                    }
                    return [2 /*return*/, dataArray];
                case 3:
                    err_2 = _a.sent();
                    console.error("Error downloading data from News API: ".concat(err_2));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var symbols, data, filteredData, flattenedData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    symbols = ["BTC", "ETH", "XRP", "DOGE", "DOT"];
                    return [4 /*yield*/, Promise.all(symbols.map(downloadDataFromNewsAPI))];
                case 1:
                    data = _a.sent();
                    filteredData = data.filter(function (item) { return item !== null; });
                    flattenedData = filteredData.flat();
                    return [4 /*yield*/, uploadDataToDynamoDB(flattenedData)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
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

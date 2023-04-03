function loadData(currency) {
  AWS.config.update({
    accessKeyId:'ASIA5VKW5UYKBCLKWX7T',
    secretAccessKey: 'n0fPZM2YU9QTrXt40Ic2nU5ZHsmF9adt1ThDjNpy',
    sessionToken: 'FwoGZXIvYXdzELT//////////wEaDH+m3Dwih3+BdBkrDiK7AZ3mfdIJXqeQX9NoWRlA9DVXXa76o/MveSdyMyRmuSq6YyAUzuXvXFGV3UkBsS8Cje7w/KsxiA944FTsys6uAOMpuZ1AflpBD5UsIGpjShSjdjMR6EKsVmc96xKRqkdZ0O429VQuLzr7Biqwx0mwldDs60C1bYc1RGp2w7eLfoUTMDhq4EADNI91Yo/CIw+VA4nZLMWaaFET09cwK0JbZrNXy4iUT+9aE/yAwd4x8mhigELyXMaSTh/FgEcoyqqXoQYyLRDiHIqgTlENw3Vhdgbjf/oOTDkDGv3f40QVvvf2SaAJR8nsOCb2imL1BmrJhA==',
    region: 'us-east-1'
  });

/*
// Code for WebSockets
something wrong?
function loadData(currency) {
  // AWS.config.update({
  //   accessKeyId:'ASIA5VKW5UYKOZZ7IQM6',
  //   secretAccessKey: 'rU2Ag16JRaIn7DbgEaujHks9Yzy53pEjfwzHIPUN',
  //   sessionToken: 'FwoGZXIvYXdzEIb//////////wEaDAyMu/eX1yk5MBx97iK7AcNZ7m8Fypa7T2BzckY950QO0gulNnVN+p24latnFmImkxZzoMypzOLnEVCMpv6m81drOXBvqtt+iDnV9EBENvqlXDt0MK4J1kP9wrgTwaZuXHI89ihY59Yfgvx5IQNv96uEqnxkAYncDjHEIwjXagGe470XvmjFCC2wAjwuBVqoiZbsYGUjlqoMVnAbrtSnpxpxeRiYx6Fd2do+a0BeC0SGvP2atE895cPLNXvp6Kp14reJ0vwmDQpRPmIo0JKNoQYyLbpRtKsL0TGlJaPD2V4uQy9qJocQYZTKv3yVmHH+VEafD0pSpEHrsbDiyvMdkQ==',
  //   region: 'us-east-1'
  // });

  const socket = new WebSocket('wss://0jd4dlkrmk.execute-api.us-east-1.amazonaws.com/prod');

  socket.addEventListener('open', function (event) {
    console.log('WebSocket connection opened.');
  });

  socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    console.log('WebSocket message received:', data);

    // Reload the historical and sentiment data
    loadHistoricalData(currency, data.cryptoData);
    loadSentimentData(currency, data.textSentimentData);
  });

  socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed.');
  });

  loadChartData(currency);
  loadSyntheticData();
}

function loadHistoricalData(currency, data) {
  // Extract the data points from the WebSocket message
  var items = data.cryptoData.Items.filter(item => item.Currency === currency);
  var prices = items.map(item => item.Price);
  var timestamps = items.map(item => new Date(item.PriceTimeStamp).toLocaleDateString());

  // Sort the data by the timestamps in ascending order
  var sortedData = items.sort((a, b) => new Date(a.PriceTimeStamp) - new Date(b.PriceTimeStamp));
  var sortedPrices = sortedData.map(item => item.Price);
  var sortedTimestamps = sortedData.map(item => new Date(item.PriceTimeStamp).toLocaleDateString());

  // Plot the data using Plotly
  var trace = {
    x: sortedTimestamps,
    y: sortedPrices,
    type: 'scatter'
  };
  var layout = {
    title: currency + ' Historical Prices'
  };
  var data = [trace];
  Plotly.newPlot('historical-chart-container', data, layout);
}

function loadSentimentData(currency, data) {
  // Extract sentiment data from the WebSocket message
  var items = data.textSentimentData.Items.filter(item => item.CryptoSymbol === currency);
  var sentiments = items.map(item => item.Sentiment);

  // Count the number of occurrences of each sentiment
  var counts = {
    'POSITIVE': 0,
    'NEUTRAL': 0,
    'NEGATIVE': 0,
    'MIXED': 0
  };
  sentiments.forEach(sentiment => counts[sentiment]++);

  // Generate the plot using Plotly
  var trace = {
    labels: Object.keys(counts),
    values: Object.values(counts),
    type: 'pie'
  };
  var layout = {
    title: currency + ' Sentiment Analysis'
  };
  var data = [trace];
  Plotly.newPlot('sentiment-chart-container', data, layout);
}

*/

  loadHistoricalData(currency);
  loadSentimentData(currency);
  loadChartData(currency);
  loadSyntheticData();
}

function loadHistoricalData(currency) {
  // Create a DynamoDB instance
  var dynamoDB = new AWS.DynamoDB.DocumentClient();

  // Query the CryptoData table for historical data for the selected currency
  var params = {
    TableName: 'CryptoData',
    KeyConditionExpression: '#c = :currency',
    ExpressionAttributeNames: {
      '#c': 'Currency'
    },
    ExpressionAttributeValues: {
      ':currency': currency
    },
    ScanIndexForward: false,
    Limit: 200
  };
  dynamoDB.query(params, function (err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Success', data);

      // Extract the data points from the DynamoDB response
      var prices = data.Items.map(function (item) {
        return item.Price;
      });
      var timestamps = data.Items.map(function (item) {
        return new Date(item.PriceTimeStamp).toLocaleDateString();
      });

      // Sort the data by the timestamps in ascending order
      var sortedData = data.Items.sort(function (a, b) {
        return new Date(a.PriceTimeStamp) - new Date(b.PriceTimeStamp);
      });
      var sortedPrices = sortedData.map(function (item) {
        return item.Price;
      });
      var sortedTimestamps = sortedData.map(function (item) {
        return new Date(item.PriceTimeStamp).toLocaleDateString();
      });

      // Plot the data using Plotly
      var trace = {
        x: sortedTimestamps,
        y: sortedPrices,
        type: 'scatter'
      };
      var layout = {
        title: currency + ' Historical Prices'
      };
      var data = [trace];
      Plotly.newPlot('historical-chart-container', data, layout);
    }
  });
}

function loadSentimentData(currency) {
  var docClient = new AWS.DynamoDB.DocumentClient();

  // Query the TextSentiment table for the given currency symbol
  var params = {
    TableName: 'TextSentiment',
    KeyConditionExpression: 'CryptoSymbol = :symbol',
    ExpressionAttributeValues: {
      ':symbol': currency,
    },
  };
  docClient.query(params, function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    // Extract sentiment data from the query result
    var sentiments = data.Items.map(item => item.Sentiment);
    // Count the number of occurrences of each sentiment
    var counts = {
      'POSITIVE': 0,
      'NEUTRAL': 0,
      'NEGATIVE': 0,
      'MIXED': 0
    };
    sentiments.forEach(function (sentiment) {
      counts[sentiment]++;
    });
    // Generate the plot using Plotly
    var plotData = [{
      values: Object.values(counts),
      labels: Object.keys(counts),
      type: 'pie',
    }];
    var plotLayout = {
      title: 'Sentiment Analysis for ' + currency,
      height: 500,
      width: 600
    };
    Plotly.newPlot('sentiment-chart-container', plotData, plotLayout);
  });
}

function loadSyntheticData() {
  // load real data from API
  const realDataXHR = new XMLHttpRequest();
  realDataXHR.open('GET', 'M00898110.json', true);
  realDataXHR.onload = () => {
    if (realDataXHR.readyState === realDataXHR.DONE && realDataXHR.status === 200) {
      const realData = JSON.parse(realDataXHR.responseText);
      const xValuesReal = realData.target.map((_, index) => index);
      const nRealData = xValuesReal.length; // store length of real data

      // create array of 0 to n-1
      const realDataTrace = {
        x: xValuesReal,
        y: realData.target,
        type: "scatter",
        mode: "line",
        name: "Original Data",
        marker: {
          color: "rgb(63, 127, 191)",
          size: 12,
        },
      };

      // create plot layout
      const layout = {
        title: "Machine Learning Result",
        xaxis: {
          title: "Time (hours)"
        },
        yaxis: {
          title: "Value"
        }
      };

      // load predicted data from JSON file
      const predictedDataXHR = new XMLHttpRequest();
      predictedDataXHR.open('GET', 'SyntheticDataResult.json', true);
      predictedDataXHR.onload = () => {
        if (predictedDataXHR.readyState === predictedDataXHR.DONE && predictedDataXHR.status === 200) {
          const predictedData = JSON.parse(predictedDataXHR.responseText);

          // create x values for predicted data
          const xValuesPred = [];
          for (let i = 0; i < predictedData.predictions[0].mean.length; ++i) {
            xValuesPred.push(i + nRealData); // shift x-values by length of real data
          }

          // create data traces for predicted data
          const predictedDataTrace = {
            x: xValuesPred,
            y: predictedData.predictions[0].mean,
            type: "scatter",
            mode: 'line',
            name: "Mean",
            marker: {
              color: 'rgb(219, 64, 82)',
              size: 12
            }
          };

          // combine real and synthetic data traces
          const data = [realDataTrace, predictedDataTrace];

          // sort data traces by their x values
          data.sort((a, b) => a.x[0] - b.x[0]);

          //plot the data
          Plotly.newPlot('prediction-SD-chart-container', data, layout);
        }
      }
      predictedDataXHR.send();
    }
  };
  realDataXHR.send();
}

function loadChartData(currency) {
  // load real data from API
  const realDataXHR = new XMLHttpRequest();
  realDataXHR.open('GET', `${currency}.json`, true);
  realDataXHR.onload = () => {
    if (realDataXHR.readyState === realDataXHR.DONE && realDataXHR.status === 200) {
      const realData = JSON.parse(realDataXHR.responseText);
      const xValuesReal = realData.target.map((_, index) => index);
      const nRealData = xValuesReal.length; // store length of real data

      // create array of 0 to n-1
      const realDataTrace = {
        x: xValuesReal,
        y: realData.target,
        type: "scatter",
        mode: "line",
        name: "Original Data",
        marker: {
          color: "rgb(63, 127, 191)",
          size: 12,
        },
      };

      // create plot layout
      const layout = {
        title: "Machine Learning Result for " + currency,
        xaxis: {
          title: "Time (hours)"
        },
        yaxis: {
          title: "Value"
        }
      };

      // load predicted data from JSON file
      const predictedDataXHR = new XMLHttpRequest();
      predictedDataXHR.open('GET', `${currency}Result.json`, true);
      predictedDataXHR.onload = () => {
        if (predictedDataXHR.readyState === predictedDataXHR.DONE && predictedDataXHR.status === 200) {
          const predictedData = JSON.parse(predictedDataXHR.responseText);

          // create x values for predicted data
          const xValuesPred = [];
          for (let i = 0; i < predictedData.predictions[0].mean.length; ++i) {
            xValuesPred.push(i + nRealData); // shift x-values by length of real data
          }

          // create data traces for predicted data
          const predictedDataTrace = {
            x: xValuesPred,
            y: predictedData.predictions[0].mean,
            type: "scatter",
            mode: 'line',
            name: "Mean",
            marker: {
              color: 'rgb(219, 64, 82)',
              size: 12
            }
          };

          // combine real and synthetic data traces
          const data = [realDataTrace, predictedDataTrace];

          // sort data traces by their x values
          data.sort((a, b) => a.x[0] - b.x[0]);

          //plot the data
          Plotly.newPlot('prediction-chart-container', data, layout);
        }
      }
      predictedDataXHR.send();
    }
  };
  realDataXHR.send();
}

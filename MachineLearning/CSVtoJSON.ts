const fs = require('fs');
const csv = require('csvtojson');

csv()
    .fromFile('BTC.csv')
    .then((rows) => {
        const target = rows.map((row) => parseFloat(row.Price));
        const cat = [{ Currency: rows[0].Currency }];
        const date = new Date(parseInt(rows[0].PriceTimeStamp));
        const start = date.toISOString();
        const data = {
            start,
            cat,
            target
        };
          
        fs.writeFile('BTC_test.json', JSON.stringify(data), (err) => {
            if (err) throw err;
            console.log('Data saved to file');
        });
    });

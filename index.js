// Write your answer here
const axios = require('axios');

let csvToJson = require('convert-csv-to-json');

// Convert all transactions to json
let data = csvToJson.fieldDelimiter(',').getJsonFromCsv("data/transactions.csv");

// Holds balances per token in USD
let balance = {};

// Sort from most recent to least recent transaction
data = data.sort((a,b) => b.timestamp - a.timestamp);

/**
 * 
 * @param {Array} data 
 */
async function printPortfolioBalances(data) {
    for(let i = data.length - 1; i >= 0; i--) {
        const item = data[i];

        // Used to add or subtract from balance
        let factor;

        if(item.transaction_type === 'DEPOSIT') {
            factor = 1;
        } else if ((item.transaction_type === 'WITHDRAWAL')) {
            factor = -1;
        }

        if(balance[item.token]) { // If token is present in memory add or subtract that amount from balance
            balance[item.token] += factor * parseFloat(item.amount);
        } else {
            // If token is not present store the token balance in memory
            balance[item.token] = factor * parseFloat(item.amount);
        }
    }

    
    // Convert to USD
    for (const [key, value] of Object.entries(balance)) {
        const rate = (await getRate(key, 'USD')).USD;
        balance[key] = value *  parseFloat(rate);
    }
    
    console.log(balance); // Print the balances of each token
}


/**
 * Gets the rate of a particular token based on tokens or currencies provided
 * @param {String} from 
 * @param {String} to 
 * @returns 
 */
async function getRate(from, to) {
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`;
    const promise = new Promise((resolve, reject) => {
        axios
        .get(url)
        .then(res => {
          resolve(res.data);
        })
        .catch(error => {
          reject(error);
        });
    });
    return await promise;
}

printPortfolioBalances(data);
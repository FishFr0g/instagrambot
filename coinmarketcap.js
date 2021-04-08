/*const request = require("request");

const options = {
  url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SAFEMOON",
  headers: {
    "X-CMC_PRO_API_KEY": "5213e698-66c4-46a2-8132-b5861c752fa8",
  },
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    const info = JSON.parse(body);
    console.log(info.data.SAFEMOON.quote.USD.price);
  }

  if (error) sconsole.log(error);
}

request(options, callback);*/

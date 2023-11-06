const express = require("express");
const Web3 = require('web3');
const axios = require("axios");
const cors = require("cors");
const cron = require('node-cron');
const app = express();
const port = 3001;
const ABI = require("./abi.json");
app.use(express.json());
app.use(cors());
require('dotenv').config();


//to keep changing between 2 api's just for test

const alchemyURLs = [process.env.ALCHEMY_URL, process.env.ALCHEMY_URL2];
let currentURLIndex = 0;
const toggleAlchemyURL = () => {
  currentURLIndex = (currentURLIndex + 1) % alchemyURLs.length;
  // console.log(`Switched to Alchemy URL: ${alchemyURLs[currentURLIndex]}`);
};
let interval = 20000;
setInterval(toggleAlchemyURL, interval)
//-------------------------------------------------------------------------//

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0, 4)}...${transaction[3].slice(0, 4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}

app.get("/getNameAndBalance", async (req, res) => {

  const web3 = new Web3(new Web3.providers.HttpProvider(alchemyURLs[currentURLIndex]));

  const { userAddress } = req.query;

  const contract = new web3.eth.Contract(ABI, "0x1a8ADF45C6fD606203F6EE640e0f748E7cdF85A1");

  try {
    const jsonResponseName = await contract.methods.getMyName(userAddress).call();

    web3.eth.getBalance(userAddress).then(async (secResponse) => {
      const balanceInWei = secResponse;
      const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');
      const balanceUpTo2Decimal = parseFloat(balanceInEther).toFixed(2);

      // INR from CoinGecko API
      const coingeckoApiResponse = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=inr");

      if (coingeckoApiResponse.status === 200) {
        const inrPrice = coingeckoApiResponse.data["matic-network"].inr;
        const jsonResponseDollars = (balanceUpTo2Decimal * inrPrice).toFixed(2);

        // History
        contract.methods.getMyHistory(userAddress).call(async (error, historyResponse) => {
          const historyData = historyResponse;
          const jsonResponseHistory = Array.isArray(historyData) ? convertArrayToObjects(historyData) : [];

          // getMyRequests
          contract.methods.getMyRequests(userAddress).call((requestError, requestsResponse) => {
            const jsonResponseRequests = requestsResponse;

            const jsonResponse = {
              name: jsonResponseName,
              balance: balanceUpTo2Decimal,
              inr: jsonResponseDollars,
              history: jsonResponseHistory,
              requests: jsonResponseRequests
            };

            return res.status(200).json(jsonResponse);
          });
        });
      } else {
        return res.status(500).json({ error: "Failed to fetch USD price from CoinGecko" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while fetching user data" });
  }
});

app.listen(port, () => {
  console.log(`Listening for API Calls on port ${port}`);
});

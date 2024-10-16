require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true, 
        runs: 200      
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.pulsechain.com",
      },
      tracing: {
        enabled: false,
      },
    },
  },
};

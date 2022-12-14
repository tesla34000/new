"use strict";

/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const DOGE_ADDRESS = '0xdee35eBa776F3A8dc09c778570D36976B0D52672'; 
const PRE_SALE_ADDRESS = '0xA83f4c3e621E911aBe61885b0F2272A36D455Bb8'; 

const ethAmount = document.querySelector("#ethAmount");
const dogeEthAmount = document.querySelector("#dogeEthAmount");
const usdtAmount = document.querySelector("#usdtAmount");
const dogeUsdtAmount = document.querySelector("#dogeUsdtAmount");
const myDogeBalance = document.querySelector("#myDogeBalance");
const myDogeBalanceValue = document.querySelector("#myDogeBalanceValue");
const myDogeBalanceAddress = document.querySelector("#myDogeBalanceAddress");
const usdtError = document.querySelector("#usdtError");
const ethError = document.querySelector("#ethError");
const buyDogeProcessing = document.querySelectorAll(".buy-doge-processing");
const buyDoge = document.querySelectorAll(".buy-doge");
const showTxHash = document.querySelectorAll(".showTxHash");
const txHashDom = document.querySelectorAll(".txHash");
const showTxHashLink = document.querySelectorAll(".showTxHashLink");

function showProcessing() {
  [].forEach.call(buyDogeProcessing, function (item) {
    item.style.display = "block";
  });
  [].forEach.call(buyDoge, function (item) {
    item.style.display = "none";
  });
}

function hideProcessing() {
  [].forEach.call(buyDogeProcessing, function (item) {
    item.style.display = "none";
  });
  [].forEach.call(buyDoge, function (item) {
    item.style.display = "block";
  });
}

function start_and_end(str) {
  if (str.length > 35) {
    return str.substr(0, 10) + '...' + str.substr(str.length-10, str.length);
  }
  return str;
}

function showTxHashView(txHash) {
  [].forEach.call(showTxHash, function (item) {
    item.style.display = "block";
  });
  [].forEach.call(txHashDom, function (item) {
    item.innerHTML = start_and_end(txHash);
  });
  [].forEach.call(showTxHashLink, function (item) {
    item.href = "https://etherscan.io/tx/" + txHash;
  });
}

function hideTxHashView() {
  [].forEach.call(showTxHash, function (item) {
    item.style.display = "none";
  });
  [].forEach.call(txHashDom, function (item) {
    item.innerHTML = "";
  });
}

function showError(view, message) {
  view.innerHTML = message;
  view.style.display = "block";
}

function hideError(view) {
  view.style.display = "none";
}

let usdtContract;

// Web3modal instance
let web3Modal;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

let web3;
let _web3;

let preSaleContract;
let lastHitInputName;

const preSaleABI = [
  {
    inputs: [
      { internalType: "address", name: "presaleToken_", type: "address" },
      { internalType: "uint256", name: "tokenPrice_", type: "uint256" },
      { internalType: "address", name: "beneficiary_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    name: "PaymentTokensAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    name: "PaymentTokensCancel",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Released",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
    ],
    name: "SetBeneficiary",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "min", type: "uint256" },
    ],
    name: "SetMinPurchase",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenPrice",
        type: "uint256",
      },
    ],
    name: "SetPrice",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "priceFeed",
        type: "address",
      },
    ],
    name: "SetPriceFeeds",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "purchaser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "paymentToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokensAmount",
        type: "uint256",
      },
    ],
    name: "TokensPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  {
    inputs: [
      { internalType: "address[]", name: "addresses_", type: "address[]" },
    ],
    name: "acceptPaymentTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "acceptedToken",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "beneficiary",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken_", type: "address" },
      { internalType: "uint256", name: "paymentAmount_", type: "uint256" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken_", type: "address" },
      { internalType: "uint256", name: "tokenAmount_", type: "uint256" },
    ],
    name: "buyExactTokens",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "addresses_", type: "address[]" },
    ],
    name: "cancelPaymentTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "contributions",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "status_", type: "bool" }],
    name: "finalize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "getPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRaised",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken", type: "address" },
      { internalType: "uint256", name: "paymentAmount", type: "uint256" },
    ],
    name: "getTokenPresaleAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "paymentToken", type: "address" },
      { internalType: "uint256", name: "tokenReceiveAmount", type: "uint256" },
    ],
    name: "getTokenPresalePrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWithdrawableAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isFinalized",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minPurchase",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address[]", name: "beneficiaries_", type: "address[]" },
    ],
    name: "ownerClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "presaleToken",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "raised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "beneficiary_", type: "address" },
    ],
    name: "setBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "minPurchase_", type: "uint256" },
    ],
    name: "setMinPursechase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "priceFeed_", type: "address" },
    ],
    name: "setPriceFeeds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "newPrice_", type: "uint256" }],
    name: "setTokenPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "tokenBought",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokensSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "cursor", type: "uint256" },
      { internalType: "uint256", name: "size", type: "uint256" },
    ],
    name: "viewPaymenTokens",
    outputs: [
      {
        internalType: "address[]",
        name: "paymentTokenAddresses",
        type: "address[]",
      },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "viewPaymentTokensCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "uint256", name: "amount_", type: "uint256" },
    ],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];

const ercABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_upgradedAddress", type: "address" }],
    name: "deprecate",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "deprecated",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_evilUser", type: "address" }],
    name: "addBlackList",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "upgradedAddress",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "balances",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "maximumFee",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "_totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "unpause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_maker", type: "address" }],
    name: "getBlackListStatus",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    name: "allowed",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "paused",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "who", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "pause",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getOwner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "newBasisPoints", type: "uint256" },
      { name: "newMaxFee", type: "uint256" },
    ],
    name: "setParams",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "issue",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "amount", type: "uint256" }],
    name: "redeem",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "basisPointsRate",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "isBlackListed",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_clearedUser", type: "address" }],
    name: "removeBlackList",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "MAX_UINT",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_blackListedUser", type: "address" }],
    name: "destroyBlackFunds",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_initialSupply", type: "uint256" },
      { name: "_name", type: "string" },
      { name: "_symbol", type: "string" },
      { name: "_decimals", type: "uint256" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Issue",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "amount", type: "uint256" }],
    name: "Redeem",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "newAddress", type: "address" }],
    name: "Deprecate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "feeBasisPoints", type: "uint256" },
      { indexed: false, name: "maxFee", type: "uint256" },
    ],
    name: "Params",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "_blackListedUser", type: "address" },
      { indexed: false, name: "_balance", type: "uint256" },
    ],
    name: "DestroyedBlackFunds",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_user", type: "address" }],
    name: "AddedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_user", type: "address" }],
    name: "RemovedBlackList",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "Pause", type: "event" },
  { anonymous: false, inputs: [], name: "Unpause", type: "event" },
];


//0x38 : Binance smart chain
const chainId = 1;
const chainIdHex = "0x1";
const chainRPC = "https://rpc.ankr.com/eth";
const chainName = "Ethereum";
// 56
//const chainIdHex = "0x5";
// 0x56
// const chainRPC = "https://bsc-dataseed.binance.org";
//const chainRPC = "https://rpc.ankr.com/eth_goerli";
//const chainName = "Ethereum Goerli Testnet";
//0x38 : Binance smart chain

// //RopstenETH
// const chainId =  3;
// const chainIdHex = "0x3";
// const chainRPC="https://ropsten.infura.io/v3/";
// const chainName = "Ropsten Test Network";
// //RopstenETH

// //: BSC Test net
// const chainId =  97;
// const chainIdHex = "0x61";
// const chainRPC="https://data-seed-prebsc-1-s1.binance.org:8545";
// const chainName = "BSC Testnet";
// //: BSC Test net: explore: https://explorer.binance.org/smart-testnet

function numberWithCommas(x) {
	return Number(x).toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  //return Number(x).toFixed(3).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function loadContractInfo() {
  _web3 = new Web3(chainRPC);
  preSaleContract = new _web3.eth.Contract(preSaleABI, PRE_SALE_ADDRESS);
  usdtContract = new _web3.eth.Contract(ercABI, USDT_ADDRESS);
  const _dogeContract = new _web3.eth.Contract(ercABI, DOGE_ADDRESS);
  
  const [tokenPrice, tokenSold, tokenBalance, raised] = await Promise.all([
    preSaleContract.methods.tokenPrice().call(), 
    preSaleContract.methods.tokensSold().call(), 
    _dogeContract.methods.balanceOf(PRE_SALE_ADDRESS).call(), 
    preSaleContract.methods.getRaised().call()
  ])
  
  const tokenPriceValue = _web3.utils.fromWei(tokenPrice, "ether");
  const tokenSoldValue = _web3.utils.fromWei(tokenSold, "ether");
  const tokenBalanceValue = _web3.utils.fromWei(tokenBalance, "ether");
  const raisedValue = _web3.utils.fromWei(raised['0'], "ether");
  const targetValue = _web3.utils.fromWei(raised['1'], "ether");;
  let percent = Number(tokenSold)/Number(tokenBalance) * 100;
  if (percent < 2) percent = 2;
  
  [].forEach.call(document.querySelectorAll(".preSalePriceUSD"), function (item) {
    item.innerHTML = `$${tokenPriceValue}`;
  });
  
  document.querySelector("#totalSold").innerHTML = `${numberWithCommas(tokenSoldValue)}`;
  document.querySelector("#totalSupply").innerHTML = `${numberWithCommas(tokenBalanceValue)}`;
  document.querySelector("#raisedValue").innerHTML = `$${numberWithCommas(raisedValue)}`;
  document.querySelector("#targetValue").innerHTML = `$${numberWithCommas(targetValue)}`;
  document.querySelector("#progressValue").style.width = `${percent}%`;
}

/*
function loadContractInfo() {
  _web3 = new Web3(chainRPC);
  preSaleContract = new _web3.eth.Contract(preSaleABI, PRE_SALE_ADDRESS);
  usdtContract = new _web3.eth.Contract(ercABI, USDT_ADDRESS);
  const _dogeContract = new _web3.eth.Contract(ercABI, DOGE_ADDRESS);
  preSaleContract.methods.tokenPrice().call().then(v =>{
    const value = _web3.utils.fromWei(v, "ether");
    [].forEach.call(document.querySelectorAll(".preSalePriceUSD"), function (item) {
      item.innerHTML = `$${value}`;
    });
  });

  preSaleContract.methods.tokensSold().call().then(v =>{
    const value = _web3.utils.fromWei(v, "ether");
    document.querySelector("#totalSold").innerHTML = `${numberWithCommas(value)}`;
  });

  _dogeContract.methods.balanceOf(PRE_SALE_ADDRESS).call().then(v =>{
    const value = _web3.utils.fromWei(v, "ether");
    document.querySelector("#totalSupply").innerHTML = `${numberWithCommas(value)}`;
  });

  preSaleContract.methods.getRaised().call().then(v =>{
    const raisedValue = _web3.utils.fromWei(v['0'], "ether");
    const targetValue = _web3.utils.fromWei(v['1'], "ether");;
    document.querySelector("#raisedValue").innerHTML = `$${numberWithCommas(raisedValue)}`;
    document.querySelector("#targetValue").innerHTML = `$${numberWithCommas(targetValue)}`;
  });
}
*/
/**
 * Setup the orchestra
 */
function init() {
  var rpc = {};
  rpc[chainId] = chainRPC;
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: rpc,
      },
    },
  };

  console.log(providerOptions);

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  console.log("Web3Modal instance is", web3Modal);
}

function alertShow(text) {
  const alert = document.querySelector("#alert-error-https");
  alert.style.display = "block";
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled");
  $("#alert-error-https").html(text);
}

function fetchContribution() {
  if (preSaleContract) {
    preSaleContract.methods.contributions(selectedAccount).call().then(v =>{
      const value = _web3.utils.fromWei(v, "ether");
      myDogeBalanceValue.innerHTML = `${numberWithCommas(value)}`;
      myDogeBalance.style.display = "block";
    });
  }
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  web3 = new Web3(provider);

  const currentChainId = await web3.eth.getChainId();

  if (chainId != currentChainId) {
    if (provider.bridge != "https://bridge.walletconnect.org") {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }], // chainId must be in hexadecimal numbers
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: chainName,
                rpcUrls: [chainRPC],
              },
            ], // chainId must be in hexadecimal numbers
          });
        } else {
          const alert = document.querySelector("#alert-error-https");
          alert.style.display = "block";
          document
            .querySelector("#btn-connect")
            .setAttribute("disabled", "disabled");
          $("#alert-error-https").html("Please reconnect to " + chainName);
          return;
        }
      }
    } else {
      // https://ethereum.stackexchange.com/a/62217/620
      const alert = document.querySelector("#alert-error-https");
      alert.style.display = "block";
      document
        .querySelector("#btn-connect")
        .setAttribute("disabled", "disabled");
      $("#alert-error-https").html("Please reconnect to " + chainName);
      return;
    }
  }

  // Load chain information over an HTTP API
  //const chainData = evmChains.getChain(chainId);
  //document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  // console.log("Got accounts", accounts);
  selectedAccount = accounts[0];

  fetchContribution();

  myDogeBalanceAddress.innerHTML = selectedAccount;
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block";
}

/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {
  // If any current data is displayed when
  // the user is switching accounts in the wallet
  // immediate hide this data
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled");
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled");

  // preSaleContract = new web3.eth.Contract(preSaleABI, PRE_SALE_ADDRESS);
  // await reloadInfo();
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", async (accounts) => {
    selectedAccount = null;
    myDogeBalance.style.display = "none";
    if (!accounts[0]) {
      await onDisconnect();
      return;
    }
    fetchAccountData();
    // reloadInfo();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    selectedAccount = null;
    myDogeBalance.style.display = "none";
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    selectedAccount = null;
    myDogeBalance.style.display = "none";
    fetchAccountData();
  });

  provider.on("disconnect", async (error) => {
    selectedAccount = null;
    myDogeBalance.style.display = "none";
    await onDisconnect();
  });

  await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
  console.log("Killing the wallet connection", provider);

  if (provider && provider.close) {
    await provider.close();

    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;
  myDogeBalance.style.display = "none";
  myDogeBalanceValue.innerHTML = "";
  myDogeBalanceAddress.innerHTML = "";

  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}

function getTokenPreSaleAmount(paymentToken, paymentAmount, target) {
  const paymentAddress = paymentToken === "ETH" ? ETH_ADDRESS : USDT_ADDRESS;
  const paymentAmountWei = _web3.utils.toWei(paymentAmount)
  preSaleContract.methods.getTokenPresaleAmount(paymentAddress, paymentAmountWei).call().then(v =>{
    const value = _web3.utils.fromWei(v, "ether");
    console.log("felix getTokenPreSaleAmount", value)
	if(value<20000){
		showError(ethError, "Please purchase at least 20000 Dogo");
		showError(usdtError, "Please purchase at least 20000 Dogo");
	}else{
		hideError(ethError);
		hideError(usdtError);
	}
    target.value = value;
    target.disabled = false;
  });
}

function getTokenPreSalePrice(paymentToken, buyingAmount, target) {
  const paymentAddress = paymentToken === "ETH" ? ETH_ADDRESS : USDT_ADDRESS;
  const buyingAmountWei = _web3.utils.toWei(buyingAmount)
  preSaleContract.methods.getTokenPresalePrice(paymentAddress, buyingAmountWei).call().then(v => {
    const value = _web3.utils.fromWei(v, "ether");
    console.log("felix getTokenPreSalePrice", value)
    target.value = value;
    target.disabled = false;
  });
}

function debounce(fn, duration = 500) {
  var timer;
  return function() {
    clearTimeout(timer);
    timer = setTimeout(fn, duration);
  }
}

function onBuySuccess() {
  fetchContribution();
  hideProcessing();
}

async function buy() {
  if (!lastHitInputName || !preSaleContract || !selectedAccount || !provider || !web3) 
    return;
  let data;
  let value;
  let dogeValue;
  let bnValue;
  let bnString;
  let usdtBalance;
  let allowance;
  let accountBalance;
  const BN = _web3.utils.BN;
  const powerTwelve = _web3.utils.toBN(10).pow(_web3.utils.toBN(12));

  switch (lastHitInputName) {
    case 'ethAmount':
      hideError(ethError);
      showProcessing();
      //value = _web3.utils.toWei('0.0001');
	  value = _web3.utils.toWei(ethAmount.value);
      console.log("felix going to buy with eth", value);

      accountBalance = await _web3.eth.getBalance(selectedAccount);

      if (new BN(accountBalance).lt(new BN(value))) {
        showError(ethError, "Insufficient ETH balance, please check your account balance");
        hideProcessing();
        return;
      }

      data = preSaleContract.methods.buy(ETH_ADDRESS, value).encodeABI();

      provider
        .request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: selectedAccount,
              to: PRE_SALE_ADDRESS,
              value: _web3.utils.toHex(value),
              data: data,
            },
          ],
        })
        .then((txHash) => {
          console.log("felix txHash", txHash);
          showTxHashView(txHash);

          const interval = setInterval(function() {
            _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
              if (rec) {
                clearInterval(interval);
                onBuySuccess();
              }
            });
          }, 1500);
        })
        .catch((error) => {
          console.error("felix buy error", error);
          showError(ethError, "Insufficient ETH balance, please check your account balance");
          hideProcessing();
        });
      break;
    case 'dogeEthAmount':
      hideError(ethError);
      showProcessing();
      dogeValue = _web3.utils.toWei(dogeEthAmount.value);
      console.log("felix going to buy with eth at", dogeValue);
	  
      data = preSaleContract.methods.buyExactTokens(ETH_ADDRESS, dogeValue).encodeABI();
      
      value = await preSaleContract.methods.getTokenPresalePrice(ETH_ADDRESS, dogeValue).call();
      console.log("felix going to send eth", value);
      accountBalance = await _web3.eth.getBalance(selectedAccount);

      if (new BN(accountBalance).lt(new BN(value))) {
        showError(ethError, "Insufficient ETH balance, please check your account balance");
        hideProcessing();
        return;
      }

      provider
        .request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: selectedAccount,
            to: PRE_SALE_ADDRESS,
            value: _web3.utils.toHex(value),
            data: data,
          },
        ],
        })
        .then((txHash) => {
          console.log("felix txHash", txHash);
          showTxHashView(txHash);

          const interval = setInterval(function() {
            _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
              if (rec) {
                clearInterval(interval);
                onBuySuccess();
              }
            });
          }, 1500);
        })
        .catch((error) => {
          console.error("felix buy error", error);
          showError(ethError, "Insufficient ETH balance, please check your account balance");
          hideProcessing();
        });
      break;
    case 'usdtAmount':
      hideError(usdtError);
      showProcessing();
      value = _web3.utils.toWei(usdtAmount.value);
    //   bnValue = new BN(value);
    bnValue = new BN(value).div(powerTwelve);
      bnString = bnValue.toString();
      console.log("felix going to buy with usdt", value);

      usdtBalance = await usdtContract.methods.balanceOf(selectedAccount).call();
      if (bnValue.gt(new BN(usdtBalance))) {
        showError(usdtError, "Insufficient USDT balance, please check your account balance");
        hideProcessing();
        return;
      }

      usdtContract.methods.allowance(selectedAccount, PRE_SALE_ADDRESS).call().then(allowance => {
        console.log("felix allowance", allowance);

        if (bnValue.gt(new BN(allowance))) {
          console.log("felix doesn't have enough allowance");
          data = usdtContract.methods.approve(PRE_SALE_ADDRESS, bnString).encodeABI();
          provider
            .request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: selectedAccount,
                  to: USDT_ADDRESS,
                  data: data,
                },
              ],
            })
            .then((txHash) => {
              console.log("felix txHash", txHash);

              const interval = setInterval(function() {
                console.log("Attempting to get transaction receipt...");
                _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                  if (rec) {
                    console.log("felix", rec);
                    clearInterval(interval);
                    console.log("felix has enough allowance");
                    data = preSaleContract.methods.buy(USDT_ADDRESS, value).encodeABI();
                    provider
                      .request({
                        method: 'eth_sendTransaction',
                        params: [
                          {
                            from: selectedAccount,
                            to: PRE_SALE_ADDRESS,
                            data: data,
                          },
                        ],
                      })
                      .then((txHash) => {
                        console.log("felix txHash", txHash);
                        showTxHashView(txHash);
                        const interval = setInterval(function() {
                          _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                            if (rec) {
                              clearInterval(interval);
                              onBuySuccess();
                            }
                          });
                        }, 1500);
                      })
                      .catch((error) => {
                        console.error("felix buy error", error);
                        showError(ethError, "Insufficient USDT balance, please check your account balance");
                        hideProcessing();
                      });
                  }
                });
              }, 1500);
            })
            .catch((error) => console.error("felix buy error", error));
        } else {
          console.log("felix has enough allowance");
          data = preSaleContract.methods.buy(USDT_ADDRESS, value).encodeABI();
          provider
            .request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: selectedAccount,
                  to: PRE_SALE_ADDRESS,
                  data: data,
                },
              ],
            })
            .then((txHash) => {
              console.log("felix txHash", txHash);
              showTxHashView(txHash);
              const interval = setInterval(function() {
                _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                  if (rec) {
                    clearInterval(interval);
                    onBuySuccess();
                  }
                });
              }, 1500);
            })
            .catch((error) => {
              console.error("felix buy error", error);
              showError(ethError, "Insufficient USDT balance, please check your account balance");
              hideProcessing();
            });
        }
      });
      break;
    case 'dogeUsdtAmount':
      hideError(usdtError);
      showProcessing();
      dogeValue = _web3.utils.toWei(dogeUsdtAmount.value);

      value = await preSaleContract.methods.getTokenPresalePrice(USDT_ADDRESS, dogeValue).call();
      console.log("felix going to send usdt", value);
      // bnValue = new BN(value);
      bnValue = new BN(value).div(powerTwelve);
      bnString = bnValue.toString();

      usdtBalance = await usdtContract.methods.balanceOf(selectedAccount).call();
      if (bnValue.gt(new BN(usdtBalance))) {
        showError(usdtError, "Insufficient USDT balance, please check your account balance");
        hideProcessing();
        return;
      }

      allowance = await usdtContract.methods.allowance(selectedAccount, PRE_SALE_ADDRESS).call();
      console.log("felix allowance", allowance);

      if (bnValue.gt(new BN(allowance))) {
        console.log("felix doesn't have enough allowance");
        data = usdtContract.methods.approve(PRE_SALE_ADDRESS, bnString).encodeABI();
        provider
          .request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: selectedAccount,
                to: USDT_ADDRESS,
                data: data,
              },
            ],
          })
          .then((txHash) => {
            console.log("felix txHash", txHash);

            const interval = setInterval(function() {
              console.log("Attempting to get transaction receipt...");
              _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                if (rec) {
                  console.log("felix", rec);
                  clearInterval(interval);
                  console.log("felix has enough allowance");
                  data = preSaleContract.methods.buyExactTokens(USDT_ADDRESS, dogeValue).encodeABI();
                  provider
                    .request({
                      method: 'eth_sendTransaction',
                      params: [
                        {
                          from: selectedAccount,
                          to: PRE_SALE_ADDRESS,
                          data: data,
                        },
                      ],
                    })
                    .then((txHash) => {
                      console.log("felix txHash", txHash);
                      showTxHashView(txHash);
                      const interval = setInterval(function() {
                        _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                          if (rec) {
                            clearInterval(interval);
                            onBuySuccess();
                          }
                        });
                      }, 1500);
                    })
                    .catch((error) => {
                      console.error("felix buy error", error);
                      showError(ethError, "Insufficient USDT balance, please check your account balance");
                      hideProcessing();
                    });
                }
              });
            }, 1500);
          })
          .catch((error) => console.error("felix buy error", error));
      } else {
        console.log("felix has enough allowance");
        data = preSaleContract.methods.buyExactTokens(USDT_ADDRESS, dogeValue).encodeABI();
        provider
          .request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: selectedAccount,
                to: PRE_SALE_ADDRESS,
                data: data,
              },
            ],
          })
          .then((txHash) => {
            console.log("felix txHash", txHash);
            showTxHashView(txHash);
            const interval = setInterval(function() {
              _web3.eth.getTransactionReceipt(txHash, function(err, rec) {
                if (rec) {
                  clearInterval(interval);
                  onBuySuccess();
                }
              });
            }, 1500);
          })
          .catch((error) => {
            console.error("felix buy error", error);
            showError(ethError, "Insufficient USDT balance, please check your account balance");
            hideProcessing();
          });
      }
      break;
  }
}

window.addEventListener("load", async () => {
  init();
  loadContractInfo();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  ethAmount.addEventListener('keyup', (event) => {
    dogeEthAmount.disabled = true;
    lastHitInputName = "ethAmount";
    debounce(() => getTokenPreSaleAmount("ETH", event.target.value, dogeEthAmount))();
  });
  dogeEthAmount.addEventListener('keyup', (event) => {
    ethAmount.disabled = true;
    lastHitInputName = "dogeEthAmount";
    debounce(() => getTokenPreSalePrice("ETH", event.target.value, ethAmount))();
  });
  usdtAmount.addEventListener('keyup', (event) => {
    dogeUsdtAmount.disabled = true;
    lastHitInputName = "usdtAmount";
    debounce(() => getTokenPreSaleAmount("usdt", event.target.value, dogeUsdtAmount))();
  });
  dogeUsdtAmount.addEventListener('keyup', (event) => {
    usdtAmount.disabled = true;
    lastHitInputName = "dogeUsdtAmount";
    debounce(() => getTokenPreSalePrice("usdt", event.target.value, usdtAmount))();
  });
  [].forEach.call(document.querySelectorAll(".buy-doge"), function (item) {
    item.addEventListener('click', buy);
  });
});
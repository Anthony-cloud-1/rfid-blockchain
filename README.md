# RFID-Driven Inventory Tracking with Blockchain Documentation

## Project Overview

This project implements a blockchain-based inventory tracking system using RFID (NFC) tags to manage products across three phases: **Enrollment**, **Logistics**, and **Retail**. It leverages Optimism Sepolia (a layer-2 Ethereum testnet) for cost-effective transactions, a Solidity smart contract for data storage, a Node.js server for processing NFC scans, and NTAG215 NFC tags for product identification. The system ensures secure, transparent tracking of products (e.g., pharmaceuticals, goods) in a supply chain.

### Key Components
- **MetaMask**: Browser extension for managing Ethereum accounts and signing transactions.
- **Optimism Sepolia**: Layer-2 testnet for deploying and interacting with the smart contract.
- **Alchemy**: Blockchain API provider for connecting to Optimism Sepolia.
- **Solidity Smart Contract**: Manages product data (registration, location updates, sales).
- **Node.js Server**: Handles NFC scan requests and interacts with the smart contract.
- **NTAG215 NFC Tags**: Store URLs to trigger server actions via NFC Tools.
- **NFC Tools**: Mobile app for writing and reading NFC tags.

### Phases
1. **Enrollment**: Register a product with details (Product ID, Batch Number, Expiry Date, Origin).
2. **Logistics**: Update a product’s location (e.g., "Warehouse", "Transit").
3. **Retail**: Log a sale with a date, marking the product as sold.

---

## Setup Instructions

### 1. Install and Configure MetaMask

MetaMask is used to manage your Ethereum account and sign transactions on Optimism Sepolia.

#### Steps
1. **Install MetaMask**:
   - Download the MetaMask browser extension for Chrome, Firefox, or Edge from [metamask.io](https://metamask.io).
   - Install and create a new wallet or import an existing one.
   - Securely back up your seed phrase.

2. **Add Optimism Sepolia Network**:
   - Open MetaMask, click the network dropdown (e.g., "Ethereum Mainnet"), and select "Add Network".
   - Add a custom network with these details:
     ```
     Network Name: Optimism Sepolia
     RPC URL: https://sepolia.optimism.io
     Chain ID: 11155420
     Currency Symbol: ETH
     Block Explorer URL: https://sepolia-optimism.blockscout.com
     ```
   - Save the network.

3. **Create or Import an Account**:
   - Create a new account or import the private key of an existing one:
     ```
     3c7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx6b30
     ```
   - Account address: `0xxxxxxxxxxxxxxxxxxxxxxxxx06b79`.
   - **Security Note**: Never share your private key or seed phrase. Use a test account for this project.

4. **Fund the Account**:
   - Optimism Sepolia uses test ETH, which is free.
   - Visit the [Superchain Faucet](https://app.optimism.io/faucet).
   - Enter your account address (`0xxxxxxxxxxxxxxxxxxxxxxxxx06b79`) and request test ETH (~0.1 ETH is sufficient for testing).
   - Verify the balance in MetaMask (should update within minutes).

---

### 2. Set Up Alchemy

Alchemy provides an API to connect to Optimism Sepolia for deploying and interacting with the smart contract.

#### Steps
1. **Create an Alchemy Account**:
   - Sign up at [alchemy.com](https://www.alchemy.com).
   - Create a free account or log in.

2. **Create an App**:
   - In the Alchemy dashboard, click "Create New App".
   - Set:
     - **Name**: RFID Inventory
     - **Chain**: Optimism
     - **Network**: Sepolia
   - Save and note the API key.

3. **Get the RPC URL**:
   - In the app dashboard, click "View Key".
   - Copy the HTTPS URL (e.g., `https://opt-sepolia.g.alchemy.com/v2/your-api-key`).
   - This URL connects your server and Remix to Optimism Sepolia.

---

### 3. Deploy the Smart Contract

The smart contract (`Inventory.sol`) manages product data on Optimism Sepolia, using `bytes32` keys generated via `keccak256` for security.

#### Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Inventory {
    struct Product {
        string productId;
        string batchNo;
        string expiryDate;
        string origin;
        bool exists;
        string location;
        bool sold;
        string saleDate;
    }

    mapping(bytes32 => Product) public products;

    event ProductRegistered(string productId, string batchNo, string expiryDate, string origin);
    event LocationUpdated(string productId, string newLocation);
    event SaleLogged(string productId, string saleDate);

    function getProductKey(string memory productId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(productId));
    }

    function registerProduct(
        string memory productId,
        string memory batchNo,
        string memory expiryDate,
        string memory origin
    ) public {
        bytes32 key = getProductKey(productId);
        require(!products[key].exists, "Product already registered");
        products[key] = Product(productId, batchNo, expiryDate, origin, true, "", false, "");
        emit ProductRegistered(productId, batchNo, expiryDate, origin);
    }

    function updateLocation(string memory productId, string memory newLocation) public {
        bytes32 key = getProductKey(productId);
        require(products[key].exists, "Product not found");
        products[key].location = newLocation;
        emit LocationUpdated(productId, newLocation);
    }

    function logSale(string memory productId, string memory saleDate) public {
        bytes32 key = getProductKey(productId);
        require(products[key].exists, "Product not found");
        require(!products[key].sold, "Product already sold");
        products[key].sold = true;
        products[key].saleDate = saleDate;
        emit SaleLogged(productId, saleDate);
    }

    function getProduct(string memory productId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            bool,
            string memory
        )
    {
        bytes32 key = getProductKey(productId);
        require(products[key].exists, "Product not found");
        Product memory p = products[key];
        return (p.productId, p.batchNo, p.expiryDate, p.origin, p.location, p.sold, p.saleDate);
    }
}
```


#### Deployment Steps
1. **Open Remix IDE**:
   - Go to [remix.ethereum.org](https://remix.ethereum.org).
   - Create a new file named `Inventory.sol` and paste the contract code.

2. **Compile the Contract**:
   - In the **Solidity Compiler** tab, select version `0.8.20`.
   - Click **Compile Inventory.sol**.

3. **Deploy to Optimism Sepolia**:
   - In the **Deploy & Run Transactions** tab:
     - Set **Environment** to **Injected Provider - MetaMask**.
     - Connect MetaMask and select the Optimism Sepolia network.
     - Select the `Inventory` contract.
     - Click **Deploy** and confirm the transaction in MetaMask.
   - Note the deployed contract address (e.g., `0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx524`).
   - Copy the ABI from the **Solidity Compiler** tab (under "ABI").

4. **Verify Deployment**:
   - In Remix, under **Deployed Contracts**, expand the `Inventory` contract.
   - Test by calling `registerProduct` with inputs:
     - `productId`: "PID123"
     - `batchNo`: "Batch456"
     - `expiryDate`: "Exp2024"
     - `origin`: "Ghana"
   - Call `getProduct("PID123")` to verify:
     ```
     ["PID123", "Batch456", "Exp2024", "Ghana", "", false, ""]
     ```

---

### 4. Set Up the Node.js Server

The Node.js server processes NFC scan requests, interacts with the smart contract, and handles enrollment, logistics, and retail actions.

#### Prerequisites
- **Node.js**: Install from [nodejs.org](https://nodejs.org) (version 16+ recommended).
- **Text Editor**: Use VS Code or any editor.
- **Project Directory**: Create a folder, e.g., `C:\Path\to\your_project\rfid-blockchain`.

#### Install Dependencies
1. Navigate to the project directory:
   ```bash
   cd C:\Path\to\your_project\rfid-blockchain
   ```
2. Initialize a Node.js project:
   ```bash
   npm init -y
   ```
3. Install required packages:
   ```bash
   npm install express web3 dotenv
   ```

#### Server Code
```javascript
require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const app = express();
const port = 3000;

// Connect to Optimism Sepolia via Alchemy
const web3 = new Web3(process.env.ALCHEMY_URL);

// Contract details
const contractAddress = '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxC524'; // Replace with your contract address
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "productId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "batchNo", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "expiryDate", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "origin", "type": "string"}
    ],
    "name": "ProductRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "productId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "newLocation", "type": "string"}
    ],
    "name": "LocationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "productId", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "saleDate", "type": "string"}
    ],
    "name": "SaleLogged",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "productId", "type": "string"},
      {"internalType": "string", "name": "batchNo", "type": "string"},
      {"internalType": "string", "name": "expiryDate", "type": "string"},
      {"internalType": "string", "name": "origin", "type": "string"}
    ],
    "name": "registerProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "productId", "type": "string"},
      {"internalType": "string", "name": "newLocation", "type": "string"}
    ],
    "name": "updateLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "productId", "type": "string"},
      {"internalType": "string", "name": "saleDate", "type": "string"}
    ],
    "name": "logSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "productId", "type": "string"}],
    "name": "getProduct",
    "outputs": [
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "bool", "name": "", "type": "bool"},
      {"internalType": "string", "name": "", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "productId", "type": "string"}],
    "name": "getProductKey",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "name": "products",
    "outputs": [
      {"internalType": "string", "name": "productId", "type": "string"},
      {"internalType": "string", "name": "batchNo", "type": "string"},
      {"internalType": "string", "name": "expiryDate", "type": "string"},
      {"internalType": "string", "name": "origin", "type": "string"},
      {"internalType": "bool", "name": "exists", "type": "bool"},
      {"internalType": "string", "name": "location", "type": "string"},
      {"internalType": "bool", "name": "sold", "type": "bool"},
      {"internalType": "string", "name": "saleDate", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Private key
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: PRIVATE_KEY not set in .env');
  process.exit(1);
}

// Create account
let account;
try {
  account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
  console.log('Account Address:', account.address);
} catch (error) {
  console.error('Failed to create account from private key:', error.message);
  process.exit(1);
}

// Check account balance
async function checkBalance() {
  try {
    const balance = await web3.eth.getBalance(account.address);
    console.log('Account Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
    if (balance === '0') {
      console.warn('Warning: Account has 0 ETH. Claim test ETH from Superchain Faucet.');
    }
  } catch (error) {
    console.error('Error checking balance:', error.message);
  }
}
checkBalance();

// Handle NFC Tools GET request - Register Product
app.get('/register', async (req, res) => {
  const tagId = req.query.tagid;
  const text = req.query.text;
  if (!text) {
    return res.status(400).send('No text data found');
  }
  const parts = text.split('|');
  if (parts.length !== 4) {
    return res.status(400).send('Invalid text format; expected PID|Batch|Expiry|Origin');
  }
  const [productId, batchNo, expiryDate, origin] = parts;
  console.log('Register Parsed Input:', { productId, batchNo, expiryDate, origin });
  try {
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gas = await contract.methods.registerProduct(productId, batchNo, expiryDate, origin)
      .estimateGas({ from: account.address });
    const data = contract.methods.registerProduct(productId, batchNo, expiryDate, origin).encodeABI();
    const tx = {
      from: account.address,
      to: contractAddress,
      gas: Math.min(Math.floor(gas * 1.2), 500000),
      gasPrice: web3.utils.toWei('0.1', 'gwei'),
      data: data,
      nonce: nonce
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.send(`Product ${productId} registered on blockchain. Tx: ${receipt.transactionHash}`);
  } catch (error) {
    console.error('Error registering product:', error);
    res.status(500).send(`Error registering product: ${error.message}`);
  }
});

// Handle Update Location
app.get('/updateLocation', async (req, res) => {
  const productId = req.query.productId;
  const newLocation = req.query.location;
  if (!productId || !newLocation) {
    return res.status(400).send('Missing productId or location');
  }
  console.log('Update Location Input:', { productId, newLocation });
  try {
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gas = await contract.methods.updateLocation(productId, newLocation)
      .estimateGas({ from: account.address });
    const data = contract.methods.updateLocation(productId, newLocation).encodeABI();
    const tx = {
      from: account.address,
      to: contractAddress,
      gas: Math.min(Math.floor(gas * 1.2), 500000),
      gasPrice: web3.utils.toWei('0.1', 'gwei'),
      data: data,
      nonce: nonce
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.send(`Location updated for ${productId}. Tx: ${receipt.transactionHash}`);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).send(`Error updating location: ${error.message}`);
  }
});

// Handle Log Sale
app.get('/logSale', async (req, res) => {
  const productId = req.query.productId;
  const saleDate = req.query.saleDate;
  if (!productId || !saleDate) {
    return res.status(400).send('Missing productId or saleDate');
  }
  console.log('Log Sale Input:', { productId, saleDate });
  try {
    const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
    const gas = await contract.methods.logSale(productId, saleDate)
      .estimateGas({ from: account.address });
    const data = contract.methods.logSale(productId, saleDate).encodeABI();
    const tx = {
      from: account.address,
      to: contractAddress,
      gas: Math.min(Math.floor(gas * 1.2), 500000),
      gasPrice: web3.utils.toWei('0.1', 'gwei'),
      data: data,
      nonce: nonce
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.send(`Sale logged for ${productId}. Tx: ${receipt.transactionHash}`);
  } catch (error) {
    console.error('Error logging sale:', error);
    res.status(500).send(`Error logging sale: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

```

#### Configure Environment
1. Create a `.env` file in the project directory:

```
PRIVATE_KEY=your_private_key
ALCHEMY_URL=alchemy_api_url
```

2. Create a `.gitignore` file(optional):
   ```
   .env
   node_modules/
   ```
3. Update `server.js` with your contract address if different from `0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxC524`.

#### Run the Server
1. Start the server:
   ```bash
   node server.js
   ```
2. Expected output:
   ```
   Account Address: 0xBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx6b79
   Account Balance: X ETH
   Server running at http://localhost:3000
   ```
3. Test endpoints:
   - **Register**: `http://localhost:3000/register?text=PID003|Batch003|Exp2027|Kenya`
   - **Update Location**: `http://localhost:3000/updateLocation?productId=PID003&location=Accra`
   - **Log Sale**: `http://localhost:3000/logSale?productId=PID003&saleDate=2025-05-24`

---

### 5. Configure NFC Tools and Ngrok

NFC Tools writes URLs to NTAG215 tags, which trigger server actions when scanned. Ngrok exposes the local server to the internet for mobile access.

#### Install NFC Tools
- Download **NFC Tools** from the Google Play Store or Apple App Store.
- Ensure your phone has NFC enabled (Settings > NFC).

#### Install Ngrok
1. Install Ngrok:
   - Download from [ngrok.com](https://ngrok.com) or install via npm:
     ```bash
     npm install -g ngrok
     ```
   - Alternatively, use a pre-built binary for your OS.
2. Run Ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the public URL (e.g., `https://fedc-41-215-173-30.ngrok-free.app`).

#### Write NFC Tags
1. Open NFC Tools.
2. Select **Write** > **Add a record** > **Custom URL/URI**.
3. Enter a URL for the desired action, e.g.:
   - **Enrollment**: `https://fedc-41-215-173-30.ngrok-free.app/register?text=PID003|Batch003|Exp2027|Kenya`
   - **Logistics**: `https://fedc-41-215-173-30.ngrok-free.app/updateLocation?productId=PID003&location=Accra`
   - **Retail**: `https://fedc-41-215-173-30.ngrok-free.app/logSale?productId=PID003&saleDate=2025-05-24`
4. Write the URL to an NTAG215 tag.
5. Scan to verify the URL opens correctly.

#### Byte Constraint
- NTAG215 tags have a 492-byte user memory limit.
- Each URL (e.g., ~100-150 bytes) fits well within this limit.
- Avoid complex logic (e.g., conditions, variables) on the tag to save space.

---

### 6. Use Scenarios and How to Execute

#### Enrollment Phase
**Scenario**: A manufacturer registers a new product (e.g., a pharmaceutical batch) with an NFC tag.
- **Steps**:
  1. Run `server.js` and Ngrok.
  2. Write an NFC tag with:
     ```
     https://fedc-41-215-173-30.ngrok-free.app/register?text=PID003|Batch003|Exp2027|Kenya
     ```
  3. Scan the tag with NFC Tools.
  4. The server registers the product in the smart contract.
  5. Verify:
     - Server logs: `Product PID003 registered on blockchain. Tx: 0x...`
     - Remix: Call `getProduct("PID003")` → `["PID003", "Batch003", "Exp2027", "Kenya", "", false, ""]`
     - Block Explorer: Check the transaction hash.

#### Logistics Phase
**Scenario**: A logistics provider updates the product’s location as it moves through the supply chain.
- **Steps**:
  1. Ensure the product is registered (e.g., `PID003`).
  2. Write an NFC tag with:
     ```
     https://fedc-41-215-173-30.ngrok-free.app/updateLocation?productId=PID003&location=Accra
     ```
  3. Scan the tag.
  4. The server updates the location.
  5. Verify:
     - Server logs: `Update Location Input: { productId: 'PID003', newLocation: 'Accra' }`
     - Remix: `getProduct("PID003")` → `["PID003", "Batch003", "Exp2027", "Kenya", "Accra", false, ""]`

#### Retail Phase
**Scenario**: A retailer logs a sale when the product is sold to a customer.
- **Steps**:
  1. Ensure the product is registered and located (e.g., `PID003`).
  2. Write an NFC tag with:
     ```
     https://fedc-41-215-173-30.ngrok-free.app/logSale?productId=PID003&saleDate=2025-05-24
     ```
  3. Scan the tag.
  4. The server logs the sale.
  5. Verify:
     - Server logs: `Log Sale Input: { productId: 'PID003', saleDate: '2025-05-24' }`
     - Remix: `getProduct("PID003")` → `["PID003", "Batch003", "Exp2027", "Kenya", "Accra", true, "2025-05-24"]`

#### Querying Products
- **Check a Single Product**:
  - In Remix, call `getProduct("PID003")` to retrieve details.
  - Alternatively, add a server endpoint to query products (see Future Enhancements).
- **List All Products**:
  - The current contract doesn’t support listing all products (mappings don’t allow iteration).
  - To enable this, modify the contract to store product IDs in an array (see Future Enhancements).

---

### 7. Troubleshooting

- **MetaMask**:
  - **No Funds**: Claim test ETH from [Superchain Faucet](https://app.optimism.io/faucet).
  - **Wrong Network**: Ensure Optimism Sepolia is selected.
- **Server**:
  - **Connection Error**: Verify `ALCHEMY_URL` in `.env`.
  - **Transaction Fails**:
    - Check server logs for errors (e.g., "insufficient funds", "out of gas").
    - Increase `gas` to `600000` in `server.js`.
    - Ensure sufficient test ETH.
- **NFC Tools**:
  - **URL Doesn’t Open**: Enable NFC and internet on the phone; check NFC Tools settings ("Open URL").
  - **Invalid Format**: Ensure the URL has correct syntax and parameters.
- **Contract**:
  - **Empty Output**: Verify the contract address matches the deployed instance.
  - **Reverts**: Check error messages in Remix or server logs (e.g., "Product already registered").

---

### 8. Security Notes

- **Private Key**: Store in `.env`, not in `server.js`. Never share it.
- **Contract Security**: Uses `keccak256` for mapping keys to prevent collisions.
- **Ngrok**: Free tier URLs change on restart; use a static domain for production.
- **Access Control**: Current contract allows anyone to call functions. Add `onlyOwner` or role-based access for production (see Future Enhancements).

---

### 9. Future Enhancements

- **Query All Products**:
  - Add an array to store `productId`s:
    ```solidity
    string[] public productIds;
    function registerProduct(...) public {
        ...
        productIds.push(productId);
    }
    function getAllProductIds() public view returns (string[] memory) {
        return productIds;
    }
    ```
  - Add a server endpoint to list products.
- **Access Control**:
  - Use OpenZeppelin’s `Ownable`:
    ```solidity
    import "@openzeppelin/contracts/access/Ownable.sol";
    contract Inventory is Ownable {
        constructor() Ownable(msg.sender) {}
        function registerProduct(...) public onlyOwner { ... }
    }
    ```
- **Dynamic NFC Logic**:
  - Use NFC Tools’ conditional blocks (e.g., scan counter, HTTP response checks) to handle phases on the tag, but this requires careful byte management (see next steps).
- **Frontend**:
  - Build a web app to display product details, trigger actions, or visualize supply chain data.

---

### 10. System Architecture

```
[NTAG215 Tag] --(Scan)--> [NFC Tools] --(URL)--> [Ngrok] --(HTTP)--> [Node.js Server]
                                                                           |
                                                                           v
                                                                    [Smart Contract]
                                                                   (Optimism Sepolia)
                                                                           |
                                                                           v
                                                                     [Alchemy API]
```

- **Tag**: Stores a URL (e.g., `https://ngrok-url/register?text=PID003|...`).
- **NFC Tools**: Reads the tag and opens the URL.
- **Ngrok**: Forwards requests to the local server.
- **Server**: Processes requests, signs transactions, and calls the contract.
- **Contract**: Stores and retrieves product data.
- **Alchemy**: Connects the server to Optimism Sepolia.

---

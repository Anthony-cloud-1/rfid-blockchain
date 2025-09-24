require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const app = express();
const port = 3001;

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Helper function to generate HTML response
const generateHtmlResponse = (title, message, isSuccess = true, product = null, transactionHash = null) => {
    const statusColor = isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const productDetails = product ? `
        <div class="mt-4">
            <h2 class="text-lg font-semibold">Product Details</h2>
            <table class="w-full text-left border-collapse">
                <tr class="border-b"><th class="py-2">ID</th><td class="py-2">${product.id}</td></tr>
                <tr class="border-b"><th class="py-2">Name</th><td class="py-2">${product.name}</td></tr>
                <tr class="border-b"><th class="py-2">SKU</th><td class="py-2">${product.sku}</td></tr>
                <tr class="border-b"><th class="py-2">Batch No</th><td class="py-2">${product.batchNo}</td></tr>
                <tr class="border-b"><th class="py-2">Expiry Date</th><td class="py-2">${product.expiryDate}</td></tr>
                <tr class="border-b"><th class="py-2">Origin</th><td class="py-2">${product.origin}</td></tr>
                <tr class="border-b"><th class="py-2">Location</th><td class="py-2">${product.location}</td></tr>
                <tr class="border-b"><th class="py-2">Status</th><td class="py-2">${product.status}</td></tr>
                <tr class="border-b"><th class="py-2">Sold</th><td class="py-2">${product.sold ? 'Yes' : 'No'}</td></tr>
                <tr class="border-b"><th class="py-2">Sale Date</th><td class="py-2">${product.saleDate || 'N/A'}</td></tr>
                <tr class="border-b"><th class="py-2">Price</th><td class="py-2">${product.price || 0}</td></tr>
                <tr class="border-b"><th class="py-2">Category</th><td class="py-2">${product.category}</td></tr>
                <tr class="border-b"><th class="py-2">Quantity</th><td class="py-2">${product.quantityInStock}</td></tr>
                <tr class="border-b"><th class="py-2">UID</th><td class="py-2">${product.uid}</td></tr>
                <tr><th class="py-2">Icon</th><td class="py-2">${product.icon}</td></tr>
            </table>
        </div>
    ` : '';
    const txInfo = transactionHash ? `<p class="mt-2"><strong>Transaction Hash:</strong> <a href="https://sepolia-optimism.blockscout.com/tx/${transactionHash}" target="_blank" class="text-blue-600 underline">${transactionHash}</a></p>` : '';
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full ${statusColor}">
                <h1 class="text-2xl font-bold mb-4">${title}</h1>
                <p>${message}</p>
                ${txInfo}
                ${productDetails}
                <a href="http://localhost:3000" class="mt-4 inline-block text-blue-600 underline">Back to Home</a>
            </div>
        </body>
        </html>
    `;
};

// Custom retry function
async function retry(fn, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i < retries - 1) {
                console.warn(`Attempt ${i + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

// Connect to Optimism Sepolia via Alchemy
const web3 = new Web3('https://opt-sepolia.g.alchemy.com/v2/your-unique-api-key');

// Contract details
const contractAddress = 'your-contract-address';
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum Inventory.Status",
                "name": "status",
                "type": "uint8"
            }
        ],
        "name": "LocationUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "id",
                "type": "string"
            }
        ],
        "name": "ProductDeleted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "sku",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "batchNo",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "expiryDate",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "origin",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "uid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "category",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "quantityInStock",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum Inventory.Status",
                "name": "status",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "icon",
                "type": "string"
            }
        ],
        "name": "ProductRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "saleDate",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
            }
        ],
        "name": "SaleLogged",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            }
        ],
        "name": "deleteProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            }
        ],
        "name": "getProduct",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "enum Inventory.Status",
                "name": "",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProductCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "start",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
            }
        ],
        "name": "getProductIds",
        "outputs": [
            {
                "internalType": "string[]",
                "name": "",
                "type": "string[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "saleDate",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            }
        ],
        "name": "logSale",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "productIds",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "products",
        "outputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "sku",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "batchNo",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "expiryDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "origin",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "sold",
                "type": "bool"
            },
            {
                "internalType": "string",
                "name": "saleDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "uid",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "category",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantityInStock",
                "type": "uint256"
            },
            {
                "internalType": "enum Inventory.Status",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "icon",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "sku",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "batchNo",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "expiryDate",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "origin",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "uid",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "category",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "quantityInStock",
                "type": "uint256"
            },
            {
                "internalType": "enum Inventory.Status",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "string",
                "name": "icon",
                "type": "string"
            }
        ],
        "name": "registerProduct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "id",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "location",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "internalType": "enum Inventory.Status",
                "name": "status",
                "type": "uint8"
            }
        ],
        "name": "updateLocation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Private key from .env
const privateKey = process.env.PRIVATE_KEY || 'your-wallet-private-key';
if (!privateKey) {
    console.error('Error: PRIVATE_KEY not set in .env file');
    process.exit(1);
}

// Create account
let account;
try {
    account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    console.log('Account Address:', account.address);
} catch (error) {
    console.error('Failed to create account from private key:', error.message);
    process.exit(1);
}

// Check contract ownership
async function checkOwnership() {
    try {
        const owner = await contract.methods.owner().call();
        console.log('Contract Owner:', owner);
        if (owner.toLowerCase() !== account.address.toLowerCase()) {
            console.warn('Warning: The account address does not match the contract owner.');
        }
    } catch (error) {
        console.error('Error checking contract ownership:', error.message);
    }
}
checkOwnership();

// Check account balance
async function checkBalance() {
    try {
        const balance = await web3.eth.getBalance(account.address);
        const ethBalance = web3.utils.fromWei(balance, 'ether');
        console.log('Account Balance:', ethBalance, 'ETH');
        if (balance === '0') {
            console.warn('Warning: Account has 0 ETH. Claim test ETH from Superchain Faucet: https://app.optimism.io/faucet');
        }
    } catch (error) {
        console.error('Error checking balance:', error.message);
    }
}
checkBalance();

// In-memory product cache
const productCache = new Map();

// Map status strings to enum values
const mapStatusToEnum = (status) => {
    switch (status.toLowerCase()) {
        case 'en route': return 0; // EnRoute
        case 'arrived': return 1;  // Arrived
        case 'sold': return 2;     // Sold
        default: throw new Error(`Invalid status: ${status}`);
    }
};

// Map status enum to string
const mapEnumToStatus = (statusEnum) => {
    switch (statusEnum) {
        case 0: return 'en route';
        case 1: return 'arrived';
        case 2: return 'sold';
        default: return 'unknown';
    }
};

// POST /register - UI-based product registration
app.post('/register', async (req, res) => {
    const {
        id, name, sku, batchNo, expiryDate, origin, location, uid,
        category, quantityInStock, status, icon
    } = req.body;

    if (!id || !name || !sku || !batchNo || !expiryDate || !origin || !location ||
        !uid || !category || quantityInStock === undefined || !status || !icon) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const statusEnum = mapStatusToEnum(status);
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.registerProduct(
            id, name, sku, batchNo, expiryDate, origin, location, uid,
            category, quantityInStock, statusEnum, icon
        ).estimateGas({ from: account.address });
        const data = contract.methods.registerProduct(
            id, name, sku, batchNo, expiryDate, origin, location, uid,
            category, quantityInStock, statusEnum, icon
        ).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete('products');
        productCache.delete(id);
        res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error registering product (UI):', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /register - NFC-based product registration
app.get('/register', async (req, res) => {
    const tagId = req.query.tagid || 'none';
    const text = req.query.text;
    if (!text) {
        return res.status(400).send(generateHtmlResponse(
            'Registration Failed',
            'No text data found. Please ensure the NFC tag contains valid data.',
            false
        ));
    }
    const parts = text.split('|');
    if (parts.length < 5) {
        return res.status(400).send(generateHtmlResponse(
            'Registration Failed',
            'Invalid text format. Expected: ID|Name|BN|ExpDate|Origin[|Category|Quantity]',
            false
        ));
    }
    const [productId, name, batchNo, expiryDate, origin, category = 'Others', quantity = '1'] = parts;
    const quantityInStock = parseInt(quantity, 10);
    if (isNaN(quantityInStock) || quantityInStock < 0) {
        return res.status(400).send(generateHtmlResponse(
            'Registration Failed',
            'Invalid quantity. Must be a non-negative integer.',
            false
        ));
    }
    console.log('NFC Register Input:', { productId, name, batchNo, expiryDate, origin, category, quantityInStock, tagId });

    try {
        const sku = `SKU-${productId}`;
        const location = origin;
        const uid = tagId !== 'none' ? tagId : `UID-${productId}`;
        const statusEnum = 0; // EnRoute
        const icon = 'BookReader';

        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.registerProduct(
            productId, name, sku, batchNo, expiryDate, origin, location, uid,
            category, quantityInStock, statusEnum, icon
        ).estimateGas({ from: account.address });
        const data = contract.methods.registerProduct(
            productId, name, sku, batchNo, expiryDate, origin, location, uid,
            category, quantityInStock, statusEnum, icon
        ).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete('products');
        productCache.delete(productId);

        const product = {
            id: productId, name, sku, batchNo, expiryDate, origin, location,
            sold: false, saleDate: '', uid, price: 0, category, quantityInStock,
            status: 'en route', icon
        };
        return res.status(200).send(generateHtmlResponse(
            'Product Registered',
            `Product ${productId} (${name}) successfully registered via NFC.`,
            true,
            product,
            receipt.transactionHash
        ));
    } catch (error) {
        console.error('Error registering NFC product:', error.message);
        return res.status(500).send(generateHtmlResponse(
            'Registration Failed',
            `Error registering product: ${error.message}`,
            false
        ));
    }
});

// POST /updateLocation - UI-based product location updates
app.post('/updateLocation', async (req, res) => {
    const { productId, location, price, status } = req.body;
    if (!productId || !location || price === undefined || !status) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    try {
        const statusEnum = mapStatusToEnum(status);
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.updateLocation(
            productId, location, price, statusEnum
        ).estimateGas({ from: account.address });
        const data = contract.methods.updateLocation(
            productId, location, price, statusEnum
        ).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete(productId);
        productCache.delete('products');
        res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error updating location (UI):', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /updateLocation - NFC-based location updates
app.get('/updateLocation', async (req, res) => {
    const tagId = req.query.tagid || 'none';
    const text = req.query.text;
    if (!text) {
        return res.status(400).send(generateHtmlResponse(
            'Update Failed',
            'No text data found. Please ensure the NFC tag contains valid data.',
            false
        ));
    }
    const parts = text.split('|');
    if (parts.length < 3) {
        return res.status(400).send(generateHtmlResponse(
            'Update Failed',
            'Invalid text format. Expected: ID|Location|Price|Status',
            false
        ));
    }
    const [productId, location, priceStr, status = 'arrived'] = parts;
    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price < 0) {
        return res.status(400).send(generateHtmlResponse(
            'Update Failed',
            'Invalid price. Must be a non-negative integer.',
            false
        ));
    }
    console.log('NFC Update Location Input:', { productId, location, price, status, tagId });

    try {
        const statusEnum = mapStatusToEnum(status);
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.updateLocation(
            productId, location, price, statusEnum
        ).estimateGas({ from: account.address });
        const data = contract.methods.updateLocation(
            productId, location, price, statusEnum
        ).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete(productId);
        productCache.delete('products');

        const productData = await contract.methods.getProduct(productId).call();
        const product = {
            id: productData[0],
            name: productData[1],
            sku: productData[2],
            batchNo: productData[3],
            expiryDate: productData[4],
            origin: productData[5],
            location: productData[6],
            sold: productData[7],
            saleDate: productData[8],
            uid: productData[9],
            price: parseInt(productData[10], 10),
            category: productData[11],
            quantityInStock: parseInt(productData[12], 10),
            status: mapEnumToStatus(parseInt(productData[13], 10)),
            icon: productData[14]
        };
        return res.status(200).send(generateHtmlResponse(
            'Location Updated',
            `Location updated for product ${productId} to ${location} with status ${status}.`,
            true,
            product,
            receipt.transactionHash
        ));
    } catch (error) {
        console.error('Error updating location (NFC):', error.message);
        return res.status(500).send(generateHtmlResponse(
            'Update Failed',
            `Error updating location: ${error.message}`,
            false
        ));
    }
});

// POST /logSale - UI-based sale
app.post('/logSale', async (req, res) => {
    const { productId, saleDate, price } = req.body;
    if (!productId || !saleDate || price === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    try {
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.logSale(productId, saleDate, price).estimateGas({ from: account.address });
        const data = contract.methods.logSale(productId, saleDate, price).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete(productId);
        productCache.delete('products');
        res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error logging sale (UI):', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /logSale - NFC-based sale
app.get('/logSale', async (req, res) => {
    const tagId = req.query.tagid || 'none';
    const text = req.query.text;
    if (!text) {
        return res.status(400).send(generateHtmlResponse(
            'Sale Failed',
            'Missing text data. Please ensure the NFC tag contains valid data.',
            false
        ));
    }
    const parts = text.split('|');
    if (parts.length < 3) {
        return res.status(400).send(generateHtmlResponse(
            'Sale Failed',
            'Invalid text format. Expected: ID|SaleDate|Price',
            false
        ));
    }
    const [productId, saleDate, priceStr] = parts;
    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price < 0) {
        return res.status(400).send(generateHtmlResponse(
            'Sale Failed',
            'Invalid price. Must be a non-negative integer.',
            false
        ));
    }
    console.log('NFC Log Sale Input:', { productId, saleDate, price, tagId });

    try {
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.logSale(productId, saleDate, price).estimateGas({ from: account.address });
        const data = contract.methods.logSale(productId, saleDate, price).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete(productId);
        productCache.delete('products');

        const productData = await contract.methods.getProduct(productId).call();
        const product = {
            id: productData[0],
            name: productData[1],
            sku: productData[2],
            batchNo: productData[3],
            expiryDate: productData[4],
            origin: productData[5],
            location: productData[6],
            sold: productData[7],
            saleDate: productData[8],
            uid: productData[9],
            price: parseInt(productData[10], 10),
            category: productData[11],
            quantityInStock: parseInt(productData[12], 10),
            status: mapEnumToStatus(parseInt(productData[13], 10)),
            icon: productData[14]
        };
        return res.status(200).send(generateHtmlResponse(
            'Sale Logged',
            `Sale logged for product ${productId} on ${saleDate} for ${price} units.`,
            true,
            product,
            receipt.transactionHash
        ));
    } catch (error) {
        console.error('Error logging sale (NFC):', error.message);
        return res.status(500).send(generateHtmlResponse(
            'Sale Failed',
            `Error logging sale: ${error.message}`,
            false
        ));
    }
});

// POST /deleteProduct
app.post('/deleteProduct', async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, error: 'Missing productId' });
    }
    try {
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending');
        const gas = await contract.methods.deleteProduct(id).estimateGas({ from: account.address });
        const data = contract.methods.deleteProduct(id).encodeABI();
        const tx = {
            from: account.address,
            to: contractAddress,
            gas: Math.min(Math.floor(gas * 1.2), 500000),
            gasPrice: await web3.eth.getGasPrice(),
            data,
            nonce
        };
        const signedTx = await web3.eth.accounts.signTransaction(tx, '0x' + privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        productCache.delete(id);
        productCache.delete('products');
        res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /products
app.get('/products', async (req, res) => {
    const cacheKey = 'products';
    if (productCache.has(cacheKey)) {
        console.log('Serving /products from cache at', new Date().toISOString());
        return res.status(200).json(productCache.get(cacheKey));
    }
    try {
        const count = await retry(() => contract.methods.getProductCount().call());
        const productIds = await retry(() => contract.methods.getProductIds(0, count).call());
        const products = [];
        for (const id of productIds) {
            let productData;
            if (productCache.has(id)) {
                console.log(`Serving product ${id} from cache at ${new Date().toISOString()}`);
                productData = productCache.get(id).raw;
            } else {
                productData = await retry(() => contract.methods.getProduct(id).call());
                productCache.set(id, { raw: productData, formatted: false });
            }
            console.log(`Raw status for product ${id}: ${productData[13]}, Type: ${typeof productData[13]}`);
            const formattedProduct = {
                id: productData[0],
                name: productData[1],
                sku: productData[2],
                batchNo: productData[3],
                expiryDate: productData[4],
                origin: productData[5],
                location: productData[6],
                sold: productData[7],
                saleDate: productData[8],
                uid: productData[9],
                price: parseInt(productData[10], 10),
                category: productData[11],
                quantityInStock: parseInt(productData[12], 10),
                status: mapEnumToStatus(parseInt(productData[13], 10)),
                icon: productData[14],
                exists: true // getProductId success implies product exists
            };
            if (!formattedProduct.id) {
                continue; // Skip invalid products
            }
            products.push(formattedProduct);
        }
        productCache.set(cacheKey, products);
        console.log('Fetched /products:', products.length, 'products at', new Date().toISOString());
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /product - Fetch single product by productId
app.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;
    console.log(`GET /product called for ${productId} at ${new Date().toISOString()}`);
    if (!productId) {
        return res.status(400).json({ success: false, error: 'Missing productId' });
    }
    try {
        let productData;
        if (productCache.has(productId)) {
            console.log(`Serving product ${productId} from cache at ${new Date().toISOString()}`);
            const cached = productCache.get(productId);
            if (cached.formatted) {
                return res.status(200).json(cached.data);
            } else {
                productData = cached.raw;
            }
        } else {
            productData = await retry(() => contract.methods.getProduct(productId).call());
            productCache.set(productId, { raw: productData, formatted: false });
        }
        console.log(`Raw status for product ${productId}: ${productData[13]}, Type: ${typeof productData[13]}`);
        const formattedProduct = {
            id: productData[0],
            name: productData[1],
            sku: productData[2],
            batchNo: productData[3],
            expiryDate: productData[4],
            origin: productData[5],
            location: productData[6],
            sold: productData[7],
            saleDate: productData[8],
            uid: productData[9],
            price: parseInt(productData[10], 10),
            category: productData[11],
            quantityInStock: parseInt(productData[12], 10),
            status: mapEnumToStatus(parseInt(productData[13], 10)),
            icon: productData[14],
            exists: true // getProduct success implies product exists
        };
        if (!formattedProduct.id) {
            return res.status(200).json({
                success: false,
                message: `Product ${productId} is not registered or has been deleted.`
            });
        }
        productCache.set(productId, { raw: productData, formatted: true, data: formattedProduct });
        res.status(200).json(formattedProduct);
    } catch (error) {
        console.error('Error fetching product:', error.message);
        if (error.message.includes('Product does not exist')) {
            return res.status(200).json({
                success: false,
                message: `Product ${productId} is not registered or has been deleted.`
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /checkProduct - Check product status
app.get('/checkProduct', async (req, res) => {
    const tagId = req.query.tagid || 'none';
    const text = req.query.text;
    if (!text) {
        return res.status(400).send(generateHtmlResponse(
            'Check Failed',
            'Missing text parameter. Please ensure the NFC tag contains a valid product ID.',
            false
        ));
    }
    const productId = text.trim();
    if (!productId) {
        return res.status(400).send(generateHtmlResponse(
            'Check Failed',
            'Invalid product ID in text.',
            false
        ));
    }
    console.log('Checking product:', productId, ' with tagId ', tagId, ' at', new Date().toISOString());

    try {
        let productData;
        if (productCache.has(productId)) {
            console.log(`Checking product ${productId} from cache at ${new Date().toISOString()}`);
            productData = productCache.get(productId).raw;
        } else {
            console.log(`Fetching product ${productId} from contract at ${new Date().toISOString()}`);
            productData = await retry(() => contract.methods.getProduct(productId).call());
            productCache.set(productId, { raw: productData, formatted: false });
        }
        console.log(`Raw status for product ${productId}: ${productData[13]}, Type: ${typeof productData[13]}`);

        const formattedProduct = {
            id: productData[0],
            name: productData[1],
            sku: productData[2],
            batchNo: productData[3],
            expiryDate: productData[4],
            origin: productData[5],
            location: productData[6],
            sold: productData[7],
            saleDate: productData[8],
            uid: productData[9],
            price: parseInt(productData[10], 10),
            category: productData[11],
            quantityInStock: parseInt(productData[12], 10),
            status: mapEnumToStatus(parseInt(productData[13], 10)),
            icon: productData[14],
            exists: true // getProduct success implies product exists
        };

        if (!formattedProduct.id) {
            console.log(`Product ${productId} has invalid data:`, formattedProduct);
            return res.status(200).send(generateHtmlResponse(
                'Check Failed',
                `Product ${productId} is not registered or has been deleted.`,
                false
            ));
        }

        let statusMessage;
        switch (formattedProduct.status) {
            case 'en route':
                statusMessage = `Product ${productId} (${formattedProduct.name}) is en route to ${formattedProduct.location}.`;
                break;
            case 'arrived':
                statusMessage = `Product ${productId} (${formattedProduct.name}) has arrived at ${formattedProduct.location}.`;
                break;
            case 'sold':
                statusMessage = `Product ${productId} (${formattedProduct.name}) was sold on ${formattedProduct.saleDate} for ${formattedProduct.price} units.`;
                break;
            default:
                statusMessage = `Product ${productId} (${formattedProduct.name}) has an unknown status.`;
        }

        return res.status(200).send(generateHtmlResponse(
            'Product Status',
            statusMessage,
            true,
            formattedProduct
        ));
    } catch (error) {
        console.error('Error checking product:', error.message);
        if (error.message.includes('Product does not exist')) {
            return res.status(200).send(generateHtmlResponse(
                'Check Failed',
                `Product ${productId} is not registered or has been deleted.`,
                false
            ));
        }
        return res.status(500).send(generateHtmlResponse(
            'Check Failed',
            `Error checking product: ${error.message}`,
            false
        ));
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


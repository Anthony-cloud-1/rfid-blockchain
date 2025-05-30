# RFID-Driven Inventory Tracking with Blockchain

## Project Overview

This project implements a blockchain-based inventory tracking system using RFID (NFC) tags to manage products across three phases: **Enrollment**, **Logistics**, and **Retail**. It leverages Optimism Sepolia (a layer-2 Ethereum testnet) for cost-effective transactions, a Solidity smart contract for data storage, a Node.js server for processing NFC scans, a React frontend for user interaction, and NTAG215 NFC tags for product identification. The system ensures secure, transparent tracking of products (e.g., pharmaceuticals, goods) in a supply chain.

### Key Components
- **MetaMask**: Manages Ethereum accounts and signs transactions.
- **Optimism Sepolia**: Layer-2 testnet for contract deployment and interaction.
- **Alchemy**: Provides blockchain API connectivity to Optimism Sepolia.
- **Solidity Smart Contract**: Stores and manages product data (`Inventory.sol`).
- **Node.js Server**: Processes NFC scan requests and API calls (`server.js`).
- **React Frontend**: User interface for managing products and viewing status.
- **NTAG215 NFC Tags**: Store URLs to trigger server actions.
- **NFC Tools**: Mobile app for writing/reading NFC tags.

### Phases
1. **Enrollment**: Register a product with details (Product ID, Name, Batch Number, Expiry Date, Origin, etc.).
2. **Logistics**: Update a product’s location and status (e.g., "en route", "arrived").
3. **Retail**: Log a sale with a date and price, marking the product as sold.
4. **Verification**: Check a product’s status and details.

---

## Setup Instructions

### 1. Install and Configure MetaMask

MetaMask is used to manage your Ethereum account and sign transactions on Optimism Sepolia.

### Steps
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
     - **Name**: RFID Inventory (You can name it as you wish)
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

- **File**: `Inventory.sol`.
- **Snippet**:
  ```solidity
  function registerProduct(
      string memory id, string memory name, string memory sku, string memory batchNo,
      string memory expiryDate, string memory origin, string memory location, string memory uid,
      string memory category, uint256 quantityInStock, Status status, string memory icon
  ) public {
      bytes32 key = keccak256(abi.encodePacked(id));
      require(!products[key].exists, "Product already registered");
      products[key] = Product(id, name, sku, batchNo, expiryDate, origin, location, false, "",
                             uid, 0, category, quantityInStock, status, icon, true);
      productIds.push(id);
      emit ProductRegistered(id, name, sku, batchNo, expiryDate, origin, location, uid,
                             category, quantityInStock, status, icon);
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

- **File**: `server.js`.
- **Snippet**:
  ```javascript
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
  ```

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
   Account Address: 0xBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxb79
   Server running at http://localhost:3001
   Contract Owner: 0xBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxb79
   Account Balance: X ETH
   ```
3. Test endpoints:
   - **Register**: `http://localhost:3000/register?tagid=TAG001&text=PID003|Batch003|Exp2027|Kenya`
   - **Update Location**: `http://localhost:3000/updateLocation?tagid=TAG001&text=PID003|Accra|1000|arrived`
   - **Log Sale**: `http://localhost:3000/logSale?tagid=TAG001&text=PID003|2025-05-24|1500`
   -**Check Product**: `http://localhost:3000/checkProduct?tagid=TAG001&text=PID003`

---

### 5. Set Up the React Frontend
- **Folder**: `frontend/`.
- **Snippet** (`app/page.tsx`):
  ```tsx
  "use client";

  import { useEffect, useState } from "react";
  import { useSearchParams } from "next/navigation";
  import AppHeader from "./AppHeader/AppHeader";
  import { Card } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import AppTable from "./AppTable/AppTable";
  import { useTheme } from "next-themes";
  import { DeleteDialog } from "./DeleteDialog";
  import { useProductStore } from "./useProductStore";
  import { useForm, Controller } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { Toaster } from "@/components/ui/toaster";
  import { useToast } from "@/hooks/use-toast";
  import { nanoid } from "nanoid";

  const updateLocationSchema = z.object({
    location: z.string().min(1, "Location is required"),
    price: z.number().nonnegative("Price cannot be negative"),
    status: z.enum(["en route", "arrived", "sold"]),
  });

  const logSaleSchema = z.object({
    saleDate: z.string().min(1, "Sale Date is required"),
    price: z.number().nonnegative("Price cannot be negative"),
  });

  export default function Home() {
    const { theme } = useTheme();
    const [isClient, setIsClient] = useState(false);
    const bgColor = theme === "dark" ? "bg-black" : "bg-gray-50";
    const searchParams = useSearchParams();
    const { loadProducts } = useProductStore();
    const { toast } = useToast();

    const uid = searchParams.get("uid") || `UID-${nanoid(6)}`;
    const productId = searchParams.get("productId") || "";
    const nfcText = searchParams.get("text") || "";

    const updateLocationForm = useForm({
      resolver: zodResolver(updateLocationSchema),
      defaultValues: { location: "", price: 0, status: "en route" },
    });

    const logSaleForm = useForm({
      resolver: zodResolver(logSaleSchema),
      defaultValues: { saleDate: "", price: 0 },
    });
  ```
  
- **Prerequisites**:
  - Node.js (16+).
  - A modern browser.
- **Setup Steps**:
  1. Navigate to the frontend folder:
     ```bash
     cd frontend
     ```
  2. Install dependencies:
     ```bash
     npm install
     ```
  3. Start the development server:
     ```bash
     npm run dev
     ```
     - Opens at `http://localhost:3000`.
  4. Ensure the backend server (`server.js`) is running at `http://localhost:3001`.

- **Dependencies**:
  - React (`react`, `react-dom`).
  - Axios for API calls (`axios`).
  - Tailwind CSS for styling.
- **Structure**:
  - `app/page.tsx`: Main component with UI for displaying products.
- **Configuration**:
  - Update API endpoints in `page.tsx` if the backend URL changes (e.g., to an ngrok URL).

### 6. Configure NFC Tools and Ngrok
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
3. Copy the public URL (e.g., `https://5664-41-215-171-145.ngrok-free.app`).

#### Write NFC Tags
1. Open NFC Tools.
2. Select **Write** > **Add a record** > **Custom URL/URI**.
3. Enter a URL for the desired action, e.g.:
   - **Enrollment**: `https://5664-41-215-171-145.ngrok-free.app/register?tagid=TAG001&text=PID003|Batch003|Exp2027|Kenya`
   - **Logistics**: `https://5664-41-215-171-145.ngrok-free.app/updateLocation?tagid=TAG001&text=PID003|Accra|1000|arrived`
   - **Retail**: `https://5664-41-215-171-145.ngrok-free.app/logSale?tagid=TAG001&text=PID003|2025-05-24|1500`
   -**Verification**: `https://5664-41-215-171-145.ngrok-free.app/checkProduct?tagid=TAG001&text=PID003`
4. Write the URL to an NTAG215 tag.
5. Scan to verify the URL opens correctly.

#### Byte Constraint
- NTAG215 tags have a 492-byte user memory limit.
- Each URL (e.g., ~100-150 bytes) fits well within this limit.
- Avoid complex logic (e.g., conditions, variables) on the tag to save space.

---

## Use Scenarios

### Enrollment
- **Scenario**: A manufacturer registers a product (e.g., an electronics batch) via NFC.
- **Steps**:
  1. Run `server.js` and Ngrok.
  2. Write an NFC tag:
     ```
     https://ngrok-url/register?tagid=TAG001&text=PID001|ProductX|Batch001|Exp2025|USA|Electronics|10
     ```
  3. Scan with NFC Tools.
  4. Verify in Remix (`getProduct("PID001")`) or frontend (check product).

### Logistics
- **Scenario**: A logistics provider updates a product’s location.
- **Steps**:
  1. Write an NFC tag:
     ```
     https://ngrok-url/updateLocation?tagid=TAG001&text=PID001|Accra|1000|arrived
     ```
  2. Scan to update.
  3. Verify location in frontend or Remix.

### Retail
- **Scenario**: A retailer logs a sale.
- **Steps**:
  1. Write an NFC tag:
     ```
     https://ngrok-url/logSale?tagid=TAG001&text=PID001|2025-05-24|1000
     ```
  2. Scan to log sale.
  3. Verify sale status in frontend or Remix.

### Verification (Check Product)
- **Scenario**: A user verifies a product’s status (e.g., an inventory manager checking authenticity).
- **Steps**:
  1. Write an NFC tag:
       ```
       https://ngrok-url/checkProduct?tagid=TAG001&text=PID001
       ```
  2. Scan to view status (displays in browser).

---

## Troubleshooting
- **MetaMask**: Ensure Optimism Sepolia is selected and funded.
- **Server**:
  - Check `.env` for correct `PRIVATE_KEY` and `ALCHEMY_URL`.
  - Increase `gas` in `server.js` if transactions fail.
- **Frontend**:
  - Verify backend is running (`http://localhost:3001`).
  - Check browser console for CORS or API errors.
- **NFC Tools**:
  - Ensure NFC is enabled and URLs are correctly formatted.
  - Test URLs in a browser first.

---

## Security Notes
- **Private Key**: Store in `.env`, never hardcode.
- **Contract**: Add `onlyOwner` modifier for production.
- **Frontend**: Sanitize inputs to prevent injection.
- **Ngrok**: Use a static domain for production stability.

---

## Future Enhancements
- **Contract**: Add `productIds` array for listing all products.
- **Frontend**: Add forms for registration, location updates, and sales logging.
- **Access Control**: Implement role-based access in the contract.
- **NFC Logic**: Use NFC Tools’ conditional blocks for dynamic actions.

---

## System Architecture
```
[NTAG215 Tag] --(Scan)--> [NFC Tools] --(URL)--> [Ngrok] --(HTTP)--> [Node.js Server]
                                                                           |
                                                                           v
[React Frontend] <----(API)----> [Smart Contract (Optimism Sepolia)] <----> [Alchemy API]
```

- **Tag**: Stores URLs for actions.
- **NFC Tools**: Triggers server requests.
- **Ngrok**: Exposes the server.
- **Frontend**: Displays product data and triggers actions.
- **Server**: Interacts with the contract.
- **Contract**: Manages product data.

---

## Repository Structure
```
rfid-blockchain/
├── frontend/           # React frontend code
├── Inventory.sol       # Solidity smart contract
├── server.js           # Node.js backend server
├── .env                # Environment variables
├── package.json        # Backend dependencies
└── README.md           # This documentation
```

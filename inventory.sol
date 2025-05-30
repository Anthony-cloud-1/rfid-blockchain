// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Inventory {
    enum Status { EnRoute, Arrived, Sold }

    struct Product {
        string id;
        string name;
        string sku;
        string batchNo;
        string expiryDate;
        string origin;
        string location;
        bool sold;
        string saleDate;
        string uid;
        uint256 price;
        string category;
        uint256 quantityInStock;
        Status status;
        string icon;
        bool exists;
    }

    mapping(bytes32 => Product) public products;
    string[] public productIds;

    event ProductRegistered(
        string id,
        string name,
        string sku,
        string batchNo,
        string expiryDate,
        string origin,
        string location,
        string uid,
        string category,
        uint256 quantityInStock,
        Status status,
        string icon
    );
    event LocationUpdated(string id, string location, uint256 price, Status status);
    event SaleLogged(string id, string saleDate, uint256 price, bool sold);
    event ProductDeleted(string id);

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getProductKey(string memory productId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(productId));
    }

    function registerProduct(
        string memory id,
        string memory name,
        string memory sku,
        string memory batchNo,
        string memory expiryDate,
        string memory origin,
        string memory location,
        string memory uid,
        string memory category,
        uint256 quantityInStock,
        Status status,
        string memory icon
    ) public onlyOwner {
        bytes32 key = getProductKey(id);
        require(!products[key].exists, "Product already exists");
        // Add string length checks
        require(bytes(id).length <= 50, "ID too long");
        require(bytes(name).length <= 100, "Name too long");
        require(bytes(sku).length <= 50, "SKU too long");
        require(bytes(batchNo).length <= 50, "Batch number too long");
        require(bytes(expiryDate).length <= 20, "Expiry date too long");
        require(bytes(origin).length <= 100, "Origin too long");
        require(bytes(location).length <= 100, "Location too long");
        require(bytes(uid).length <= 50, "UID too long");
        require(bytes(category).length <= 50, "Category too long");
        require(bytes(icon).length <= 200, "Icon too long");

        products[key] = Product(
            id, name, sku, batchNo, expiryDate, origin, location,
            false, "", uid, 0, category, quantityInStock, status, icon, true
        );
        productIds.push(id);
        emit ProductRegistered(id, name, sku, batchNo, expiryDate, origin, location, uid, category, quantityInStock, status, icon);
    }

    function updateLocation(
        string memory id,
        string memory location,
        uint256 price,
        Status status
    ) public onlyOwner {
        bytes32 key = getProductKey(id);
        require(products[key].exists, "Product does not exist");
        products[key].location = location;
        products[key].price = price;
        products[key].status = status;
        emit LocationUpdated(id, location, price, status);
    }

    function logSale(
        string memory id,
        string memory saleDate,
        uint256 price
    ) public onlyOwner {
        bytes32 key = getProductKey(id);
        require(products[key].exists, "Product does not exist");
        products[key].sold = true;
        products[key].saleDate = saleDate;
        products[key].price = price;
        products[key].status = Status.Sold;
        emit SaleLogged(id, saleDate, price, true);
    }

    function deleteProduct(string memory id) public onlyOwner {
        bytes32 key = getProductKey(id);
        require(products[key].exists, "Product does not exist");
        delete products[key];
        for (uint256 i = 0; i < productIds.length; i++) {
            if (keccak256(bytes(productIds[i])) == keccak256(bytes(id))) {
                productIds[i] = productIds[productIds.length - 1];
                productIds.pop();
                break;
            }
        }
        emit ProductDeleted(id);
    }

    function getProduct(string memory id) public view returns (
        string memory, string memory, string memory, string memory,
        string memory, string memory, string memory, bool,
        string memory, string memory, uint256, string memory,
        uint256, Status, string memory
    ) {
        bytes32 key = getProductKey(id);
        require(products[key].exists, "Product does not exist");
        Product memory p = products[key];
        return (
            p.id, p.name, p.sku, p.batchNo, p.expiryDate, p.origin,
            p.location, p.sold, p.saleDate, p.uid, p.price, p.category,
            p.quantityInStock, p.status, p.icon
        );
    }

    function getProductCount() public view returns (uint256) {
        return productIds.length;
    }

    function getProductIds(uint256 start, uint256 limit) public view returns (string[] memory) {
        require(start < productIds.length, "Start index out of bounds");
        uint256 end = start + limit > productIds.length ? productIds.length : start + limit;
        string[] memory result = new string[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = productIds[i];
        }
        return result;
    }
}
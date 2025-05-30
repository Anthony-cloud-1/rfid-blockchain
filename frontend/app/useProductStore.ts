import { create } from "zustand";
import { ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  sku: string;
  batchNo: string;
  expiryDate: string;
  origin: string;
  location: string;
  sold: boolean;
  saleDate: string;
  uid: string;
  price: string;
  category:
    | "Electronics"
    | "Medical"
    | "Clothing"
    | "Books"
    | "Toys"
    | "Beauty"
    | "Sports"
    | "Home Decor"
    | "Home Appliances"
    | "Others";
  quantityInStock: number;
  status: "en route" | "arrived" | "sold";
  icon: ReactNode;
  exists?: boolean;
}

interface ProductState {
  allProducts: Product[];
  isLoading: boolean;
  openDialog: boolean;
  openProductDialog: boolean;
  openUpdateLocationDialog: boolean;
  openLogSaleDialog: boolean;
  selectedProduct: Product | null;
  setOpenDialog: (openDialog: boolean) => void;
  setOpenProductDialog: (openProductDialog: boolean) => void;
  setOpenUpdateLocationDialog: (openUpdateLocationDialog: boolean) => void;
  setOpenLogSaleDialog: (openLogSaleDialog: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  setAllProducts: (allProducts: Product[]) => void;
  loadProducts: () => Promise<void>;
  loadProduct: (productId: string) => Promise<Product | null>;
  addProduct: (product: Product) => Promise<{ success: boolean }>;
  updateProduct: (updatedProduct: Product) => Promise<{ success: boolean }>;
  deleteProduct: (id: string) => Promise<{ success: boolean }>;
}

export const useProductStore = create<ProductState>((set) => ({
  allProducts: [],
  isLoading: false,
  openDialog: false,
  openProductDialog: false,
  openUpdateLocationDialog: false,
  openLogSaleDialog: false,
  selectedProduct: null,
  setOpenDialog: (openDialog) => {
    console.log('setOpenDialog:', openDialog);
    set({ openDialog });
  },
  setOpenProductDialog: (openProductDialog) => {
    console.log('setOpenProductDialog:', openProductDialog);
    set({ openProductDialog });
  },
  setOpenUpdateLocationDialog: (openUpdateLocationDialog) => {
    console.log('setOpenUpdateLocationDialog:', openUpdateLocationDialog);
    set({ openUpdateLocationDialog });
  },
  setOpenLogSaleDialog: (openLogSaleDialog) => {
    console.log('setOpenLogSaleDialog:', openLogSaleDialog);
    set({ openLogSaleDialog });
  },
  setSelectedProduct: (product) => {
    console.log('setSelectedProduct:', product ? product.id : null);
    set({ selectedProduct: product });
  },
  setAllProducts: (allProducts) => {
    console.log('setAllProducts:', allProducts.length);
    set({ allProducts });
  },
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      console.log('loadProducts: Fetching from http://localhost:3001/products');
      const response = await fetch("http://localhost:3001/products");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedProducts: Product[] = await response.json();
      console.log('loadProducts: Fetched', fetchedProducts.length, 'products');
      set({ allProducts: fetchedProducts, isLoading: false });
    } catch (error) {
      console.error('loadProducts: Error:', error);
      set({ isLoading: false });
    }
  },
  loadProduct: async (productId: string) => {
    set({ isLoading: true });
    try {
      console.log('loadProduct: Fetching product', productId);
      const response = await fetch(`http://localhost:3001/product?productId=${encodeURIComponent(productId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const product: Product = await response.json();
      console.log('loadProduct: Fetched product', product.id);
      set({ selectedProduct: product, isLoading: false });
      return product;
    } catch (error) {
      console.error('loadProduct: Error:', error);
      set({ isLoading: false });
      return null;
    }
  },
  addProduct: async (product: Product) => {
    set({ isLoading: true });
    try {
      console.log('addProduct:', product.id);
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, price: product.price.toString() }),
      });
      if (!response.ok) {
        throw new Error("Failed to add product");
      }
      const fetchResponse = await fetch("http://localhost:3001/products");
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch products after adding");
      }
      const fetchedProducts: Product[] = await fetchResponse.json();
      set({ allProducts: fetchedProducts });
      console.log('addProduct: Success', product.id);
      return { success: true };
    } catch (error) {
      console.error('addProduct: Error:', error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },
  updateProduct: async (updatedProduct: Product) => {
    set({ isLoading: true });
    try {
      console.log('updateProduct:', updatedProduct.id);
      const response = await fetch("http://localhost:3001/updateLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedProduct, price: updatedProduct.price.toString() }),
      });
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      const fetchResponse = await fetch("http://localhost:3001/products");
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch products after updating");
      }
      const fetchedProducts: Product[] = await fetchResponse.json();
      set({ allProducts: fetchedProducts });
      console.log('updateProduct: Success', updatedProduct.id);
      return { success: true };
    } catch (error) {
      console.error('updateProduct: Error:', error);
      return { success: false };
    } finally {
      set({ isLoading: false, openProductDialog: false, selectedProduct: null });
    }
  },
  deleteProduct: async (id: string) => {
    set({ isLoading: true });
    try {
      console.log('deleteProduct:', id);
      const response = await fetch("http://localhost:3001/deleteProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      const fetchResponse = await fetch("http://localhost:3001/products");
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch products after deleting");
      }
      const fetchedProducts: Product[] = await fetchResponse.json();
      set({ allProducts: fetchedProducts });
      console.log('deleteProduct: Success', id);
      return { success: true };
    } catch (error) {
      console.error('deleteProduct: Error:', error);
      return { success: false };
    } finally {
      set({ isLoading: false, openDialog: false, selectedProduct: null });
    }
  },
}));
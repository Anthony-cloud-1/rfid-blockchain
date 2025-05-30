"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import ProductName from "./_components/ProductName";
import Price from "./_components/Price";
import { ProductCategory } from "./_components/ProductCategory";
import Quantity from "./_components/Quantity";
import SKU from "./_components/SKU";
import Status from "./_components/Status";
import Origin from "./_components/Origin";
import TagId from "./_components/TagId";
import ProductId from "./_components/ProductId";
import BatchNo from "./_components/BatchNo";
import ExpiryDate from "./_components/ExpiryDate";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Product } from "@/app/Products/columns";
import { nanoid } from "nanoid";
import { icons } from "./Icons";
import { useProductStore } from "@/app/useProductStore";
import { useToast } from "@/hooks/use-toast";

const ProductSchema = z.object({
  tagid: z.string().min(1, "Tag ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product Name is required").max(100, "Product Name must be 100 characters or less"),
  sku: z.string().min(1, "SKU is required").regex(/^[a-zA-Z0-9-_]+$/, "SKU must be alphanumeric"),
  origin: z.string().min(1, "Origin is required").max(100, "Origin must be 100 characters or less"),
  batchNo: z.string().min(1, "Batch Number is required"),
  expiryDate: z.string().min(1, "Expiry Date is required"),
  quantityInStock: z.number().int("Quantity must be an integer").nonnegative("Quantity cannot be negative"),
  price: z.union([z.string(), z.number()]).refine((val) => val !== "", { message: "Price is required" }).transform((val) => {
    if (val === "") return undefined;
    const num = Number(val);
    return Number(num.toFixed(2));
  }).pipe(z.number({ required_error: "Price is required", invalid_type_error: "Price must be a number" }).nonnegative("Price cannot be negative")),
});

type ProductFormData = z.infer<typeof ProductSchema>;

export default function ProductDialog() {
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      tagid: "",
      productId: "",
      name: "",
      sku: "",
      origin: "",
      batchNo: "",
      expiryDate: "",
      quantityInStock: 1, // Changed default to 1
      price: 0.0,
    },
  });

  const { reset } = methods;
  const [selectedTab, setSelectedTab] = useState<Product["status"]>("en route");
  const [selectedCategory, setSelectedCategory] = useState<Product["category"]>("Medical");
  const [selectedIconName, setSelectedIconName] = useState<string>(icons.find((icon) => icon.isSelected === true)?.name || "BookReader");

  const {
    addProduct,
    isLoading,
    openProductDialog,
    setOpenProductDialog,
    setSelectedProduct,
    selectedProduct,
    updateProduct,
  } = useProductStore();
  const { toast } = useToast();
  const dialogCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      reset({
        tagid: selectedProduct.uid,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        origin: selectedProduct.origin,
        batchNo: selectedProduct.batchNo,
        expiryDate: selectedProduct.expiryDate,
        quantityInStock: selectedProduct.quantityInStock,
        price: Number(selectedProduct.price),
      });
      setSelectedTab(selectedProduct.status);
      setSelectedCategory(selectedProduct.category);
      setSelectedIconName(selectedProduct.icon || "BookReader");
    } else {
      reset({
        tagid: "",
        productId: "",
        name: "",
        sku: "",
        origin: "",
        batchNo: "",
        expiryDate: "",
        quantityInStock: 1,
        price: 0.0,
      });
      setSelectedTab("en route");
      setSelectedCategory("Medical");
      setSelectedIconName("BookReader");
    }
  }, [selectedProduct, openProductDialog, reset]);

  const onSubmit = async (data: ProductFormData) => {
    console.log('Form data:', data);
    console.log('Selected icon:', selectedIconName);
    console.log('Selected category:', selectedCategory);
    console.log('Selected status:', selectedTab);

    if (!selectedProduct) {
      const newProduct: Product = {
        id: data.productId,
        name: data.name,
        sku: data.sku,
        batchNo: data.batchNo,
        expiryDate: data.expiryDate,
        origin: data.origin,
        location: "Warehouse",
        sold: false,
        saleDate: "",
        uid: data.tagid,
        price: data.price.toString(),
        category: selectedCategory,
        quantityInStock: data.quantityInStock,
        status: selectedTab,
        icon: selectedIconName,
        exists: true,
      };
      console.log('New product:', newProduct);

      const result = await addProduct(newProduct);
      if (result.success) {
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
        dialogCloseRef.current?.click();
      } else {
        toast({
          title: "Error",
          description: "Failed to add product.",
          variant: "destructive",
        });
      }
    } else {
      const productToUpdate: Product = {
        id: selectedProduct.id,
        name: data.name,
        sku: data.sku,
        batchNo: data.batchNo,
        expiryDate: data.expiryDate,
        origin: data.origin,
        location: selectedProduct.location,
        sold: selectedProduct.sold,
        saleDate: selectedProduct.saleDate,
        uid: data.tagid,
        price: data.price.toString(),
        category: selectedCategory,
        quantityInStock: data.quantityInStock,
        status: selectedTab,
        icon: selectedIconName,
        exists: true,
      };
      console.log('Product to update:', productToUpdate);

      const result = await updateProduct(productToUpdate);
      if (result.success) {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
        dialogCloseRef.current?.click();
      } else {
        toast({
          title: "Error",
          description: "Failed to update product.",
          variant: "destructive",
        });
      }
    }
  };

  function handleReset() {
    reset();
    setSelectedProduct(null);
    setSelectedIconName("BookReader");
  }

  function onSelectedIcon(iconName: string) {
    setSelectedIconName(iconName);
  }

  return (
    <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
      <DialogTrigger asChild>
        <Button className="h-10">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="p-7 px-8 poppins">
        <DialogHeader>
          <DialogTitle className="text-[22px]">
            {selectedProduct ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            Fill in the form to add a new product
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 mt-1">
              <div className="grid grid-cols-2 gap-7">
                <TagId />
                <ProductId />
              </div>
              <div className="grid grid-cols-2 gap-7 mt-4">
                <ProductName onSelectedIcon={onSelectedIcon} />
                <SKU />
              </div>
              <div className="grid grid-cols-2 gap-7 mt-4">
                <Origin />
                <ProductCategory
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              </div>
              <div className="grid grid-cols-3 gap-7 mt-4 max-lg:grid-cols-2 max-lg:gap-1 max-sm:grid-cols-1">
                <BatchNo />
                <Status
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                />
                <ExpiryDate />
              </div>
              <div className="grid grid-cols-2 gap-7 mt-4">
                <Quantity />
                <Price />
              </div>
            </div>
            <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
              <DialogClose
                ref={dialogCloseRef}
                onClick={handleReset}
                asChild
              >
                <Button variant="secondary" className="h-11 px-11">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="h-11 px-11">
                {isLoading
                  ? "Loading..."
                  : selectedProduct
                  ? "Edit Product"
                  : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTable } from "../Products/ProductTable";
import { columns } from "../Products/columns";
import ProductDialog from "./ProductDialog/ProductDialog";
import UpdateLocationDialog from "./UpdateLocationDialog/UpdateLocationDialog";
import LogSaleDialog from "./LogSaleDialog/LogSaleDialog";
import { useProductStore } from "../useProductStore";
import { useEffect } from "react";
import { FaBookReader } from "react-icons/fa";

export default function AppTable() {
  const { allProducts, loadProducts, isLoading } = useProductStore();

  const productsWithIcons = allProducts.map((product) => ({
    ...product,
    icon: product.icon === "BookReader" ? <FaBookReader /> : <FaBookReader />,
  }));

  useEffect(() => {
    console.log('AppTable useEffect: Mounting');
    loadProducts();
  }, []); // Empty dependency array

  return (
    <Card className="mt-12 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between">
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle className="font-bold text-[23px]">Products</CardTitle>
            <p className="text-sm text-slate-600">
              {isLoading ? "Loading..." : `${productsWithIcons.length} products`}
            </p>
          </div>
          <ProductDialog />
        </div>
      </CardHeader>
      <CardContent>
        <ProductTable data={productsWithIcons} columns={columns} />
        <UpdateLocationDialog />
        <LogSaleDialog />
      </CardContent>
    </Card>
  );
}
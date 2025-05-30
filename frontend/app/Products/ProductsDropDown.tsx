"use client";

import { Row } from "@tanstack/react-table";
import { Product } from "./columns";
import { FaRegEdit, FaShoppingCart } from "react-icons/fa";
import { MdContentCopy, MdOutlineDelete } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useProductStore } from "../useProductStore";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";

type MenuItem = {
  icon: JSX.Element;
  label: string;
  className: string;
  separator?: undefined;
};

export default function ProductDropDown({ row }: { row: Row<Product> }) {
  const {
    setSelectedProduct,
    setOpenDialog,
    setOpenUpdateLocationDialog,
    setOpenLogSaleDialog,
    addProduct,
  } = useProductStore();
  const { toast } = useToast();

  const menuItems: MenuItem[] = [
    { icon: <MdContentCopy />, label: "Copy", className: "" },
    { icon: <FaRegEdit />, label: "Update Location", className: "" },
    { icon: <FaShoppingCart />, label: "Log Sale", className: "" },
    {
      icon: <MdOutlineDelete className="text-lg" />,
      label: "Delete",
      className: "text-red-600",
    },
  ];

  async function handleClickedItem(item: MenuItem) {
    if (item.label === "Delete") {
      setOpenDialog(true);
      setSelectedProduct(row.original);
    } else if (item.label === "Copy") {
      const productToCopy: Product = {
        ...row.original,
        id: nanoid(),
        name: `${row.original.name} (copy)`,
      };
      const result = await addProduct(productToCopy);
      if (result.success) {
        toast({
          title: "Copy Successful",
          description: "Product has been copied successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to copy product",
          variant: "destructive",
        });
      }
    } else if (item.label === "Update Location") {
      setSelectedProduct(row.original);
      setOpenUpdateLocationDialog(true);
    } else if (item.label === "Log Sale") {
      setSelectedProduct(row.original);
      setOpenLogSaleDialog(true);
    }
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="poppins">
          {menuItems.map((item, index) =>
            item.separator ? (
              <DropdownMenuSeparator key={index} />
            ) : (
              <DropdownMenuItem
                key={index}
                className={`flex items-center gap-1 p-[10px] ${item.className}`}
                onClick={() => handleClickedItem(item)}
              >
                {item.icon}
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
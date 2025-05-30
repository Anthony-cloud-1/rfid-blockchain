"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaInbox } from "react-icons/fa";
import ProductDropDown from "./ProductsDropDown";
import { ArrowUpDown } from "lucide-react";
import { IoMdArrowDown, IoMdArrowUp } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Product = {
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
};

type SortableHeaderProps = {
  column: Column<Product, unknown>;
  label: string;
};

const SortableHeader: React.FC<SortableHeaderProps> = ({ column, label }) => {
  const isSorted = column.getIsSorted();
  const SortingIcon =
    isSorted === "asc"
      ? IoMdArrowUp
      : isSorted === "desc"
      ? IoMdArrowDown
      : ArrowUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="" asChild>
        <div
          className={`flex items-start py-[14px] select-none cursor-pointer p-2 gap-1 ${
            isSorted && "text-primary"
          }`}
          aria-label={`Sort by ${label}`}
        >
          {label}
          <SortingIcon className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom">
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <IoMdArrowUp className="mr-2 h-4 w-4" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <IoMdArrowDown className="mr-2 h-4 w-4" />
          Desc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    cell: ({ row }) => {
      const Icon = row.original.icon;
      const name = row.original.name;
      return (
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-sm bg-primary/10 text-primary">
            {Icon}
          </div>
          <span>{name}</span>
        </div>
      );
    },
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
    meta: { label: "Name" },
  },
  {
    accessorKey: "sku",
    header: ({ column }) => <SortableHeader column={column} label="SKU" />,
    meta: { label: "SKU" },
  },
  {
    accessorKey: "batchNo",
    header: ({ column }) => <SortableHeader column={column} label="Batch No" />,
    meta: { label: "Batch No" },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => (
      <SortableHeader column={column} label="Expiry Date" />
    ),
    cell: ({ getValue }) => {
      const date = getValue<string>();
      return <span>{date}</span>;
    },
    meta: { label: "Expiry Date" },
  },
  {
    accessorKey: "origin",
    header: ({ column }) => <SortableHeader column={column} label="Origin" />,
    meta: { label: "Origin" },
  },
  {
    accessorKey: "location",
    header: ({ column }) => <SortableHeader column={column} label="Location" />,
    meta: { label: "Location" },
  },
  {
    accessorKey: "sold",
    header: ({ column }) => <SortableHeader column={column} label="Sold" />,
    cell: ({ getValue }) => {
      const sold = getValue<boolean>();
      return (
        <span
          className={`px-3 py-[2px] rounded-full font-medium ${
            sold ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-200"
          }`}
        >
          {sold ? "Yes" : "No"}
        </span>
      );
    },
    meta: { label: "Sold" },
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => <SortableHeader column={column} label="Sale Date" />,
    cell: ({ getValue }) => {
      const date = getValue<string>();
      return <span>{date || "N/A"}</span>;
    },
    meta: { label: "Sale Date" },
  },
  {
    accessorKey: "uid",
    header: ({ column }) => <SortableHeader column={column} label="NFC UID" />,
    meta: { label: "NFC UID" },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <SortableHeader column={column} label="Price" />,
    cell: ({ getValue }) => {
      const price = parseFloat(getValue<string>());
      return <span>${isNaN(price) ? "0.00" : price.toFixed(2)}</span>;
    },
    meta: { label: "Price" },
  },
  {
    accessorKey: "category",
    filterFn: "multiSelect",
    header: ({ column }) => <SortableHeader column={column} label="Category" />,
    meta: { label: "Category" },
  },
  {
    accessorKey: "quantityInStock",
    header: ({ column }) => (
      <SortableHeader column={column} label="Quantity In Stock" />
    ),
    meta: { label: "Quantity In Stock" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    filterFn: "multiSelect",
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass;
      let icon: ReactNode;

      switch (status) {
        case "arrived":
          colorClass = "text-green-600 bg-green-100";
          icon = <FaCheck className="text-[12px]" />;
          break;
        case "en route":
          colorClass = "text-gray-600 bg-gray-200";
          icon = <FaInbox />;
          break;
        case "sold":
          colorClass = "text-red-600 bg-red-100";
          icon = <IoClose />;
          break;
        default:
          colorClass = "text-gray-600 bg-gray-200";
          icon = <FaInbox />;
      }

      return (
        <span
          className={`px-3 py-[2px] rounded-full font-medium ${colorClass} flex gap-1 items-center w-fit`}
        >
          {icon}
          <span className="text-[13px]">{status}</span>
        </span>
      );
    },
    meta: { label: "Status" },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ProductDropDown row={row} />;
    },
  },
];
"use client";

import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaCheck, FaInbox } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Product } from "@/app/Products/columns";

export default function Status({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<Product["status"]>>;
}) {
  function returnColor(status: string) {
    switch (status) {
      case "en route":
        return "text-gray-600 bg-gray-100 data-[state=active]:text-gray-600 data-[state=active]:bg-gray-100";
      case "arrived":
        return "text-green-600 bg-green-100 data-[state=active]:text-green-600 data-[state=active]:bg-green-100";
      case "sold":
        return "text-blue-600 bg-blue-100 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-100";
      default:
        return "";
    }
  }

  return (
    <div>
      <Label className="text-slate-600">Status</Label>
      <Tabs
        value={selectedTab}
        onValueChange={(value: string) =>
          setSelectedTab(value as Product["status"])
        }
        className="mt-1"
      >
        <TabsList className="h-11 px-2">
          <TabsTrigger
            className={`h-8 ${returnColor("en route")}`}
            value="en route"
          >
            <FaInbox className="pr-1" />
            En Route
          </TabsTrigger>
          <TabsTrigger
            className={`h-8 ${returnColor("arrived")}`}
            value="arrived"
          >
            <FaCheck className="pr-1" />
            Arrived
          </TabsTrigger>
          <TabsTrigger
            className={`h-8 ${returnColor("sold")}`}
            value="sold"
          >
            <IoClose className="pr-1" />
            Sold
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
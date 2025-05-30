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

  useEffect(() => {
    console.log('Home useEffect: Mounting');
    setIsClient(true);
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (nfcText && !productId) {
      console.log('Home useEffect: NFC registration', { nfcText, uid });
      handleNfcRegister(nfcText, uid);
    }
  }, [nfcText, productId, uid]);

  const handleNfcRegister = async (text, tagId) => {
    try {
      console.log('handleNfcRegister:', { text, tagId });
      const response = await fetch(
        `http://localhost:3001/register?tagid=${encodeURIComponent(tagId)}&text=${encodeURIComponent(text)}`,
        { method: "GET" }
      );
      if (response.ok) {
        const result = await response.json();
        loadProducts();
        toast({
          title: "NFC Registration Successful",
          description: `Product registered: ${result.message}`,
        });
      } else {
        throw new Error("NFC registration failed");
      }
    } catch (error) {
      console.error("NFC Register Error:", error);
      toast({
        title: "NFC Registration Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (data, type) => {
    console.log('Form submitted:', type, data);
    try {
      let payload;
      if (type === "/updateLocation") {
        payload = {
          id: productId,
          location: data.location,
          price: data.price.toString(), // Convert to string for API
          status: data.status,
          uid,
        };
      } else if (type === "/logSale") {
        payload = {
          id: productId,
          saleDate: data.saleDate,
          price: data.price.toString(), // Convert to string for API
          sold: true,
          status: "sold",
          uid,
        };
      }

      const response = await fetch(`http://localhost:3001${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        loadProducts();
        if (type === "/updateLocation") updateLocationForm.reset();
        if (type === "/logSale") logSaleForm.reset();
        toast({
          title: `${type.slice(1)} Successful`,
          description: `Operation completed successfully.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }
    } catch (error) {
      console.error(`${type} Error:`, error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isClient) return null;

  return (
    <div className={`poppins p-5 ${bgColor} border w-full min-h-screen`}>
      <Toaster />
      <Card className="flex flex-col shadow-none p-5">
        <DeleteDialog />
        <AppHeader />
        {productId && (
          <Card className="mb-8 p-4 border rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-2">Manage Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form
                onSubmit={updateLocationForm.handleSubmit((data) =>
                  handleSubmit(data, "/updateLocation")
                )}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium">Location</label>
                  <Controller
                    name="location"
                    control={updateLocationForm.control}
                    render={({ field }) => (
                      <input {...field} className="w-full p-2 border rounded" />
                    )}
                  />
                  {updateLocationForm.formState.errors.location && (
                    <p className="text-red-500 text-sm">
                      {updateLocationForm.formState.errors.location.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <Controller
                    name="price"
                    control={updateLocationForm.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full p-2 border rounded"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {updateLocationForm.formState.errors.price && (
                    <p className="text-red-500 text-sm">
                      {updateLocationForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <Controller
                    name="status"
                    control={updateLocationForm.control}
                    render={({ field }) => (
                      <select {...field} className="w-full p-2 border rounded">
                        <option value="en route">En Route</option>
                        <option value="arrived">Arrived</option>
                        <option value="sold">Sold</option>
                      </select>
                    )}
                  />
                  {updateLocationForm.formState.errors.status && (
                    <p className="text-red-500 text-sm">
                      {updateLocationForm.formState.errors.status.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Update Location
                </Button>
              </form>
              <form
                onSubmit={logSaleForm.handleSubmit((data) =>
                  handleSubmit(data, "/logSale")
                )}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium">Sale Date</label>
                  <Controller
                    name="saleDate"
                    control={logSaleForm.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="w-full p-2 border rounded"
                      />
                    )}
                  />
                  {logSaleForm.formState.errors.saleDate && (
                    <p className="text-red-500 text-sm">
                      {logSaleForm.formState.errors.saleDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <Controller
                    name="price"
                    control={logSaleForm.control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full p-2 border rounded"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    )}
                  />
                  {logSaleForm.formState.errors.price && (
                    <p className="text-red-500 text-sm">
                      {logSaleForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Log Sale
                </Button>
              </form>
            </div>
          </Card>
        )}
        <AppTable />
      </Card>
    </div>
  );
}
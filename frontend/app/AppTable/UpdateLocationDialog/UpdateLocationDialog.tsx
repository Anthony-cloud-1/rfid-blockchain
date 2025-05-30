"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Location from "../ProductDialog/_components/Location";
import Price from "../ProductDialog/_components/Price";
import Status from "../ProductDialog/_components/Status";
import { useProductStore } from "../../useProductStore";
import { useToast } from "@/hooks/use-toast";
import { Product } from "../../Products/columns";

const UpdateLocationSchema = z.object({
    location: z.string().min(1, "Location is required"),
    price: z.number().nonnegative("Price cannot be negative"),
    status: z.enum(["en route", "arrived", "sold"], { message: "Invalid status" }),
});

type UpdateLocationFormData = z.infer<typeof UpdateLocationSchema>;

export default function UpdateLocationDialog() {
    const {
        loadProduct,
        selectedProduct,
        setSelectedProduct,
        openUpdateLocationDialog,
        setOpenUpdateLocationDialog,
        loadProducts,
    } = useProductStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<Product["status"]>("en route");
    const currentProductRef = useRef<string | null>(null);
    const dialogCloseRef = useRef<HTMLButtonElement | null>(null);

    const methods = useForm<UpdateLocationFormData>({
        resolver: zodResolver(UpdateLocationSchema),
        defaultValues: {
            location: "",
            price: 0,
            status: "en route",
        },
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        if (openUpdateLocationDialog && selectedProduct) {
            // Only initialize if the product has changed or it's the first open
            if (currentProductRef.current !== selectedProduct.id) {
                console.log('Initializing form for product:', selectedProduct.id);
                loadProduct(selectedProduct.id).then((product) => {
                    if (product) {
                        reset({
                            location: product.location,
                            price: Number(product.price) || 0,
                            status: product.status,
                        });
                        setSelectedTab(product.status);
                        currentProductRef.current = selectedProduct.id;
                    }
                });
            }
        } else if (!openUpdateLocationDialog) {
            // Reset everything when the dialog closes
            currentProductRef.current = null;
            reset({
                location: "",
                price: 0,
                status: "en route",
            });
            setSelectedTab("en route");
        }
    }, [openUpdateLocationDialog, selectedProduct, reset, loadProduct]);

    const onSubmit = async (data: UpdateLocationFormData) => {
        if (!selectedProduct) {
            toast({
                title: "Error",
                description: "No product selected.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        console.log('UpdateLocation payload:', { productId: selectedProduct.id, ...data });

        try {
            const response = await fetch("http://localhost:3001/updateLocation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    location: data.location,
                    price: data.price,
                    status: data.status,
                }),
            });

            const result = await response.json();
            console.log('UpdateLocation response:', result);

            if (response.ok) {
                loadProducts();
                toast({
                    title: "Success",
                    description: "Location updated successfully!",
                });
                dialogCloseRef.current?.click();
            } else {
                throw new Error(result.error || "Failed to update location.");
            }
        } catch (error) {
            console.error('UpdateLocation error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update location.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        reset();
        setSelectedProduct(null);
        currentProductRef.current = null;
    };

    return (
        <Dialog open={openUpdateLocationDialog} onOpenChange={setOpenUpdateLocationDialog}>
            <DialogContent className="p-7 px-8 poppins">
                <DialogHeader>
                    <DialogTitle className="text-[22px]">Update Product Location</DialogTitle>
                    <DialogDescription>
                        Update the location, price, and status for the selected product
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="grid grid-cols-2 gap-7">
                                <Location />
                                <Price />
                            </div>
                            <Status selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
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
                            <Button type="submit" className="h-11 px-11" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Location"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
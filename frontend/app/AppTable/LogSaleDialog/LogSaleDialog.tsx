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
import SaleDate from "../ProductDialog/_components/SaleDate";
import Price from "../ProductDialog/_components/Price";
import { useProductStore } from "../../useProductStore";
import { useToast } from "@/hooks/use-toast";

const LogSaleSchema = z.object({
    saleDate: z.string().min(1, "Sale Date is required"),
    price: z.number().nonnegative("Price cannot be negative"),
});

type LogSaleFormData = z.infer<typeof LogSaleSchema>;

export default function LogSaleDialog() {
    const {
        loadProduct,
        selectedProduct,
        setSelectedProduct,
        openLogSaleDialog,
        setOpenLogSaleDialog,
        loadProducts,
    } = useProductStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const currentProductRef = useRef<string | null>(null);
    const dialogCloseRef = useRef<HTMLButtonElement | null>(null);

    const methods = useForm<LogSaleFormData>({
        resolver: zodResolver(LogSaleSchema),
        defaultValues: {
            saleDate: new Date().toISOString().split("T")[0],
            price: 0,
        },
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        if (openLogSaleDialog && selectedProduct) {
            // Only initialize if the product has changed or it's the first open
            if (currentProductRef.current !== selectedProduct.id) {
                console.log('Initializing form for product:', selectedProduct.id);
                loadProduct(selectedProduct.id).then((product) => {
                    if (product) {
                        reset({
                            saleDate: product.saleDate || new Date().toISOString().split("T")[0],
                            price: Number(product.price) || 0,
                        });
                        currentProductRef.current = selectedProduct.id;
                    }
                });
            }
        } else if (!openLogSaleDialog) {
            // Reset everything when the dialog closes
            currentProductRef.current = null;
            reset({
                saleDate: new Date().toISOString().split("T")[0],
                price: 0,
            });
        }
    }, [openLogSaleDialog, selectedProduct, reset, loadProduct]);

    const onSubmit = async (data: LogSaleFormData) => {
        if (!selectedProduct) {
            toast({
                title: "Error",
                description: "No product selected.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        console.log('LogSale payload:', { productId: selectedProduct.id, ...data });

        try {
            const response = await fetch("http://localhost:3001/logSale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    saleDate: data.saleDate,
                    price: data.price,
                }),
            });

            const result = await response.json();
            console.log('LogSale response:', result);

            if (response.ok) {
                loadProducts();
                toast({
                    title: "Success",
                    description: "Sale logged successfully!",
                });
                dialogCloseRef.current?.click();
            } else {
                throw new Error(result.error || "Failed to log sale.");
            }
        } catch (error) {
            console.error('LogSale error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to log sale.",
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
        <Dialog open={openLogSaleDialog} onOpenChange={setOpenLogSaleDialog}>
            <DialogContent className="p-7 px-8 poppins">
                <DialogHeader>
                    <DialogTitle className="text-[22px]">Log Product Sale</DialogTitle>
                    <DialogDescription>
                        Log the sale date and price for the selected product
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="grid grid-cols-2 gap-7">
                                <SaleDate />
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
                            <Button type="submit" className="h-11 px-11" disabled={isLoading}>
                                {isLoading ? "Logging..." : "Log Sale"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
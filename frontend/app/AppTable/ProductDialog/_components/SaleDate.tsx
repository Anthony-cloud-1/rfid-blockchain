import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function SaleDate() {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="saleDate" className="text-slate-600">
                Sale Date
            </Label>
            <Input
                {...register("saleDate", { required: "Sale Date is required" })}
                type="date"
                id="saleDate"
                className="h-11 shadow-none"
            />
            {errors.saleDate && (
                <div className="text-red-500 flex gap-1 items-center text-[13px]">
                    <MdError />
                    <p>{errors.saleDate.message as string}</p>
                </div>
            )}
        </div>
    );
}
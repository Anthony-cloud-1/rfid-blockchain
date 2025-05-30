import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function ProductId() {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="productId" className="text-slate-600">
                Product ID
            </Label>
            <Input
                {...register("productId", { required: "Product ID is required" })}
                type="text"
                id="productId"
                className="h-11 shadow-none"
                placeholder="PID001"
            />
            {errors.productId && (
                <div className="text-red-500 flex gap-1 items-center text-[13px]">
                    <MdError />
                    <p>{errors.productId.message as string}</p>
                </div>
            )}
        </div>
    );
}

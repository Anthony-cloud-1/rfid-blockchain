import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function ExpiryDate() {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="expiryDate" className="text-slate-600">
                Expiry Date
            </Label>
            <Input
                {...register("expiryDate", { required: "Expiry Date is required" })}
                type="date"
                id="expiryDate"
                className="h-11 shadow-none"
            />
            {errors.expiryDate && (
                <div className="text-red-500 flex gap-1 items-center text-[13px]">
                    <MdError />
                    <p>{errors.expiryDate.message as string}</p>
                </div>
            )}
        </div>
    );
}

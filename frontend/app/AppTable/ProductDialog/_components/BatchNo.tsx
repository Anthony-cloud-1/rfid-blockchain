import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function BatchNo() {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="batchNo" className="text-slate-600">
                Batch Number
            </Label>
            <Input
                {...register("batchNo", { required: "Batch Number is required" })}
                type="text"
                id="batchNo"
                className="h-11 shadow-none"
                placeholder="Batch003"
            />
            {errors.batchNo && (
                <div className="text-red-500 flex gap-1 items-center text-[13px]">
                    <MdError />
                    <p>{errors.batchNo.message as string}</p>
                </div>
            )}
        </div>
    );
}
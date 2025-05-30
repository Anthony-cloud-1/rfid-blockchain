import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function Location() {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="location" className="text-slate-600">
                Location
            </Label>
            <Input
                {...register("location", { required: "Location is required" })}
                type="text"
                id="location"
                className="h-11 shadow-none"
                placeholder="Nairobi..."
            />
            {errors.location && (
                <div className="text-red-500 flex gap-1 items-center text-[13px]">
                    <MdError />
                    <p>{errors.location.message as string}</p>
                </div>
            )}
        </div>
    );
}
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function Origin() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="origin" className="text-slate-600">
        Origin
      </Label>
      <Input
        {...register("origin")}
        type="text"
        id="origin"
        className="h-11 shadow-none"
        placeholder="Warehouse..."
      />
      {errors.origin && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{errors.origin.message as string}</p>
        </div>
      )}
    </div>
  );
}
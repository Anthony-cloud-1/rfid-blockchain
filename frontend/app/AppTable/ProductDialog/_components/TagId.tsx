import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function TagId() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="tagid" className="text-slate-600">
        Tag ID (UID)
      </Label>
      <Input
        {...register("tagid", { required: "Tag ID is required" })}
        type="text"
        id="tagid"
        className="h-11 shadow-none"
        placeholder="RFID123"
      />
      {errors.tagid && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{errors.tagid.message as string}</p>
        </div>
      )}
    </div>
  );
}

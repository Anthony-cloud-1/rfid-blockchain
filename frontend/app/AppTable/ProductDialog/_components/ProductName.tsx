import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { IconSelector } from "../IconSelector";
import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

export default function ProductName({
  onSelectedIcon,
}: {
  onSelectedIcon: (selectedIcon: ReactNode) => void;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  function getSelectedIcon(selectedIcon: ReactNode) {
    onSelectedIcon(selectedIcon);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="name" className="text-slate-600">
        Product Name
      </Label>
      <div className="flex gap-2 items-center">
        <Input
          {...register("name", { required: "Product Name is required" })}
          type="text"
          id="name"
          className="h-11 shadow-none"
          placeholder="Laptop..."
        />
        <IconSelector onUpdateIcon={getSelectedIcon} />
      </div>
      {errors.name && (
        <div className="text-red-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>{errors.name.message as string}</p>
        </div>
      )}
    </div>
  );
}
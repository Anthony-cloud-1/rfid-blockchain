"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandInput,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LuColumns4 } from "react-icons/lu"; // Updated to LuColumns4
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Table } from "@tanstack/react-table";

type ColumnsDropDownProps<TData> = {
    table: Table<TData>;
};

export function ColumnsDropDown<TData>({ table }: ColumnsDropDownProps<TData>) {
    const [open, setOpen] = React.useState(false);
    const columns = table
        .getAllColumns()
        .filter((col) => col.columnDef.meta?.label);

    return (
        <div className="flex items-center space-x-4 poppins">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="secondary" className="h-10">
                        <LuColumns4 className="mr-2" /> {/* Updated to LuColumns4 */}
                        Columns
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-56 poppins" side="bottom" align="end">
                    <Command className="p-1">
                        <CommandInput placeholder="Search columns..." />
                        <CommandList>
                            <CommandEmpty className="text-slate-500 text-sm text-center p-5">
                                No column found.
                            </CommandEmpty>
                            <CommandGroup>
                                {columns.map((column) => (
                                    <CommandItem className="h-9" key={column.id}>
                                        <Checkbox
                                            checked={column.getIsVisible()}
                                            onCheckedChange={() => column.toggleVisibility()}
                                            className="size-4 rounded-[4px] mr-2"
                                        />
                                        <div className="flex items-center gap-1 p-1 rounded-lg px-3 text-[14px]">
                                            {column.columnDef.meta.label}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <div className="flex flex-col gap-2 text-[23px]">
                            <Separator />
                            <Button
                                onClick={() => table.resetColumnVisibility()}
                                variant="ghost"
                                className="text-[12px] mb-1"
                            >
                                Reset Columns
                            </Button>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
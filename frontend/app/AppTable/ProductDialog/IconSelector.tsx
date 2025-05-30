"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentType,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { icons } from "./Icons";

// Types
export type SingleIcon = {
  id: number;
  icon: React.ReactNode;
  isSelected: boolean;
};

type IconContextType = {
  updateSelectedIcon: (icon: ReactNode) => void;
  openDialog: boolean;
  updateOpenDialog: (openDialog: boolean) => void;
  allIcons: SingleIcon[];
  setAllIcons: React.Dispatch<React.SetStateAction<SingleIcon[]>>;
};

// Context
const IconContext = createContext<IconContextType | undefined>(undefined);

// Provider Component
export const IconProvider = ({
  children,
  iconsArray,
  onUpdateIcon,
}: {
  children: ReactNode;
  iconsArray: SingleIcon[];
  onUpdateIcon: (selectedIcon: ReactNode) => void;
}) => {
  const [openDialog, updateOpenDialog] = useState(false);
  const [allIcons, setAllIcons] = useState<SingleIcon[]>(iconsArray);

  const updateSelectedIcon = (icon: ReactNode) => {
    const updatedIcons = allIcons.map((singleIcon) => ({
      ...singleIcon,
      isSelected: singleIcon.icon === icon,
    }));
    setAllIcons(updatedIcons);
    onUpdateIcon(icon);
  };

  return (
    <IconContext.Provider
      value={{
        updateSelectedIcon,
        openDialog,
        updateOpenDialog,
        allIcons,
        setAllIcons,
      }}
    >
      {children}
    </IconContext.Provider>
  );
};

// Custom Hook
export const useIconContext = () => {
  const context = useContext(IconContext);
  if (!context) {
    throw new Error("useIconContext must be used within an IconProvider");
  }
  return context;
};

// Utility Functions
export function convertIconToString(icon: ReactNode): string | null {
  if (icon && (icon as React.ReactElement).type) {
    const iconType = (icon as React.ReactElement).type;
    if (typeof iconType === "function") {
      const iconName = (iconType as ComponentType).displayName || iconType.name;
      return iconName;
    }
  }
  return null;
}

// Icon Dialog Box Component
export function IconDialogBox() {
  const {
    updateSelectedIcon,
    openDialog,
    updateOpenDialog,
    allIcons,
    setAllIcons,
  } = useIconContext();

  function updateSelection(singleIconProp: SingleIcon) {
    setAllIcons((prevArray) =>
      prevArray.map((singleIcon) => ({
        ...singleIcon,
        isSelected: singleIcon.id === singleIconProp.id,
      }))
    );
    updateSelectedIcon(singleIconProp.icon);
    updateOpenDialog(false);
  }

  if (!isAllIconsValid(allIcons)) {
    throw new Error("The allIcons array structure is invalid");
  }

  function isAllIconsValid(allIcons: unknown): allIcons is SingleIcon[] {
    if (!Array.isArray(allIcons)) {
      throw Error("Please provide an array");
    }
    return allIcons.every(
      (icon) =>
        typeof icon.id === "number" &&
        typeof icon.isSelected === "boolean" &&
        React.isValidElement(icon.icon)
    );
  }

  return (
    <Dialog open={openDialog} onOpenChange={updateOpenDialog}>
      <DialogTrigger asChild>
        <Button className="h-11">
          {allIcons.find((icon) => icon.isSelected)?.icon || "Select Icon"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl mt-5">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Pick an icon to represent your content. You can update it anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full border rounded-lg p-3 flex flex-wrap gap-2 mt-5">
          {allIcons.map((singleIcon, index) => (
            <div
              className={`rounded-md border p-3 hover:bg-primary hover:text-white ${
                singleIcon.isSelected
                  ? "bg-primary text-white border-none"
                  : "text-slate-400"
              }`}
              key={index}
              onClick={() => updateSelection(singleIcon)}
            >
              {singleIcon.icon}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Icon Selector Component
export function IconSelector({
  onUpdateIcon,
}: {
  onUpdateIcon: (selectedIcon: ReactNode) => void;
}) {
  return (
    <IconProvider iconsArray={icons} onUpdateIcon={onUpdateIcon}>
      <IconDialogBox />
    </IconProvider>
  );
}
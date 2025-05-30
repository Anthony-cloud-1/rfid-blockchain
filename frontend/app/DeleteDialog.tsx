import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProductStore } from "./useProductStore";
import { useToast } from "@/hooks/use-toast";

export function DeleteDialog() {
  const {
    openDialog,
    setOpenDialog,
    setSelectedProduct,
    selectedProduct,
    isLoading,
    deleteProduct,
  } = useProductStore();
  const { toast } = useToast();

  async function deleteProductFx() {
    if (selectedProduct) {
      const result = await deleteProduct(selectedProduct.productId);
      if (result.success) {
        toast({
          title: "Product Deleted",
          description: `The product [${selectedProduct.productId}] has been deleted successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
      }}
    >
      <AlertDialogContent className="p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2">
            This action cannot be undone. This will permanently delete the
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogCancel
            onClick={() => {
              setSelectedProduct(null);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteProductFx()}>
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
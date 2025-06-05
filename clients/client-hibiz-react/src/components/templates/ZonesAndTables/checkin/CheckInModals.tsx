import type React from "react";
import { memo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCheckInStore } from "@/components/store/useCheckInStore";
import {
  useCreateCheckIn,
  useUpdateCheckIn,
  useDeleteCheckIn,
} from "@/hooks/useCheckIn";

const CreateModal = memo(() => {
  const {
    isCreateModalOpen,
    closeCreateModal,
    formData,
    setFormData,
    businessId,
  } = useCheckInStore();

  const { createCheckIn, isCreatingCheckIn } = useCreateCheckIn();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;

      try {
        await createCheckIn({
          name: formData.name,
          businessId: businessId,
        });
        closeCreateModal();
      } catch (error) {
        console.error("Error creating check-in QR:", error);
      }
    },
    [formData.name, businessId, createCheckIn, closeCreateModal],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ name: e.target.value });
    },
    [setFormData],
  );

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={closeCreateModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Check-in QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">QR Code Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter QR code name"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeCreateModal}
              disabled={isCreatingCheckIn}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatingCheckIn || !formData.name.trim()}
            >
              {isCreatingCheckIn ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CreateModal.displayName = "CreateModal";

const EditModal = memo(() => {
  const { isEditModalOpen, closeEditModal, formData, setFormData, selectedQr } =
    useCheckInStore();

  const { updateCheckIn, isUpdatingCheckIn } = useUpdateCheckIn();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim() || !selectedQr) return;

      try {
        await updateCheckIn({
          _id: selectedQr._id,
          name: formData.name,
        });
        closeEditModal();
      } catch (error) {
        console.error("Error updating check-in QR:", error);
      }
    },
    [formData.name, selectedQr, updateCheckIn, closeEditModal],
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ name: e.target.value });
    },
    [setFormData],
  );

  return (
    <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Check-in QR Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">QR Code Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Enter QR code name"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditModal}
              disabled={isUpdatingCheckIn}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingCheckIn || !formData.name.trim()}
            >
              {isUpdatingCheckIn ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

EditModal.displayName = "EditModal";

const DeleteModal = memo(() => {
  const { isDeleteModalOpen, closeDeleteModal, selectedQr } = useCheckInStore();

  const { deleteCheckIn, isDeletingCheckIn } = useDeleteCheckIn();

  const handleDelete = useCallback(async () => {
    if (!selectedQr) return;

    try {
      await deleteCheckIn(selectedQr._id);
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting check-in QR:", error);
    }
  }, [selectedQr, deleteCheckIn, closeDeleteModal]);

  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={closeDeleteModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Check-in QR Code</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{selectedQr?.name}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingCheckIn}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingCheckIn}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletingCheckIn ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

DeleteModal.displayName = "DeleteModal";

const CheckInModals = memo(() => {
  return (
    <>
      <CreateModal />
      <EditModal />
      <DeleteModal />
    </>
  );
});

CheckInModals.displayName = "CheckInModals";

export default CheckInModals;

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react";
import { devLog } from "@/lib/utils/logging/dev-logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { VisitorFormDialog, VisitorFormValues } from "../VisitorFormDialog";
import { VisitorWithFarm } from "@/lib/types/visitor";
import { BUTTONS, PAGE_HEADER } from "@/lib/constants/visitor";

interface VisitorActionMenuProps {
  visitor: VisitorWithFarm;
  onEdit?: (visitor: VisitorWithFarm) => Promise<void>;
  onDelete?: (visitor: VisitorWithFarm) => Promise<void>;
  onSuccess?: () => void;
}

export function VisitorActionMenu({
  visitor,
  onEdit,
  onDelete,
  onSuccess,
}: VisitorActionMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (isProcessing || !onDelete) return;

    try {
      setIsProcessing(true);
      await onDelete(visitor);
      setShowDeleteDialog(false);
      onSuccess?.();
    } catch (error) {
      devLog.error("Error in handleDelete:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (values: VisitorFormValues) => {
    if (isProcessing || !onEdit) return;

    try {
      setIsProcessing(true);
      await onEdit({
        ...visitor,
        ...values,
      });

      setShowEditDialog(false);
      onSuccess?.();
    } catch (error) {
      devLog.error("방문자 수정 실패:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDropdownOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setIsDropdownOpen(open);
    }
  };

  const handleEditClick = () => {
    if (!isProcessing) {
      setShowEditDialog(true);
      setIsDropdownOpen(false);
    }
  };

  const handleDeleteClick = () => {
    if (!isProcessing) {
      setShowDeleteDialog(true);
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
            disabled={isProcessing}
          >
            <span className="sr-only">{BUTTONS.VISITOR_ACTION_MENU_OPEN}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditClick} disabled={isProcessing}>
            <Pencil className="mr-2 h-4 w-4" />
            {BUTTONS.VISITOR_ACTION_MENU_EDIT}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-destructive"
            disabled={isProcessing}
          >
            <Trash className="mr-2 h-4 w-4" />
            {BUTTONS.VISITOR_ACTION_MENU_DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {PAGE_HEADER.VISITOR_ACTION_MENU_DELETE_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {PAGE_HEADER.VISITOR_ACTION_MENU_DELETE_DESC.replace(
                "{name}",
                visitor.visitor_name
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              {BUTTONS.VISITOR_FORM_DIALOG_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {BUTTONS.VISITOR_ACTION_MENU_DELETING}
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  {BUTTONS.VISITOR_ACTION_MENU_DELETE}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VisitorFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        initialData={visitor}
        farmId={visitor.farm_id}
        onSuccess={handleUpdate}
        isLoading={false} // 이미 로드된 데이터를 사용하므로 false
      />
    </>
  );
}

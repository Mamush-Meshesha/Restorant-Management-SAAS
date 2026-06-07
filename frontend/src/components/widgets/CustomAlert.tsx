import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Trash2,
  X,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type AlertType = "danger" | "warning" | "info" | "success";
type AlertAction = "delete" | "activate" | "deactivate" | "default" | "confirm";

type CustomAlertProps = {
  open: boolean;
  title: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onCancel?: () => void;
  onAction?: () => void;
  type?: AlertType;
  action?: AlertAction;
  loading?: boolean;
};

export function CustomAlert({
  open,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onCancel,
  onAction,
  // type removed since getIcon was removed
  action = "default",
  loading = false,
}: CustomAlertProps) {
  // Handle onOpenChange to ensure proper cleanup when modal is closed by backdrop/escape
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !loading && onCancel) {
      onCancel();
    }
  };

  // Cleanup effect to ensure no lingering modal states
  useEffect(() => {
    if (!open) {
      // Small delay to ensure DOM cleanup
      const cleanup = setTimeout(() => {
        // Remove any lingering modal backdrop elements
        const backdropElements = document.querySelectorAll(
          "[data-radix-alert-dialog-overlay]"
        );
        backdropElements.forEach((element) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });

        // Reset any stuck pointer-events styles
        document.body.style.pointerEvents = "";
        const appElement =
          document.getElementById("root") ||
          document.querySelector("#__next") ||
          document.body;
        appElement.style.pointerEvents = "";

        // Remove any inline styles that might block interactions
        const allElements = document.querySelectorAll(
          '[style*="pointer-events"]'
        );
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          if (element.style.pointerEvents === "none") {
            element.style.pointerEvents = "";
          }
        });
      }, 100);

      return () => clearTimeout(cleanup);
    }
  }, [open]);

  // Get appropriate colors and styles
  const getTypeStyles = () => {
    switch (action) {
      case "delete":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          borderAccent: "border-l-red-500",
        };
      case "activate":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          borderAccent: "border-l-green-500",
        };
      case "deactivate":
        return {
          badge: "bg-orange-100 text-orange-700 border-orange-200",
          button: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
          borderAccent: "border-l-orange-500",
        };
      case "confirm":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          borderAccent: "border-l-green-500",
        };
      default:
        return {
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          borderAccent: "border-l-blue-500",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div style={{ zIndex: 10000, position: "relative" }}>
      <style>
        {`
          [data-radix-alert-dialog-overlay] {
            z-index: 10000 !important;
            pointer-events: auto !important;
            position: fixed !important;
          }
          [data-radix-alert-dialog-content] {
            z-index: 10001 !important;
            pointer-events: auto !important;
            position: fixed !important;
          }
          /* Ensure body doesn't get pointer-events disabled */
          body[style*="pointer-events"] {
            pointer-events: auto !important;
          }
          /* Ensure root elements stay interactive */
          #root, #__next {
            pointer-events: auto !important;
          }
        `}
      </style>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border-0 overflow-hidden"
          onEscapeKeyDown={(e: KeyboardEvent) => {
            if (loading) {
              e.preventDefault();
            }
          }}
        >
          {/* Enhanced Header with Icon and Close Button */}
          <div
            className={cn(
              "flex items-start justify-between px-3  py-2",
            )}
          >
            <div className="flex items-center  gap-4">
              {/* <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                {getIcon()}
              </div> */}
              <div className="flex-1">
                <AlertDialogHeader className="space-y-2 p-0">
                  <div className="flex items-center gap-2 mb-5">
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900 leading-tight">
                      {title}
                    </AlertDialogTitle>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs px-2 py-1", styles.badge)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Badge>
                  </div>
                  {description && (
                    <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
                      {description}
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>
              </div>
            </div>

            {/* Enhanced Close Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 flex items-center justify-center group",
                loading && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>

          {/* Enhanced Footer */}
          <AlertDialogFooter className="p-6 pt-4 bg-gray-50/50 gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 h-11"
            >
              <X className="w-4 h-4 mr-2" />
              {cancelText}
            </Button>
            <Button
              onClick={onAction}
              disabled={loading}
              className={cn(
                "flex-1 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-11 font-medium",
                styles.button,
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <>
                  {action === "delete" && <Trash2 className="w-4 h-4 mr-2" />}
                  {action === "activate" && (
                    <UserCheck className="w-4 h-4 mr-2" />
                  )}
                  {action === "deactivate" && (
                    <UserX className="w-4 h-4 mr-2" />
                  )}
                  {action === "default" && (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                </>
              )}
              {loading ? "Processing..." : actionText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
  loading?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
  customButtons?: React.ReactNode;
  hideSubmit?: boolean;
  isEdit?: boolean;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg" | "xl" | "xxl" | "full";
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CustomModal2({
  open,
  onClose,
  title,
  subtitle,
  onSubmit,
  children,
  submitLabel,
  loading = false,
  customButtons,
  hideSubmit = false,
  isEdit = false,
  variant = "default",
  size = "md",
  // showIcon = true,
  showBadge = false,
  badgeText,
  badgeVariant = "default",
  closeOnOverlayClick = true,
  showCloseButton = true,
  preventClose = false,
  onEdit,
  onDelete,
}: CustomModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose, preventClose]);

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
          accentColor: "from-green-400 via-emerald-500 to-teal-500",
          buttonColor: "from-green-500 to-emerald-600",
          borderColor: "from-green-400/50 to-emerald-500/50",
          bgColor: "from-green-50/20 to-emerald-50/20",
          glowColor: "rgba(34, 197, 94, 0.1)",
        };
      case "warning":
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          accentColor: "from-yellow-400 via-orange-500 to-red-500",
          buttonColor: "from-yellow-500 to-orange-600",
          borderColor: "from-yellow-400/50 to-orange-500/50",
          bgColor: "from-yellow-50/20 to-orange-50/20",
          glowColor: "rgba(245, 158, 11, 0.1)",
        };
      case "danger":
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          accentColor: "from-red-400 via-pink-500 to-rose-500",
          buttonColor: "from-red-500 to-pink-600",
          borderColor: "from-red-400/50 to-pink-500/50",
          bgColor: "from-red-50/20 to-pink-50/20",
          glowColor: "rgba(239, 68, 68, 0.1)",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          accentColor: "from-blue-400 via-cyan-500 to-teal-500",
          buttonColor: "from-blue-500 to-cyan-600",
          borderColor: "from-blue-400/50 to-cyan-500/50",
          bgColor: "from-blue-50/20 to-cyan-50/20",
          glowColor: "rgba(59, 130, 246, 0.1)",
        };
      default:
        return {
          icon: isEdit ? (
            <Edit3 className="w-6 h-6 text-blue-500" />
          ) : (
            <Plus className="w-6 h-6 text-blue-500" />
          ),
          accentColor: "from-blue-400 via-indigo-500 to-purple-500",
          buttonColor: "from-blue-500 to-indigo-600",
          borderColor: "from-blue-400/50 to-indigo-500/50",
          bgColor: "from-blue-50/20 to-indigo-50/20",
          glowColor: "rgba(59, 130, 246, 0.1)",
        };
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    if (isFullscreen) return "w-screen h-screen max-w-none max-h-none";

    switch (size) {
      case "sm":
        return "max-w-md w-[95vw] max-h-[90vh]";
      case "md":
        return "max-w-2xl w-[95vw] max-h-[90vh]";
      case "lg":
        return "max-w-3xl w-[95vw] max-h-[80vh]";
      case "xl":
        return "max-w-6xl w-[95vw] max-h-[90vh]";
      case "xxl":
        return "max-w-7xl w-[95vw] max-h-[90vh]";
      case "full":
        return "w-[98vw] h-[95vh] max-w-none max-h-none";
      default:
        return "max-w-2xl w-[95vw] max-h-[90vh]";
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" } as any}
          style={{ pointerEvents: "auto" }}
        >
          {/* Backdrop with glassmorphism effect */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" } as any}
            onClick={closeOnOverlayClick && !preventClose ? onClose : undefined}
            style={{
              cursor:
                closeOnOverlayClick && !preventClose ? "pointer" : "default",
              pointerEvents: "auto",
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at center, ${variantStyles.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* Modal Container */}
          <motion.div
            className={cn(
              "relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden",
              sizeStyles
            )}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
              rotateX: -15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20,
              rotateX: -15,
            }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              pointerEvents: "auto",
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient border effect */}
            <div
              className="absolute inset-0 rounded-2xl p-[1px]"
              style={{
                background: `linear-gradient(135deg, ${variantStyles.borderColor})`,
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
              }}
            />

            <form onSubmit={onSubmit} className="h-full flex flex-col">
              {/* Enhanced Header - Fixed */}
              <motion.div
                className={cn(
                  "relative px-6 py-4 flex-shrink-0",
                  "bg-gradient-to-br from-white/90 to-white/70",
                  "border-b border-white/20"
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {/* Header content */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    {/* {showIcon && (
                      <motion.div
                        className="flex-shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.2,
                          duration: 0.4,
                          type: "spring",
                        }}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            "bg-gradient-to-br from-white/80 to-white/60",
                            "border border-white/30 shadow-lg",
                            "backdrop-blur-sm"
                          )}
                        >
                          {variantStyles.icon}
                        </div>
                      </motion.div>
                    )} */}

                    {/* Title and subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.h2
                          className="text-xl font-bold text-slate-800 leading-tight"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          {title}
                        </motion.h2>

                        {/* Badge */}
                        {showBadge && badgeText && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                          >
                            <Badge
                              variant={badgeVariant}
                              className={cn(
                                "text-xs font-semibold px-3 py-1.5",
                                "bg-gradient-to-r from-white/80 to-white/60",
                                "border border-white/30 text-slate-700",
                                "backdrop-blur-sm shadow-sm"
                              )}
                            >
                              {badgeText}
                            </Badge>
                          </motion.div>
                        )}
                      </div>

                      {subtitle && (
                        <motion.p
                          className="text-slate-600 text-base leading-relaxed"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          {subtitle}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Header actions */}
                  <div className="flex items-center gap-2">
                    {/* Fullscreen toggle */}
                    {size === "full" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="w-8 h-8 p-0 rounded-lg hover:bg-white/20 transition-all duration-200"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-slate-600" />
                        )}
                      </Button>
                    )}

                    {/* Close button */}
                    {showCloseButton && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onClose}
                          disabled={preventClose}
                          className="w-8 h-8 p-0 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Content - Scrollable */}
              <motion.div
                className="px-6 py-6 overflow-y-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                style={{
                  height: "calc(100% - 88px - 88px)", // 100% - header height (88px) - footer height (88px)
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
                }}
              >
                <div className="space-y-4">{children}</div>
              </motion.div>

              {/* Footer - Fixed */}
              <motion.div
                className="px-6 py-4 flex-shrink-0 bg-gradient-to-t from-white/80 to-white/60 border-t border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="flex items-center justify-between w-full">
                  {/* Left side - loading indicator */}
                  {/* <div className="flex items-center gap-2 text-sm text-slate-500">
                    {loading && (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Processing...</span>
                      </motion.div>
                    )}
                  </div> */}
                  <div></div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-3">
                    {/* Custom buttons */}
                    {customButtons && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        {customButtons}
                      </motion.div>
                    )}

                    {/* Cancel button */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading || preventClose}
                        className={cn(
                          "gap-2 px-6 py-2.5 h-11 font-medium rounded-xl",
                          "border-white/30 text-slate-700 hover:bg-white/20",
                          "hover:border-white/40 transition-all duration-200",
                          "backdrop-blur-sm bg-white/60"
                        )}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </motion.div>
                    {onDelete && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.3 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={onDelete}
                          disabled={loading}
                          aria-label={
                            loading
                              ? "Processing delete request..."
                              : "Delete item"
                          }
                          className={cn(
                            "gap-2 px-6 py-2.5 h-11 font-medium rounded-xl",
                            "border-red-500/30 text-red-700 hover:bg-red-50",
                            "hover:border-red-500/50 transition-all duration-200",
                            "backdrop-blur-sm bg-red-50/60",
                            "hover:shadow-md hover:scale-105 focus:ring-2 focus:ring-red-500/20",
                            loading &&
                              "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md"
                          )}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {loading ? "Processing..." : "Delete"}
                        </Button>
                      </motion.div>
                    )}
                    {onEdit && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={onEdit}
                          disabled={loading}
                          aria-label={
                            loading ? "Processing edit request..." : "Edit item"
                          }
                          className={cn(
                            "gap-2 px-6 py-2.5 h-11 font-medium rounded-xl",
                            "border-emerald-500/30 text-emerald-700 hover:bg-emerald-50",
                            "hover:border-emerald-500/50 transition-all duration-200",
                            "backdrop-blur-sm bg-emerald-50/60",
                            "hover:shadow-md hover:scale-105 focus:ring-2 focus:ring-emerald-500/20",
                            loading &&
                              "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md"
                          )}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit3 className="w-4 h-4" />
                          )}
                          {loading ? "Processing..." : "Edit"}
                        </Button>
                      </motion.div>
                    )}
                    

                    {/* Submit button */}
                    {onSubmit && !hideSubmit && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        style={{ pointerEvents: "auto" }}
                      >
                        <Button
                          type="submit"
                          disabled={loading}
                          className={cn(
                            "gap-2 px-6 py-2.5 h-11 font-medium rounded-xl",
                            "transition-all duration-200",
                            "shadow-lg hover:shadow-xl",
                            "bg-gradient-to-r text-white",
                            variantStyles.buttonColor,
                            "hover:shadow-2xl",
                            "cursor-pointer relative z-10",
                            "active:scale-95 hover:scale-[1.02]"
                          )}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : variant === "success" ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isEdit ? (
                            <Edit3 className="w-4 h-4" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {loading
                            ? "Processing..."
                            : submitLabel || (isEdit ? "Update" : "Save")}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

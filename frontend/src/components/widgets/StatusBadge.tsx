import React from "react";

export type StatusVariant =
  | "current"
  | "past"
  | "upcoming"
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "draft"
  | "published"
  | "success"
  | "warning"
  | "error"
  | "info";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  className = "",
  size = "sm",
}) => {
  const getVariantClasses = (variant: StatusVariant): string => {
    const variants = {
      current: "bg-green-50 text-green-700 ring-green-600/20",
      active: "bg-green-50 text-green-700 ring-green-600/20",
      success: "bg-green-50 text-green-700 ring-green-600/20",
      approved: "bg-green-50 text-green-700 ring-green-600/20",
      completed: "bg-green-50 text-green-700 ring-green-600/20",
      published: "bg-green-50 text-green-700 ring-green-600/20",

      past: "bg-red-50 text-red-700 ring-red-600/20",
      inactive: "bg-red-50 text-red-700 ring-red-600/20",
      rejected: "bg-red-50 text-red-700 ring-red-600/20",
      error: "bg-red-50 text-red-700 ring-red-600/20",

      upcoming: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      warning: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      draft: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",

      info: "bg-blue-50 text-blue-700 ring-blue-600/20",
    };

    return variants[variant] || variants.info;
  };

  const getSizeClasses = (size: "sm" | "md" | "lg"): string => {
    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    };

    return sizes[size];
  };

  const baseClasses =
    "inline-flex items-center rounded-md font-medium ring-1 ring-inset";
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default StatusBadge;

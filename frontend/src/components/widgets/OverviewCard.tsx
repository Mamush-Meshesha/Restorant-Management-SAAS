import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideProps } from "lucide-react";

type LucideIcon = React.ComponentType<LucideProps>;

interface OverviewCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  gradient?:
    | "blue"
    | "green"
    | "pink"
    | "emerald"
    | "amber"
    | "orange"
    | "purple"
    | "indigo";
  additionalContent?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
}

const gradientClasses = {
  blue: "from-blue-500 to-purple-600",
  green: "from-green-500 to-emerald-600",
  pink: "from-pink-500 to-rose-600",
  emerald: "from-emerald-500 to-teal-600",
  amber: "from-amber-500 to-orange-600",
  orange: "from-orange-500 to-red-600",
  purple: "from-purple-500 to-indigo-600",
  indigo: "from-indigo-500 to-blue-600",
};

const textColors = {
  blue: "text-blue-100",
  green: "text-green-100",
  pink: "text-pink-100",
  emerald: "text-emerald-100",
  amber: "text-amber-100",
  orange: "text-orange-100",
  purple: "text-purple-100",
  indigo: "text-indigo-100",
};

export default function OverviewCard({
  icon: Icon,
  title,
  value,
  gradient = "blue",
  additionalContent,
  className = "",
  iconClassName = "w-6 h-6 text-white",
  titleClassName = "",
  valueClassName = "text-xl font-bold",
}: OverviewCardProps) {
  return (
    <Card
      className={`border-0 shadow-xl bg-gradient-to-r ${gradientClasses[gradient]} text-white ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className={iconClassName} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium ${textColors[gradient]} ${titleClassName}`}
            >
              {title}
            </p>
            <div className={valueClassName}>{value}</div>
            {additionalContent && (
              <div className="mt-1">{additionalContent}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

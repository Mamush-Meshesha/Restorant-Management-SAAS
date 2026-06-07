import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { Link } from "react-router-dom";

export const InfoField = ({
  icon,
  label,
  value,
  highlight = false,
  fullWidth = false,
  link,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  fullWidth?: boolean;
  link?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "flex items-start gap-2 p-2.5 rounded-lg border transition-all duration-200",
      "hover:shadow-sm hover:border-slate-300/80",
      fullWidth ? "col-span-full" : "",
      highlight
        ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-blue-200/60"
        : "bg-white/60 backdrop-blur-sm border-slate-200/60"
    )}
  >
    <div
      className={cn(
        "p-1.5 rounded-md flex-shrink-0",
        highlight
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          : "bg-slate-100/80 text-slate-600"
      )}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-600 mb-0.5">{label}</p>
      {link ? (
        <Link
          to={link}
          className={cn(
            "text-sm font-semibold underline text-blue-600 hover:text-blue-800 transition-colors",
            highlight ? "text-slate-800" : ""
          )}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {value}
        </Link>
      ) : (
        <p
          className={cn(
            "text-sm font-semibold",
            highlight ? "text-slate-800" : "text-slate-700"
          )}
        >
          {value}
        </p>
      )}
    </div>
  </motion.div>
);

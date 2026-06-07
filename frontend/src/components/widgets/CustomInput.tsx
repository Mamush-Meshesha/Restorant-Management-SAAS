import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
// import { FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  Check,
  ChevronDown,
  Upload,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export interface BaseFieldProps<T extends FieldValues = FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  required?: boolean;
  description?: string;
  placeholder?: string;
  endIcon?: React.ReactNode;
  startIcon?: React.ReactNode;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  className?: string;
  options?: { label: string; value: string }[];
  tooltip?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export const FormInput = <T extends FieldValues,>({
  label,
  name,
  control,
  type = "text",
  endIcon,
  startIcon,
  required,
  description,
  placeholder,
  tooltip,
  disabled,
  readOnly,
  autoComplete,
  maxLength,
  minLength,
  min,
  max,
  step,
  pattern,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: BaseFieldProps<T>) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Generate unique IDs for accessibility
  const inputId = `${String(name)}-input`;
  const descriptionId = description ? `${String(name)}-description` : undefined;
  const errorId = `${String(name)}-error`;
  const tooltipId = tooltip ? `${String(name)}-tooltip` : undefined;

  // Determine if password toggle should be shown
  const isPasswordType = type === "password";
  const actualType = isPasswordType && showPassword ? "text" : type;

  // Build aria-describedby string
  const buildAriaDescribedBy = (hasError: boolean) => {
    const ids = [
      ariaDescribedBy,
      descriptionId,
      hasError ? errorId : undefined,
      tooltipId,
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  return (
    <div className={cn("space-y-2 flex-1 group", className)}>
      {/* Label and Tooltip */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-medium tracking-wide",
              "text-slate-500 group-hover:text-slate-600 transition-colors",
              disabled && "text-slate-400"
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required field">
                *
              </span>
            )}
          </Label>

          {tooltip && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                aria-describedby={tooltipId}
                aria-label="Show help information"
              >
                <Info className="w-4 h-4" />
              </button>

              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute z-10 left-0 top-full mt-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg max-w-xs"
                  id={tooltipId}
                  role="tooltip"
                >
                  {tooltip}
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-slate-800 rotate-45" />
                </motion.div>
              )}
            </div>
          )}
        </div>

        {description && (
          <p
            id={descriptionId}
            className="text-xs text-slate-500 leading-relaxed"
          >
            {description}
          </p>
        )}
      </div>

      {/* Input Field */}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const hasError = !!fieldState.error;

          return (
            <div className="relative">
              {/* Start Icon */}
              {startIcon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <div className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200">
                    {startIcon}
                  </div>
                </div>
              )}

              <Input
                id={inputId}
                type={actualType}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                autoComplete={autoComplete}
                maxLength={maxLength}
                minLength={minLength}
                min={min}
                max={max}
                step={step}
                pattern={pattern}
                aria-label={ariaLabel}
                aria-describedby={buildAriaDescribedBy(hasError)}
                aria-invalid={hasError}
                aria-required={required}
                {...field}
                className={cn(
                  // Base styles - ensure minimum 44px height for touch accessibility
                  "min-h-[44px] h-12 text-sm text-slate-800 placeholder:text-slate-400",
                  "bg-white/60 backdrop-blur-sm border border-slate-200/60",
                  "rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
                  "focus:bg-white/80 focus:border-blue-400/60",
                  "hover:border-slate-300/80 hover:bg-white/70",

                  // Padding adjustments for icons
                  startIcon && endIcon
                    ? "px-12"
                    : startIcon
                    ? "pl-12 pr-4"
                    : endIcon || isPasswordType
                    ? "pl-4 pr-12"
                    : "px-4",

                  // Disabled state
                  "disabled:bg-slate-50/50 disabled:border-slate-200/40 disabled:text-slate-500 disabled:cursor-not-allowed",
                  "disabled:placeholder:text-slate-300",

                  // Read-only state
                  "read-only:bg-slate-50/30 read-only:border-slate-200/40",

                  // Error state with high contrast
                  hasError && [
                    "border-red-400/80 bg-red-50/30 focus:border-red-500/80 focus:ring-red-400/50",
                    "animate-shake",
                  ]
                )}
                style={{
                  boxShadow: hasError
                    ? "0 1px 3px rgba(239, 68, 68, 0.15), 0 1px 2px rgba(0, 0, 0, 0.06)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                }}
              />

              {/* End Icon or Password Toggle */}
              {(endIcon || isPasswordType) && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  {isPasswordType ? (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none focus:text-slate-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      tabIndex={0}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200">
                      {endIcon}
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {hasError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 mt-2 text-sm text-red-600"
                  id={errorId}
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {fieldState.error?.message}
                  </span>
                </motion.div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export const FormSelect = <T extends FieldValues,>({
  label,
  name,
  control,
  options,
  required,
  description,
}: BaseFieldProps<T> & {
  options: { label: string; value: string | boolean }[];
}) => (
  <div className="space-y-2 flex-1 group">
    <div className="space-y-1">
      <Label
        className={cn(
          "block text-xs font-medium tracking-wide",
          "text-slate-500 group-hover:text-slate-600 transition-colors"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>

    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger
              className={cn(
                "!h-12 px-4 text-sm text-slate-800 bg-white/60 backdrop-blur-sm",
                "border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md",
                "transition-all duration-300 focus:bg-white/80 focus:border-blue-400/60",
                "focus:ring-2 focus:ring-blue-400/20 hover:border-slate-300/80",
                "hover:bg-white/70 disabled:bg-slate-50/50 disabled:border-slate-200/40",
                "w-full justify-between gap-2 [&>span]:truncate",
                fieldState.error && [
                  "border-red-300/60 focus:border-red-400/60 focus:ring-red-400/20",
                  "animate-shake",
                ]
              )}
              style={{
                height: "3rem", // 48px - force exact height match with h-12
                boxShadow: fieldState.error
                  ? "0 1px 3px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                  : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
              }}
            >
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent className="max-h-40 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl">
              {options.map((opt) => (
                <SelectItem
                  key={String(opt.value)}
                  value={String(opt.value)}
                  className="hover:bg-slate-50/80 focus:bg-blue-50/80 transition-colors duration-200"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-sm text-red-600"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fieldState.error.message}</span>
            </motion.div>
          )}
        </>
      )}
    />
  </div>
);

export const FormDatePicker = <T extends FieldValues,>({
  label,
  name,
  control,
  required,
  description,
}: BaseFieldProps<T>) => (
  <div className="space-y-2">
    <div className="space-y-1">
      <Label
        className={cn(
          "block text-xs font-medium tracking-wide",
          "text-slate-500 group-hover:text-slate-600 transition-colors"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>

    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 px-4 text-sm text-slate-800 justify-start text-left font-normal",
                "bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm",
                "hover:shadow-md transition-all duration-300 focus:bg-white/80",
                "focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20",
                "hover:border-slate-300/80 hover:bg-white/70",
                fieldState.error && [
                  "border-red-300/60 focus:border-red-400/60 focus:ring-red-400/20",
                  "animate-shake",
                ]
              )}
              style={{
                boxShadow: fieldState.error
                  ? "0 1px 3px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                  : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
              }}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span className="text-slate-400">Select a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={field.onChange}
            />
          </PopoverContent>
        </Popover>
      )}
    />
  </div>
);

export const FormCheckbox = <T extends FieldValues,>({
  label,
  name,
  control,
  required,
  description,
}: BaseFieldProps<T>) => (
  <div className="space-y-2">
    <div className="space-y-1">
      <Label
        className={cn(
          "block text-xs font-medium tracking-wide",
          "text-slate-500 group-hover:text-slate-600 transition-colors"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>

    <div className="flex items-center space-x-3">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              className={cn(
                "w-5 h-5 rounded-lg border-2 border-slate-200/60",
                "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
                "data-[state=checked]:text-white transition-all duration-200",
                "hover:border-slate-300/80 focus:ring-2 focus:ring-blue-400/20",
                fieldState.error && "border-red-300/60 animate-shake"
              )}
            />
            <Label
              htmlFor={name}
              className="text-sm text-slate-700 cursor-pointer hover:text-slate-800 transition-colors duration-200"
            >
              {label}
            </Label>
          </>
        )}
      />
    </div>
  </div>
);

export const FormRadioGroup = <T extends FieldValues,>({
  label,
  name,
  control,
  options,
  required,
  description,
}: BaseFieldProps<T> & { options: { label: string; value: string }[] }) => (
  <div className="space-y-2">
    <div className="space-y-1">
      <Label
        className={cn(
          "block text-xs font-medium tracking-wide",
          "text-slate-500 group-hover:text-slate-600 transition-colors"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>

    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Always coerce value to string for RadioGroup
        const value = field.value === undefined || field.value === null ? "" : String(field.value);
        return (
          <>
            <RadioGroup
              onValueChange={(val: any) => {
                field.onChange(val);
              }}
              value={value}
              className="flex gap-4"
            >
              {options.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={opt.value}
                    id={`${name}-${opt.value}`}
                    checked={value === String(opt.value)}
                    className={cn(
                      "w-5 h-5 border-2 border-slate-200/60 text-blue-500",
                      "hover:border-slate-300/80 focus:ring-2 focus:ring-blue-400/20",
                      "transition-all duration-200",
                      fieldState.error && "border-red-300/60"
                    )}
                  />
                  <Label
                    htmlFor={`${name}-${opt.value}`}
                    className="text-sm text-slate-700 cursor-pointer hover:text-slate-800 transition-colors duration-200"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {fieldState.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{fieldState.error.message}</span>
              </motion.div>
            )}
          </>
        );
      }}
    />
  </div>
);

export const FormTextArea = <T extends FieldValues,>({
  label,
  name,
  control,
  placeholder,
  required,
  description,
}: BaseFieldProps<T> & { placeholder?: string }) => (
  <div className="space-y-2 w-full">
    <div className="space-y-1">
      <Label
        htmlFor={name}
        className={cn(
          "block text-xs font-medium tracking-wide",
          "text-slate-500 group-hover:text-slate-600 transition-colors"
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>

    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <Textarea
            id={name}
            {...field}
            placeholder={placeholder || label}
            className={cn(
              "min-h-[80px] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400",
              "bg-white/60 backdrop-blur-sm border border-slate-200/60",
              "rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
              "focus:bg-white/80 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20",
              "hover:border-slate-300/80 hover:bg-white/70 resize-none",
              "disabled:bg-slate-50/50 disabled:border-slate-200/40 disabled:text-slate-500",
              fieldState.error && [
                "border-red-300/60 focus:border-red-400/60 focus:ring-red-400/20",
                "animate-shake",
              ]
            )}
            style={{
              boxShadow: fieldState.error
                ? "0 1px 3px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
            }}
          />

          {fieldState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-sm text-red-600"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fieldState.error.message}</span>
            </motion.div>
          )}
        </>
      )}
    />
  </div>
);

export function FormCombobox<T extends FieldValues>({
  label,
  options,
  name,
  control,
  placeholder = "Select...",
  className,
  required,
  description,
}: BaseFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter options based on search input
  const filteredOptions = options?.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        {label && (
          <Label
            className={cn(
              "block text-xs font-medium tracking-wide",
              "text-slate-500 group-hover:text-slate-600 transition-colors"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full !h-12 px-4 text-sm justify-between",
                  "bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl",
                  "shadow-sm hover:shadow-md transition-all duration-300",
                  "focus:bg-white/80 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20",
                  "hover:border-slate-300/80 hover:bg-white/70",
                  "text-slate-800",
                  !field.value && "text-slate-400",
                  fieldState.error && [
                    "border-red-300/60 focus:border-red-400/60 focus:ring-red-400/20",
                    "animate-shake",
                  ]
                )}
                style={{
                  height: "3rem", // 48px - force exact height match with h-12
                  boxShadow: fieldState.error
                    ? "0 1px 3px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                    : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                }}
              >
                {field.value
                  ? options?.find((opt) => opt.value === field.value)?.label
                  : placeholder}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50 transition-transform duration-200" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl">
              <Command>
                <CommandInput
                  placeholder={`Search ${placeholder}`}
                  className="h-12 border-0 focus:ring-0"
                />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {filteredOptions?.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.label}
                        onSelect={() => {
                          field.onChange(opt.value);
                          setOpen(false);
                          setSearch(""); // reset search after selection
                        }}
                        className="hover:bg-slate-50/80 focus:bg-blue-50/80 transition-colors duration-200"
                      >
                        {opt.label}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            field.value === opt.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
}

export function FormImageUpload<T extends FieldValues>({
  label = "Upload Image",
  name,
  control,
  preview = true,
  className,
  required,
  description,
}: BaseFieldProps<T> & { preview?: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = `${String(name)}-image-uploader`;

  // Revoke preview URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          /* ignore */
        }
      }
    };
  }, [previewUrl]);

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="space-y-1">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-medium tracking-wide",
              "text-slate-500 group-hover:text-slate-600 transition-colors"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file: File | null = e.target.files?.[0] ?? null;

            // inform RHF
            field.onChange(file);

            if (!preview) return;

            // revoke previous preview URL if present
            if (previewUrl) {
              try {
                URL.revokeObjectURL(previewUrl);
              } catch {
                /* ignore */
              }
            }

            const url = file ? URL.createObjectURL(file) : null;
            setPreviewUrl(url);
          };

          const handleRemove = () => {
            // revoke and clear preview
            if (previewUrl) {
              try {
                URL.revokeObjectURL(previewUrl);
              } catch {
                /* ignore */
              }
              setPreviewUrl(null);
            }

            // clear RHF value
            field.onChange(null);

            // also clear the underlying input so selecting the same file again will trigger change
            if (inputRef.current) {
              try {
                inputRef.current.value = "";
              } catch {
                /* ignore */
              }
            }
          };

          return (
            <>
              <div className="flex items-center gap-3">
                <input
                  id={inputId}
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label htmlFor={inputId} className="w-full">
                  <div
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border-2 border-dashed",
                      "px-4 py-4 text-sm text-slate-600 hover:text-slate-800",
                      "bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all duration-300",
                      "hover:border-slate-300/80 hover:shadow-md cursor-pointer",
                      "border-slate-200/60",
                      fieldState.error && [
                        "border-red-200/60 hover:border-red-300/60",
                        "animate-shake",
                      ]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 opacity-70" />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium text-slate-700">
                          Drag & drop or click to upload
                        </span>
                        <span className="text-xs text-slate-500">
                          PNG, JPG • up to 5 MB
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                {preview && previewUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-20 w-20 rounded-xl object-cover border-2 border-white/60 shadow-md"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50/80"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {fieldState.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{fieldState.error.message}</span>
                </motion.div>
              )}
            </>
          );
        }}
      />
    </div>
  );
}

type GroupedOption = {
  label: string;
  options: { label: string; value: string }[];
};

export function FormAutocompleteInput<T extends FieldValues>({
  label,
  name,
  control,
  optionsForCompleteInput,
  placeholder,
  required,
  description,
}: BaseFieldProps<T> & { optionsForCompleteInput: GroupedOption[] }) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label
          htmlFor={name}
          className={cn(
            "block text-xs font-medium tracking-wide",
            "text-slate-500 group-hover:text-slate-600 transition-colors"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const selected: Record<string, boolean> =
            typeof field.value === "object" && field.value !== null
              ? field.value
              : {};

          const toggleValue = (value: string) => {
            const newValue = { ...selected };
            if (newValue[value]) {
              delete newValue[value];
            } else {
              newValue[value] = true;
            }
            field.onChange(newValue);
          };

          const selectedLabels = optionsForCompleteInput
            .flatMap((group) => group.options)
            .filter((opt) => selected[opt.value])
            .map((opt) => opt.label);

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full !h-12 px-4 text-sm justify-between",
                    "bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl",
                    "shadow-sm hover:shadow-md transition-all duration-300",
                    "focus:bg-white/80 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20",
                    "hover:border-slate-300/80 hover:bg-white/70",
                    "text-slate-800",
                    !field.value && "text-slate-400",
                    fieldState.error && [
                      "border-red-300/60 focus:border-red-400/60 focus:ring-red-400/20",
                      "animate-shake",
                    ]
                  )}
                  style={{
                    height: "3rem", // 48px - force exact height match with h-12
                    boxShadow: fieldState.error
                      ? "0 1px 3px rgba(239, 68, 68, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                      : "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <span className="truncate">
                    {selectedLabels.length > 0
                      ? selectedLabels.join(", ")
                      : placeholder}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl">
                <Command>
                  <CommandInput
                    placeholder={`Search ${placeholder}`}
                    className="h-12 border-0 focus:ring-0"
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {optionsForCompleteInput.map((group) => (
                      <CommandGroup key={group.label} heading={group.label}>
                        {group.options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label} // searchable by label
                            onSelect={() => toggleValue(option.value)}
                            className="hover:bg-slate-50/80 focus:bg-blue-50/80 transition-colors duration-200"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected[option.value]
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>

              {fieldState.error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 text-sm text-red-600"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{fieldState.error.message}</span>
                </motion.div>
              )}
            </Popover>
          );
        }}
      />
    </div>
  );
}

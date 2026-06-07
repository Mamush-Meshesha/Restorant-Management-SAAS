import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Check, User, Users } from "lucide-react";

export interface FormStepperProps {
  steps: string[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
  onNext?: (e?: React.MouseEvent) => void;
  onBack?: () => void;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  onSubmit?: () => void;
  nextLabel?: string;
  submitLabel?: string;
  isNextDisabled?: boolean;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  children,
  onNext,
  onBack,
  isLastStep,
  isFirstStep,
  onSubmit,
  nextLabel = "Next",
  submitLabel = "Submit",
  isNextDisabled = false,
}) => {
  // Get appropriate icon for each step
  const getStepIcon = (stepIndex: number, label: string) => {
    if (activeStep > stepIndex) {
      return <Check className="w-4 h-4" />;
    }

    // Custom icons for specific steps
    if (label.toLowerCase().includes("student")) {
      return <User className="w-4 h-4" />;
    }
    if (label.toLowerCase().includes("guardian")) {
      return <Users className="w-4 h-4" />;
    }

    return <span className="text-sm font-semibold">{stepIndex + 1}</span>;
  };

  return (
    <div className="w-full h-auto px-5 pt-2">
      <div className="w-full mb-10">
        <div className="flex items-center justify-center w-full">
          {steps.map((label, idx) => (
            <React.Fragment key={label}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onStepChange?.(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onStepChange?.(idx);
                }}
                aria-current={activeStep === idx ? "step" : undefined}
                aria-label={`Step ${idx + 1}: ${label}`}
                title={label}
                className="flex flex-col items-center cursor-pointer w-24 focus:outline-none group transition-all duration-300 hover:scale-105"
              >
                {/* Enhanced Step Avatar */}
                <div
                  className={`
                    relative rounded-full w-12 h-12 flex items-center justify-center 
                    border-2 transition-all duration-300 shadow-lg
                    group-hover:shadow-xl group-hover:scale-110
                    ${
                      activeStep > idx
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 text-white shadow-green-200/50" // completed
                        : activeStep === idx
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 border-blue-500 text-white shadow-blue-200/50 ring-4 ring-blue-100" // active
                        : "bg-white border-slate-300 text-slate-500 shadow-slate-200/50 hover:border-slate-400" // upcoming
                    }
                  `}
                >
                  {/* Inner glow effect for active step */}
                  {activeStep === idx && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 animate-pulse" />
                  )}

                  {/* Step icon/content */}
                  <div className="relative z-10 flex items-center justify-center">
                    {getStepIcon(idx, label)}
                  </div>

                  {/* Success checkmark animation for completed steps */}
                  {activeStep > idx && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`
                    text-sm mt-3 text-center truncate font-medium transition-all duration-300
                    ${
                      activeStep > idx
                        ? "text-green-600 font-semibold"
                        : activeStep === idx
                        ? "text-blue-600 font-semibold"
                        : "text-slate-500 group-hover:text-slate-600"
                    }
                  `}
                >
                  {label}
                </span>

                {/* Step number indicator */}
                <span
                  className={`
                    text-xs mt-1 px-2 py-1 rounded-full transition-all duration-300
                    ${
                      activeStep > idx
                        ? "bg-green-100 text-green-700"
                        : activeStep === idx
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  Step {idx + 1}
                </span>
              </div>

              {/* Enhanced Connector Line */}
              {idx !== steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`
                    relative h-0.5 rounded-full transition-all duration-500 mx-4
                    ${steps.length === 2 ? "w-16" : "flex-1"}
                    ${
                      activeStep > idx
                        ? "bg-gradient-to-r from-green-400 to-green-500 shadow-sm"
                        : "bg-gradient-to-r from-slate-200 to-slate-300"
                    }
                  `}
                >
                  {/* Animated progress indicator for active step */}
                  {activeStep === idx && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 mb-6">{children}</div>

      {/* Enhanced Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              isFirstStep
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-500 text-white hover:bg-slate-600 focus:ring-slate-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }
          `}
        >
          Back
        </button>

        {isLastStep ? (
          <button
            type="submit"
            onClick={onSubmit}
            className="px-8 py-2.5 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                isNextDisabled
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-blue-500"
              }
            `}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
};
const steps = [
  "Select campaign settings",
  "Create an ad group",
  "Create an ad",
];

export default function HorizontalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}

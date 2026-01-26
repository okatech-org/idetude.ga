import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface FieldValidationProps {
  isValid: boolean;
  isTouched?: boolean;
  message?: string;
  helpText?: string;
  showIcon?: boolean;
  className?: string;
}

export const FieldValidation = ({
  isValid,
  isTouched = true,
  message,
  helpText,
  showIcon = true,
  className,
}: FieldValidationProps) => {
  if (!isTouched && !helpText) return null;

  return (
    <div className={cn("flex items-start gap-1.5 mt-1", className)}>
      {showIcon && isTouched && (
        isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        )
      )}
      {!isTouched && helpText && showIcon && (
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
      <span className={cn(
        "text-xs",
        isTouched 
          ? isValid 
            ? "text-green-600 dark:text-green-400" 
            : "text-destructive"
          : "text-muted-foreground"
      )}>
        {isTouched ? message : helpText}
      </span>
    </div>
  );
};

interface ValidatedInputWrapperProps {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  isValid: boolean;
  isTouched?: boolean;
  validMessage?: string;
  invalidMessage?: string;
  helpText?: string;
  className?: string;
}

export const ValidatedInputWrapper = ({
  children,
  label,
  required = false,
  isValid,
  isTouched = true,
  validMessage,
  invalidMessage,
  helpText,
  className,
}: ValidatedInputWrapperProps) => {
  const message = isValid ? validMessage : invalidMessage;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5">
          {label}
          {required && <span className="text-destructive">*</span>}
          {isTouched && (
            isValid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : required ? (
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            ) : null
          )}
        </label>
      </div>
      {children}
      <FieldValidation
        isValid={isValid}
        isTouched={isTouched}
        message={message}
        helpText={helpText}
        showIcon={false}
      />
    </div>
  );
};

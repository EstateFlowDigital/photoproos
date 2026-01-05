"use client";

import { useState, useCallback } from "react";
import type { ValidationResult, FieldError as FieldErrorType } from "@/lib/validation";

interface UseFormValidationOptions<T> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (value: T[keyof T], values: T) => ValidationResult>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (updates: Partial<T>) => void;
  setError: (field: keyof T, error: string | undefined) => void;
  setTouched: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  };
}

export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  validators = {},
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((updates: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setTouched = useCallback((field: keyof T) => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof T): boolean => {
    const validator = validators[field];
    if (!validator) return true;

    const result = validator(values[field], values);
    if (!result.valid && result.error) {
      setErrors((prev) => ({ ...prev, [field]: result.error }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  }, [validators, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const field of Object.keys(validators) as Array<keyof T>) {
      const validator = validators[field];
      if (validator) {
        const result = validator(values[field], values);
        if (!result.valid && result.error) {
          newErrors[field] = result.error;
        }
      }
    }

    setErrors(newErrors);
    // Mark all fields as touched
    const allTouched = Object.keys(validators).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof T, boolean>>
    );
    setTouchedState(allTouched);

    return Object.keys(newErrors).length === 0;
  }, [validators, values]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateAll, onSubmit, values]);

  const getFieldProps = useCallback((field: keyof T) => {
    const hasError = touched[field] && errors[field];
    return {
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === "number"
          ? (e.target.value === "" ? "" : Number(e.target.value))
          : e.target.value;
        setValue(field, value as T[keyof T]);
      },
      onBlur: () => {
        setTouched(field);
        validateField(field);
      },
      ...(hasError && {
        "aria-invalid": true,
        "aria-describedby": `${String(field)}-error`,
      }),
    };
  }, [values, touched, errors, setValue, setTouched, validateField]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    setTouched,
    validateField,
    validateAll,
    reset,
    handleSubmit,
    getFieldProps,
  };
}

// Helper component for displaying field errors
export function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;

  return (
    <p
      id={id}
      className="mt-1.5 text-sm text-[var(--error)]"
      role="alert"
    >
      {error}
    </p>
  );
}

// Helper for character count display
export function CharacterCount({
  current,
  max,
  className,
}: {
  current: number;
  max: number;
  className?: string;
}) {
  const isOverLimit = current > max;
  const remaining = max - current;

  return (
    <span
      className={`text-xs ${isOverLimit ? "text-[var(--error)]" : "text-foreground-muted"} ${className || ""}`}
      aria-live="polite"
    >
      {isOverLimit ? `${Math.abs(remaining)} over limit` : `${remaining} remaining`}
    </span>
  );
}

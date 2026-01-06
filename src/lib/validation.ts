/**
 * Form validation utilities for PhotoProOS
 * Provides reusable validation functions and error handling
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

// Common validation functions
export const validators = {
  required: (value: unknown, fieldName = "This field"): ValidationResult => {
    if (value === undefined || value === null || value === "") {
      return { valid: false, error: `${fieldName} is required` };
    }
    if (typeof value === "string" && value.trim() === "") {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  },

  minLength: (value: string, min: number, fieldName = "This field"): ValidationResult => {
    if (value.length < min) {
      return { valid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { valid: true };
  },

  maxLength: (value: string, max: number, fieldName = "This field"): ValidationResult => {
    if (value.length > max) {
      return { valid: false, error: `${fieldName} must be no more than ${max} characters` };
    }
    return { valid: true };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: "Please enter a valid email address" };
    }
    return { valid: true };
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^[\d\s+()-]{7,20}$/;
    if (!phoneRegex.test(value)) {
      return { valid: false, error: "Please enter a valid phone number" };
    }
    return { valid: true };
  },

  url: (value: string): ValidationResult => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, error: "Please enter a valid URL" };
    }
  },

  positiveNumber: (value: number, fieldName = "This field"): ValidationResult => {
    if (value <= 0) {
      return { valid: false, error: `${fieldName} must be greater than 0` };
    }
    return { valid: true };
  },

  minValue: (value: number, min: number, fieldName = "This field"): ValidationResult => {
    if (value < min) {
      return { valid: false, error: `${fieldName} must be at least ${min}` };
    }
    return { valid: true };
  },

  maxValue: (value: number, max: number, fieldName = "This field"): ValidationResult => {
    if (value > max) {
      return { valid: false, error: `${fieldName} must be no more than ${max}` };
    }
    return { valid: true };
  },

  futureDate: (value: Date | string, fieldName = "Date"): ValidationResult => {
    const date = typeof value === "string" ? new Date(value) : value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return { valid: false, error: `${fieldName} must be in the future` };
    }
    return { valid: true };
  },

  pastDate: (value: Date | string, fieldName = "Date"): ValidationResult => {
    const date = typeof value === "string" ? new Date(value) : value;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      return { valid: false, error: `${fieldName} must be in the past` };
    }
    return { valid: true };
  },

  dateAfter: (value: Date | string, afterDate: Date | string, fieldName = "End date"): ValidationResult => {
    const date = typeof value === "string" ? new Date(value) : value;
    const compareDate = typeof afterDate === "string" ? new Date(afterDate) : afterDate;
    if (date <= compareDate) {
      return { valid: false, error: `${fieldName} must be after the start date` };
    }
    return { valid: true };
  },

  hexColor: (value: string): ValidationResult => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(value)) {
      return { valid: false, error: "Please enter a valid hex color (e.g., #FF5733)" };
    }
    return { valid: true };
  },

  password: (value: string): ValidationResult => {
    if (value.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }
    if (!/[A-Z]/.test(value)) {
      return { valid: false, error: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(value)) {
      return { valid: false, error: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(value)) {
      return { valid: false, error: "Password must contain at least one number" };
    }
    return { valid: true };
  },
};

// Combine multiple validations for a single field
export function validate(value: unknown, ...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }
  return { valid: true };
}

// Validate entire form and return all errors
export function validateForm(fields: Record<string, () => ValidationResult>): {
  valid: boolean;
  errors: FieldError[];
} {
  const errors: FieldError[] = [];

  for (const [field, validator] of Object.entries(fields)) {
    const result = validator();
    if (!result.valid && result.error) {
      errors.push({ field, message: result.error });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format currency for display - re-export from centralized utils
export { formatCurrency } from "@/lib/utils/units";

// Parse currency input to cents
export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const number = parseFloat(cleaned);
  if (isNaN(number)) return 0;
  return Math.round(number * 100);
}

// Character counter helper
export function getCharacterCount(value: string, maxLength: number): {
  count: number;
  remaining: number;
  isOverLimit: boolean;
} {
  const count = value.length;
  return {
    count,
    remaining: maxLength - count,
    isOverLimit: count > maxLength,
  };
}

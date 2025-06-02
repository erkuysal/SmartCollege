/**
 * Common form validation rules
 */

// Type for validation rules
export type ValidationRule = (value: any) => boolean | string;

// Required field validation
export const required = (message: string = 'This field is required'): ValidationRule => {
  return (value: any) => !!value || message;
};

// Email validation
export const email = (message: string = 'Email must be valid'): ValidationRule => {
  return (value: string) => {
    if (!value) return true; // Let required handle empty values
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || message;
  };
};

// Min length validation
export const minLength = (length: number, message?: string): ValidationRule => {
  return (value: string) => {
    if (!value) return true; // Let required handle empty values
    const errorMessage = message || `Must be at least ${length} characters`;
    return value.length >= length || errorMessage;
  };
};

// Max length validation
export const maxLength = (length: number, message?: string): ValidationRule => {
  return (value: string) => {
    if (!value) return true; // Let required handle empty values
    const errorMessage = message || `Cannot exceed ${length} characters`;
    return value.length <= length || errorMessage;
  };
};

// Number validation
export const isNumber = (message: string = 'Must be a number'): ValidationRule => {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true;
    return !isNaN(Number(value)) || message;
  };
};

// Min value validation for numbers
export const minValue = (min: number, message?: string): ValidationRule => {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true;
    const errorMessage = message || `Value must be at least ${min}`;
    const numValue = Number(value);
    return numValue >= min || errorMessage;
  };
};

// Max value validation for numbers
export const maxValue = (max: number, message?: string): ValidationRule => {
  return (value: any) => {
    if (value === null || value === undefined || value === '') return true;
    const errorMessage = message || `Value cannot exceed ${max}`;
    const numValue = Number(value);
    return numValue <= max || errorMessage;
  };
};

// Pattern validation using RegExp
export const pattern = (regexp: RegExp, message: string): ValidationRule => {
  return (value: string) => {
    if (!value) return true; // Let required handle empty values
    return regexp.test(value) || message;
  };
};

// Date validation
export const isDate = (message: string = 'Must be a valid date'): ValidationRule => {
  return (value: string) => {
    if (!value) return true; // Let required handle empty values
    const date = new Date(value);
    return !isNaN(date.getTime()) || message;
  };
};

// Helper to combine multiple validation rules
export const combineRules = (rules: ValidationRule[]) => {
  return (value: any) => {
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        return result;
      }
    }
    return true;
  };
}; 
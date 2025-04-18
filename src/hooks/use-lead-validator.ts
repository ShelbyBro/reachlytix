
import { useCallback } from "react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useLeadValidator() {
  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validatePhone = useCallback((phone: string): ValidationResult => {
    const errors: string[] = [];
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.push("Phone number must be between 10-15 digits");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validateEmail,
    validatePhone
  };
}

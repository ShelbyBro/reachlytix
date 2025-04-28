
import { useCallback } from "react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useLeadValidator() {
  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push("Email is required");
      return { isValid: false, errors };
    }
    
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
    
    if (!phone) {
      errors.push("Phone number is required");
      return { isValid: false, errors };
    }
    
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

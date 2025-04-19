
export function sanitizePhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  let sanitized = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with + if it doesn't have one and has a country code
  if (!sanitized.startsWith('+') && sanitized.length > 10) {
    sanitized = '+' + sanitized;
  } else if (sanitized.length === 10) {
    // Assume US number if only 10 digits
    sanitized = '+1' + sanitized;
  }
  
  return sanitized;
}


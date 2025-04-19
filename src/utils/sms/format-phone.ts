
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  let sanitized = phone.replace(/\D/g, '');
  
  // Ensure it starts with + if it doesn't have one and has a country code
  if (!sanitized.startsWith('+') && sanitized.length > 10) {
    sanitized = '+' + sanitized;
  } else if (sanitized.length === 10) {
    // Assume US number if only 10 digits
    sanitized = '+1' + sanitized;
  }
  
  return sanitized;
};

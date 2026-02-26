/**
 * Formats a Kenyan phone number to the format expected by the Daraja API (254...).
 * @param phoneNumber The phone number to format.
 * @returns The formatted phone number or null if invalid.
 */
const formatKenyanPhoneNumber = (phoneNumber: string): string | null => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');

  if (digitsOnly.startsWith('07') && digitsOnly.length === 10) {
    return `254${digitsOnly.substring(1)}`;
  }
  if (digitsOnly.startsWith('01') && digitsOnly.length === 10) {
    return `254${digitsOnly.substring(1)}`;
  }
  if (digitsOnly.startsWith('254') && digitsOnly.length === 12) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith('7') && digitsOnly.length === 9) { // e.g., 712345678 -> 254712345678
    return `254${digitsOnly}`;
  }
  if (digitsOnly.startsWith('1') && digitsOnly.length === 9) { // e.g., 112345678 -> 254112345678
    return `254${digitsOnly}`;
  }
  if (digitsOnly.startsWith('+254') && digitsOnly.length === 13) {
    return digitsOnly.substring(1);
  }

  return null; // Invalid format
};

/**
 * Validates if a phone number is a valid M-Pesa number (starts with 254 and is 12 digits long).
 * @param phoneNumber The phone number to validate.
 * @returns An object with isValid (boolean) and message (string).
 */
const isValidMpesaPhoneNumber = (phoneNumber: string): { isValid: boolean; message?: string } => {
  const formattedNumber = formatKenyanPhoneNumber(phoneNumber);

  if (!formattedNumber) {
    return { isValid: false, message: 'Invalid phone number format. Please use a valid Kenyan number (e.g., 07XXXXXXXX, 2547XXXXXXXX).' };
  }

  if (!formattedNumber.startsWith('254')) {
    return { isValid: false, message: 'Phone number must start with 254.' };
  }

  if (formattedNumber.length !== 12) {
    return { isValid: false, message: 'Phone number must be 12 digits long (e.g., 2547XXXXXXXX).' };
  }

  // Basic check for common M-Pesa prefixes after 254
  const mpesaPrefix = formattedNumber.substring(3, 4);
  if (!['1', '7'].includes(mpesaPrefix)) { // M-Pesa numbers typically start with 2547 or 2541
    return { isValid: false, message: 'Invalid M-Pesa phone number. Expected 2547 or 2541 prefix.' };
  }

  return { isValid: true };
};


export { formatKenyanPhoneNumber, isValidMpesaPhoneNumber };

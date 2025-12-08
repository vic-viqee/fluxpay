/**
 * Formats a Kenyan phone number to the format expected by the Daraja API (254...).
 * @param phoneNumber The phone number to format.
 * @returns The formatted phone number.
 */
const formatKenyanPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.startsWith('07')) {
    return `254${phoneNumber.substring(1)}`;
  }
  if (phoneNumber.startsWith('254')) {
    return phoneNumber;
  }
  if (phoneNumber.startsWith('+254')) {
    return phoneNumber.substring(1);
  }
  return phoneNumber; // Or throw an error for invalid formats
};

export { formatKenyanPhoneNumber };

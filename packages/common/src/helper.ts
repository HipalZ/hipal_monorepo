export function sanitizePhoneInput(
  input: string,
  prevValue: string,
  nativeEvent?: InputEvent,
) {
  const raw = input.replace(/\D/g, "");
  // On paste (or programmatic), allow last 10
  if (raw.length > 10 && nativeEvent?.inputType === "insertFromPaste") {
    return raw.slice(-10);
  }
  // On typing: block more than 10 digits
  if (raw.length > 10) {
    // If deleting/backspacing, allow
    if (raw.length < prevValue.length) return raw;
    // Else, block further typing
    return prevValue;
  }
  return raw;
}

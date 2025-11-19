export const BRAZIL_COUNTRY_CODE = '+55';
const MAX_DIGITS = 11; // DDD (2) + número de 9 dígitos

export function sanitizeBrazilPhoneInput(value: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('55')) {
    digits = digits.slice(2);
  }

  return digits.slice(0, MAX_DIGITS);
}

export function formatBrazilPhoneDisplay(digits: string): string {
  const sanitized = sanitizeBrazilPhoneInput(digits);
  let result = `${BRAZIL_COUNTRY_CODE} `;

  if (!sanitized) {
    return result.trimEnd();
  }

  const ddd = sanitized.slice(0, 2);
  const firstPart = sanitized.slice(2, 7);
  const secondPart = sanitized.slice(7, MAX_DIGITS);

  result += '(';
  result += ddd;

  if (sanitized.length >= 2) {
    result += ') ';
  }

  if (firstPart) {
    result += firstPart;
  }

  if (sanitized.length > 7) {
    result += '-';
  }

  if (secondPart) {
    result += secondPart;
  }

  return result.trimEnd();
}

export function formatBrazilPhoneForStorage(digits: string): string {
  const sanitized = sanitizeBrazilPhoneInput(digits);
  if (!sanitized) return '';
  return `${BRAZIL_COUNTRY_CODE}${sanitized}`;
}

export function extractBrazilPhoneDigits(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('55')) {
    return digits.slice(2, 2 + MAX_DIGITS);
  }

  if (digits.length > MAX_DIGITS) {
    return digits.slice(-MAX_DIGITS);
  }

  return digits;
}


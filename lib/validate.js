export const codeRegex = /^[A-Za-z0-9]{6,8}$/;

export function isValidCode(code) {
  return codeRegex.test(String(code));
}

export function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

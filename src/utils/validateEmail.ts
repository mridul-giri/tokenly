import dns from "dns/promises";

export const validateEmailDomain = async (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  if (!isValidEmail) return false;

  const domain = email.split("@")[1];
  if (!domain) return false;

  try {
    const boolean = await dns.resolveMx(domain);
    return boolean.length > 0;
  } catch {
    return false;
  }
};

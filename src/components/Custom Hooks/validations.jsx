export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return ["error", "Email is not in valid format"];
  }
  return ["success", "Email is in valid format"];
};

export const validatePassword = (password) => {
  const isValidPasswordLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!isValidPasswordLength)
    return ["error", "Password must be at least 8 characters long"];
  if (!hasUpperCase)
    return ["error", "Password must contain an uppercase letter"];
  if (!hasLowerCase)
    return ["error", "Password must contain a lowercase letter"];
  if (!hasNumbers)
    return ["error", "Password must contain a number"];
  if (!hasSpecialCharacters)
    return ["error", "Password must contain a special character"];

  return ["success", "Password is strong"];
};

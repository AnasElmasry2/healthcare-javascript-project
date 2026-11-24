const sanitizeInput = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const validateRequired = (fields, keys) => {
  for (const key of keys) {
    if (typeof fields[key] !== 'string' ||
        !fields[key].trim()) {
      return `${key} is required`;
    }
  }
  return null;
};

const validateEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password)) {
    return 'Password must contain 8+ characters, uppercase, lowercase, number and special character';
  }
  return null;
};

module.exports = {
  sanitizeInput,
  validateRequired,
  validateEmail,
  validatePassword
};

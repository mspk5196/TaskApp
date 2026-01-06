export const isRequired = (value) => value !== undefined && value !== null && String(value).trim() !== '';

export const isEmail = (value) =>
  typeof value === 'string' && /.+@.+\..+/.test(value);

export const minLength = (value, length) =>
  typeof value === 'string' && value.length >= length;

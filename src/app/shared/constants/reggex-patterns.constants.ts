export const REGEX_PATTERNS = {
  EMAIL: /.+@.+\..+/,
  PASSWORD: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  TIME: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
}
import { create } from "zustand";

const specialCharRegex = /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { id: "length", test: (pwd) => pwd.length >= 12, label: "Ít nhất 12 ký tự" },
  {
    id: "uppercase",
    test: (pwd) => /[A-Z]/.test(pwd),
    label: "Có chữ in hoa",
  },
  {
    id: "lowercase",
    test: (pwd) => /[a-z]/.test(pwd),
    label: "Có chữ thường",
  },
  {
    id: "number",
    test: (pwd) => /\d/.test(pwd),
    label: "Có ít nhất một số",
  },
  {
    id: "special",
    test: (pwd) => specialCharRegex.test(pwd),
    label: "Có ký tự đặc biệt (ví dụ: @, #, $)",
  },
];

const isStrongPassword = (pwd = "") =>
  PASSWORD_RULES.every((rule) => rule.test(pwd));

const baseValidators = {
  fullName: (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) return "Vui lòng nhập họ tên";
    if (trimmed.length < 2) return "Họ tên phải có ít nhất 2 ký tự";
    return "";
  },

  email: (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) return "Vui lòng nhập email";
    if (!emailRegex.test(trimmed)) return "Email không đúng định dạng";
    return "";
  },

  phone: (value = "") => {
    if (!value) return "Vui lòng nhập số điện thoại";
    if (!/^\d+$/.test(value)) return "Số điện thoại chỉ được chứa chữ số";
    if (value.length !== 10) return "Số điện thoại phải có đúng 10 chữ số";
    return "";
  },

  password: (value = "") => {
    if (!value) return "Vui lòng nhập mật khẩu";
    if (!isStrongPassword(value)) return "Mật khẩu chưa đáp ứng các yêu cầu";
    return "";
  },
};

export const useValidatorStore = create((set, get) => ({
  validators: baseValidators,
  passwordRules: PASSWORD_RULES,

  isValidPassword: (pwd) => isStrongPassword(pwd),

  validateField: (fieldName, value, context = {}) => {
    const validator = get().validators[fieldName];
    if (!validator) return "";
    return validator(value, context);
  },

  validateFields: (fieldMap, context = {}) => {
    const errors = {};

    Object.entries(fieldMap).forEach(([fieldName, value]) => {
      const message = get().validateField(fieldName, value, context);
      if (message) errors[fieldName] = message;
    });

    return errors;
  },

  addValidator: (fieldName, validatorFn) => {
    if (!fieldName || typeof validatorFn !== "function") return;
    set((state) => ({
      validators: {
        ...state.validators,
        [fieldName]: validatorFn,
      },
    }));
  },

  removeValidator: (fieldName) => {
    set((state) => {
      if (!state.validators[fieldName]) return state;
      const nextValidators = { ...state.validators };
      delete nextValidators[fieldName];
      return { validators: nextValidators };
    });
  },

  resetValidators: () => set({ validators: baseValidators }),
}));

import { AbstractControl, ValidatorFn } from "@angular/forms";
import { REGEX } from "../../core/constants/regex.const";

export const passwordValidator: ValidatorFn = (control: AbstractControl) => {
  const password = control.value as string;
  if (!password) return null;
  const isValid = REGEX.PASSWORD.test(password);
  return isValid ? null : { invalidPassword: true };
};
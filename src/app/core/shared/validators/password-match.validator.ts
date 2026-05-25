import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { INPUT_ERROR } from '@core/shared/enums';

export const PasswordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const passwordCtrl = group.get('password');
  const confirmCtrl = group.get('confirmPassword');

  if (!passwordCtrl || !confirmCtrl) {
    return null;
  }

  if (confirmCtrl.errors && !confirmCtrl.errors[INPUT_ERROR.MISMATCH]) {
    return null;
  }

  confirmCtrl.setErrors(passwordCtrl.value !== confirmCtrl.value
    ? { [INPUT_ERROR.MISMATCH]: true }
    : null
  );

  return null;
};
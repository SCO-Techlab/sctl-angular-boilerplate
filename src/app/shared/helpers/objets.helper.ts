import { MAGIC_NUMBERS } from "@shared/constants";

export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> =>
  Object.entries(obj ?? {}).reduce((acc, [key, value]) => {
    const isEmptyString = value === '';
    const isNullOrUndefined = value == null;
    const isEmptyArray =
      Array.isArray(value) && value.length === MAGIC_NUMBERS.N_0;

    const isEmptyObject =
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value !== null &&
      Object.keys(value).length === MAGIC_NUMBERS.N_0;

    if (
      !isEmptyString &&
      !isNullOrUndefined &&
      !isEmptyArray &&
      !isEmptyObject
    ) {
      acc[key as keyof T] = value;
    }

    return acc;
  }, {} as Partial<T>);
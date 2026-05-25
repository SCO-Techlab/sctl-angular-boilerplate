import { MAGIC_NUMBERS } from "@core/shared/constants";

export declare type KeyOfType<T> = keyof T extends infer U ? U : never;

export declare type SurfacesType = {
  name?: string;
  palette?: {
    [MAGIC_NUMBERS.N_0]?: string;
    [MAGIC_NUMBERS.N_50]?: string;
    [MAGIC_NUMBERS.N_100]?: string;
    [MAGIC_NUMBERS.N_200]?: string;
    [MAGIC_NUMBERS.N_300]?: string;
    [MAGIC_NUMBERS.N_400]?: string;
    [MAGIC_NUMBERS.N_500]?: string;
    [MAGIC_NUMBERS.N_600]?: string;
    [MAGIC_NUMBERS.N_700]?: string;
    [MAGIC_NUMBERS.N_800]?: string;
    [MAGIC_NUMBERS.N_900]?: string;
    [MAGIC_NUMBERS.N_950]?: string;
  };
};
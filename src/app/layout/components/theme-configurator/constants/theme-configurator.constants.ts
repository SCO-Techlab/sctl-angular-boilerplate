import { MAGIC_NUMBERS } from '@core/shared/constants';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';

export const THEME_CONFIGURATOR_PRESETS = {
  Aura,
  Lara,
  Nora
} as const;

export const THEME_CONFIGURATOR_SURFACES = [
  {
    name: 'slate',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#f8fafc',
      [MAGIC_NUMBERS.N_100]: '#f1f5f9',
      [MAGIC_NUMBERS.N_200]: '#e2e8f0',
      [MAGIC_NUMBERS.N_300]: '#cbd5e1',
      [MAGIC_NUMBERS.N_400]: '#94a3b8',
      [MAGIC_NUMBERS.N_500]: '#64748b',
      [MAGIC_NUMBERS.N_600]: '#475569',
      [MAGIC_NUMBERS.N_700]: '#334155',
      [MAGIC_NUMBERS.N_800]: '#1e293b',
      [MAGIC_NUMBERS.N_900]: '#0f172a',
      [MAGIC_NUMBERS.N_950]: '#020617'
    }
  },
  {
    name: 'gray',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#f9fafb',
      [MAGIC_NUMBERS.N_100]: '#f3f4f6',
      [MAGIC_NUMBERS.N_200]: '#e5e7eb',
      [MAGIC_NUMBERS.N_300]: '#d1d5db',
      [MAGIC_NUMBERS.N_400]: '#9ca3af',
      [MAGIC_NUMBERS.N_500]: '#6b7280',
      [MAGIC_NUMBERS.N_600]: '#4b5563',
      [MAGIC_NUMBERS.N_700]: '#374151',
      [MAGIC_NUMBERS.N_800]: '#1f2937',
      [MAGIC_NUMBERS.N_900]: '#111827',
      [MAGIC_NUMBERS.N_950]: '#030712'
    }
  },
  {
    name: 'zinc',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#fafafa',
      [MAGIC_NUMBERS.N_100]: '#f4f4f5',
      [MAGIC_NUMBERS.N_200]: '#e4e4e7',
      [MAGIC_NUMBERS.N_300]: '#d4d4d8',
      [MAGIC_NUMBERS.N_400]: '#a1a1aa',
      [MAGIC_NUMBERS.N_500]: '#71717a',
      [MAGIC_NUMBERS.N_600]: '#52525b',
      [MAGIC_NUMBERS.N_700]: '#3f3f46',
      [MAGIC_NUMBERS.N_800]: '#27272a',
      [MAGIC_NUMBERS.N_900]: '#18181b',
      [MAGIC_NUMBERS.N_950]: '#09090b'
    }
  },
  {
    name: 'neutral',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#fafafa',
      [MAGIC_NUMBERS.N_100]: '#f5f5f5',
      [MAGIC_NUMBERS.N_200]: '#e5e5e5',
      [MAGIC_NUMBERS.N_300]: '#d4d4d4',
      [MAGIC_NUMBERS.N_400]: '#a3a3a3',
      [MAGIC_NUMBERS.N_500]: '#737373',
      [MAGIC_NUMBERS.N_600]: '#525252',
      [MAGIC_NUMBERS.N_700]: '#404040',
      [MAGIC_NUMBERS.N_800]: '#262626',
      [MAGIC_NUMBERS.N_900]: '#171717',
      [MAGIC_NUMBERS.N_950]: '#0a0a0a'
    }
  },
  {
    name: 'stone',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#fafaf9',
      [MAGIC_NUMBERS.N_100]: '#f5f5f4',
      [MAGIC_NUMBERS.N_200]: '#e7e5e4',
      [MAGIC_NUMBERS.N_300]: '#d6d3d1',
      [MAGIC_NUMBERS.N_400]: '#a8a29e',
      [MAGIC_NUMBERS.N_500]: '#78716c',
      [MAGIC_NUMBERS.N_600]: '#57534e',
      [MAGIC_NUMBERS.N_700]: '#44403c',
      [MAGIC_NUMBERS.N_800]: '#292524',
      [MAGIC_NUMBERS.N_900]: '#1c1917',
      [MAGIC_NUMBERS.N_950]: '#0c0a09'
    }
  },
  {
    name: 'soho',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#ececec',
      [MAGIC_NUMBERS.N_100]: '#dedfdf',
      [MAGIC_NUMBERS.N_200]: '#c4c4c6',
      [MAGIC_NUMBERS.N_300]: '#adaeb0',
      [MAGIC_NUMBERS.N_400]: '#97979b',
      [MAGIC_NUMBERS.N_500]: '#7f8084',
      [MAGIC_NUMBERS.N_600]: '#6a6b70',
      [MAGIC_NUMBERS.N_700]: '#55565b',
      [MAGIC_NUMBERS.N_800]: '#3f4046',
      [MAGIC_NUMBERS.N_900]: '#2c2c34',
      [MAGIC_NUMBERS.N_950]: '#16161d'
    }
  },
  {
    name: 'viva',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#f3f3f3',
      [MAGIC_NUMBERS.N_100]: '#e7e7e8',
      [MAGIC_NUMBERS.N_200]: '#cfd0d0',
      [MAGIC_NUMBERS.N_300]: '#b7b8b9',
      [MAGIC_NUMBERS.N_400]: '#9fa1a1',
      [MAGIC_NUMBERS.N_500]: '#87898a',
      [MAGIC_NUMBERS.N_600]: '#6e7173',
      [MAGIC_NUMBERS.N_700]: '#565a5b',
      [MAGIC_NUMBERS.N_800]: '#3e4244',
      [MAGIC_NUMBERS.N_900]: '#262b2c',
      [MAGIC_NUMBERS.N_950]: '#0e1315'
    }
  },
  {
    name: 'ocean',
    palette: {
      [MAGIC_NUMBERS.N_0]: '#ffffff',
      [MAGIC_NUMBERS.N_50]: '#fbfcfc',
      [MAGIC_NUMBERS.N_100]: '#F7F9F8',
      [MAGIC_NUMBERS.N_200]: '#EFF3F2',
      [MAGIC_NUMBERS.N_300]: '#DADEDD',
      [MAGIC_NUMBERS.N_400]: '#B1B7B6',
      [MAGIC_NUMBERS.N_500]: '#828787',
      [MAGIC_NUMBERS.N_600]: '#5F7274',
      [MAGIC_NUMBERS.N_700]: '#415B61',
      [MAGIC_NUMBERS.N_800]: '#29444E',
      [MAGIC_NUMBERS.N_900]: '#183240',
      [MAGIC_NUMBERS.N_950]: '#0c1920'
    }
  }
];

export const THEME_CONFIGURATOR_COLORS = [
  'emerald',
  'green',
  'lime',
  'orange',
  'amber',
  'yellow',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
];
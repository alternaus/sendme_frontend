import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const defaultPalette = palette('#fece2f')

const config = {
  semantic: {
    primary: defaultPalette,
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
         primary: {
          color: '{primary.500}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f6f6f6',
          100: '#d5d5d5',
          200: '#b5b5b5',
          300: '#949494',
          400: '#737373',
          500: '#525252',
          600: '#464646',
          700: '#393939',
          800: '#2d2d2d',
          900: '#212121',
          950: '#151515',
        },
      },
    },
  },
}

const AppTheme = definePreset(Aura, config)

export { AppTheme }



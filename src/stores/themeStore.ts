import { useDark, useToggle } from '@vueuse/core'

import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark({ selector: 'html' })
  const toggleDark = useToggle(isDark)

  return {
    isDark,
    toggleDark,
  }
})

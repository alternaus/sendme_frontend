import { computed, type Ref } from 'vue'

export function useActiveFiltersCount(filters: Record<string, Ref<unknown>>) {
  const activeFiltersCount = computed(() => {
    return Object.values(filters).reduce((count, filterRef) => {
      const value = filterRef.value

      // Verificar si el filtro tiene un valor activo
      if (value === null || value === undefined || value === '') {
        return count
      }

      // Para arrays (como dateRange)
      if (Array.isArray(value)) {
        const validValues = value.filter(v => v !== null && v !== undefined && v !== '')
        return validValues.length > 0 ? count + 1 : count
      }

      // Para strings y otros valores
      if (typeof value === 'string' && value.trim() === '') {
        return count
      }

      return count + 1
    }, 0)
  })

  return {
    activeFiltersCount
  }
}

import {
  asTableType,
  formatTableValue,
  getNestedTableValue,
  getTableValue,
  getTableValueWithDefault,
  hasProperty,
  hasTableValue} from '@/utils/table-type-utils'

/**
 * Composable para usar funciones type-safe en templates de tablas
 */
export const useTableTypes = () => {
  return {
    getTableValue,
    getTableValueWithDefault,
    hasTableValue,
    getNestedTableValue,
    asTableType,
    hasProperty,
    formatTableValue
  }
}

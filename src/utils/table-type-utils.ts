/**
 * Utilidades para tipado seguro en templates de tablas
 */

/**
 * Función para acceso type-safe a propiedades de datos de tabla
 * @param data - Datos de la fila de tabla
 * @param key - Clave de la propiedad a acceder
 * @returns El valor de la propiedad o undefined si no existe
 */
export const getTableValue = <T = unknown>(
  data: Record<string, unknown>,
  key: string
): T | undefined => {
  return data[key] as T | undefined
}

/**
 * Función para acceso type-safe con valor por defecto
 * @param data - Datos de la fila de tabla
 * @param key - Clave de la propiedad a acceder
 * @param defaultValue - Valor por defecto si la propiedad no existe
 * @returns El valor de la propiedad o el valor por defecto
 */
export const getTableValueWithDefault = <T>(
  data: Record<string, unknown>,
  key: string,
  defaultValue: T
): T => {
  const value = data[key]
  return value !== undefined && value !== null ? (value as T) : defaultValue
}

/**
 * Función para verificar si una propiedad existe y tiene valor
 * @param data - Datos de la fila de tabla
 * @param key - Clave de la propiedad a verificar
 * @returns true si la propiedad existe y tiene valor
 */
export const hasTableValue = (
  data: Record<string, unknown>,
  key: string
): boolean => {
  const value = data[key]
  return value !== undefined && value !== null && value !== ''
}

/**
 * Función para acceso type-safe a objetos anidados
 * @param data - Datos de la fila de tabla
 * @param path - Ruta del objeto (ej: 'channel.name')
 * @returns El valor del objeto anidado o undefined
 */
export const getNestedTableValue = <T = unknown>(
  data: Record<string, unknown>,
  path: string
): T | undefined => {
  const keys = path.split('.')
  let current: Record<string, unknown> = data

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key] as Record<string, unknown>
    } else {
      return undefined
    }
  }

  return current as T | undefined
}

/**
 * Función type-safe para conversión de datos de tabla a tipo específico
 * Solo usar cuando estés seguro del tipo de datos
 * @param data - Datos de la fila de tabla
 * @returns Los datos tipados como T
 */
export const asTableType = <T>(data: Record<string, unknown>): T => {
  return data as unknown as T
}

/**
 * Type guard para verificar si un objeto tiene una propiedad específica
 * @param obj - Objeto a verificar
 * @param key - Clave a verificar
 * @returns true si el objeto tiene la propiedad
 */
export const hasProperty = <K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is Record<string, unknown> & Record<K, unknown> => {
  return key in obj && obj[key] !== undefined
}

/**
 * Función para formatear valores de tabla de forma segura
 * @param data - Datos de la fila de tabla
 * @param key - Clave de la propiedad
 * @param formatter - Función de formateo
 * @param defaultValue - Valor por defecto si la propiedad no existe
 * @returns El valor formateado
 */
export const formatTableValue = <T, R>(
  data: Record<string, unknown>,
  key: string,
  formatter: (value: T) => R,
  defaultValue: R
): R => {
  const value = data[key]
  if (value !== undefined && value !== null) {
    try {
      return formatter(value as T)
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

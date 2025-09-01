export const getTableValue = <T = unknown>(
  data: Record<string, unknown>,
  key: string
): T | undefined => {
  return data[key] as T | undefined
}

export const getTableValueWithDefault = <T>(
  data: Record<string, unknown>,
  key: string,
  defaultValue: T
): T => {
  const value = data[key]
  return value !== undefined && value !== null ? (value as T) : defaultValue
}

export const hasTableValue = (
  data: Record<string, unknown>,
  key: string
): boolean => {
  const value = data[key]
  return value !== undefined && value !== null && value !== ''
}

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

export const asTableType = <T>(data: Record<string, unknown>): T => {
  return data as unknown as T
}

export const hasProperty = <K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is Record<string, unknown> & Record<K, unknown> => {
  return key in obj && obj[key] !== undefined
}

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

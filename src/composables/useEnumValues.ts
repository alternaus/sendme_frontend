type StringKeys<T> = Extract<keyof T, string>
type ValueOf<T> = T[StringKeys<T>]
type EnumOption<E> = { name: StringKeys<E>; value: ValueOf<E> }

export function useEnumValues<const E extends Record<string, string | number>>(enumObj: E) {
  const enumKeys = Object.keys(enumObj).filter(k => Number.isNaN(Number(k))) as StringKeys<E>[]

  const enumValues = enumKeys.map(k => enumObj[k]) as ValueOf<E>[]

  const enumOptions = enumKeys.map(k => ({ name: k, value: enumObj[k] })) as EnumOption<E>[]

  return { enumKeys, enumValues, enumOptions }
}

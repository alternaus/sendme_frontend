import { v4 as uuidv4 } from 'uuid'

/**
 * Genera un UUID v4 único
 * @returns {string} UUID en formato string
 */
export const generateUUID = (): string => {
  return uuidv4()
}

/**
 * Genera un UUID corto (sin guiones) para IDs más compactos
 * @returns {string} UUID sin guiones
 */
export const generateShortUUID = (): string => {
  return uuidv4().replace(/-/g, '')
}

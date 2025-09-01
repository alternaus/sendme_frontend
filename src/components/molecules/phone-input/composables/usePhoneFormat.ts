import { computed,ref } from 'vue'

import { type CountryCode,parsePhoneNumberFromString } from 'libphonenumber-js'

export const usePhoneFormat = () => {
  const rawPhoneNumber = ref('')

  const formattedPhoneNumber = ref('')

  const formatPhoneNumber = (number: string, countryCode?: string): string => {
    if (!number || !countryCode) return number
    try {
      const phoneNumberObj = parsePhoneNumberFromString(number, countryCode as CountryCode)
      if (phoneNumberObj && phoneNumberObj.isValid()) {
        return phoneNumberObj.formatNational()
      }
    } catch {
    }
    return number
  }

  const cleanPhoneNumber = (formattedNumber: string): string => {
    return formattedNumber.replace(/\D/g, '')
  }

  const isValidPhoneNumber = (number: string, countryCode?: string): boolean => {
    if (!number || !countryCode) return false

    try {
      const phoneNumberObj = parsePhoneNumberFromString(number, countryCode as CountryCode)
      return phoneNumberObj ? phoneNumberObj.isValid() : false
    } catch {
      return false
    }
  }

  const updatePhoneNumber = (number: string, countryCode?: string) => {
    rawPhoneNumber.value = number
    formattedPhoneNumber.value = formatPhoneNumber(number, countryCode)
  }


  const handleFormattedInput = (inputValue: string, countryCode?: string): string => {
    const cleanedValue = cleanPhoneNumber(inputValue)
    updatePhoneNumber(cleanedValue, countryCode)
    return cleanedValue
  }

  const parseFullPhoneNumber = (fullNumber: string) => {
    if (!fullNumber.startsWith('+')) {
      return { countryCode: null, localNumber: fullNumber }
    }

    try {
      const phoneNumberObj = parsePhoneNumberFromString(fullNumber)
      if (phoneNumberObj) {
        return {
          countryCode: phoneNumberObj.country,
          localNumber: phoneNumberObj.nationalNumber
        }
      }
    } catch  {
    }

    return { countryCode: null, localNumber: fullNumber.replace(/^\+/, '') }
  }

  const isCurrentNumberValid = computed(() => {
    return rawPhoneNumber.value.length >= 7 // Validación básica de longitud
  })

  return {
    rawPhoneNumber,
    formattedPhoneNumber,
    isCurrentNumberValid,
    formatPhoneNumber,
    cleanPhoneNumber,
    isValidPhoneNumber,
    updatePhoneNumber,
    handleFormattedInput,
    parseFullPhoneNumber
  }
}

export type UsePhoneFormatReturn = ReturnType<typeof usePhoneFormat>

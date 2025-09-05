import { MessageChannel } from '../constants/message.constants'

export const validateContactsRequiredWhenSpecific = (contacts: string[], sendToAll: boolean, channel: MessageChannel): boolean => {
  if (sendToAll) {
    return true
  }

  if (!contacts || contacts.length === 0) {
    return false
  }

  switch (channel) {
    case MessageChannel.SMS:
    case MessageChannel.WHATSAPP:
      return contacts.every(contact => /^[\+]?[1-9][\d]{0,15}$/.test(contact.trim()))

    case MessageChannel.EMAIL:
      return contacts.every(contact => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim()))

    default:
      return true
  }
}

export const getContactsValidationError = (channel: MessageChannel): string => {
  switch (channel) {
    case MessageChannel.SMS:
    case MessageChannel.WHATSAPP:
      return 'Los contactos deben ser números de teléfono válidos'

    case MessageChannel.EMAIL:
      return 'Los contactos deben ser direcciones de email válidas'

    default:
      return 'Los contactos son requeridos cuando no se envía a todos'
  }
}

import { computed, type Ref, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { MESSAGE_LIMITS, MessageChannel } from '@/services/send/constants'
import type { MessageEnqueueResult } from '@/services/send/interfaces/message.interface'
import { useSendService } from '@/services/send/useSendService'

interface UseSendMessageOptions {
  initialChannel?: MessageChannel
  preselectedContacts?: string[]
  sendToAllDefault?: boolean
}

export interface UseSendMessageReturn {
  channel: Ref<MessageChannel>
  message: Ref<string>
  subject: Ref<string>
  isSending: Ref<boolean>
  maxLength: Ref<number | undefined>
  canSend: Ref<boolean>
  country: Ref<string | undefined>
  setContacts: (contacts: string[]) => void
  setCountry: (country?: string) => void
  send: () => Promise<MessageEnqueueResult | null>
  reset: () => void
}

export const useSendMessage = (options: UseSendMessageOptions = {}): UseSendMessageReturn => {
  const { initialChannel = MessageChannel.SMS, preselectedContacts = [], sendToAllDefault = false } = options
  const { t } = useI18n()
  const toast = useToast()
  const { sendBatchMessage } = useSendService()

  const channel = ref<MessageChannel>(initialChannel)
  const message = ref('')
  const subject = ref('')
  const isSending = ref(false)
  const contacts = ref<string[]>(preselectedContacts)
  const sendToAll = ref<boolean>(sendToAllDefault)
  const country = ref<string | undefined>(undefined)

  const maxLength = computed(() => {
    if (channel.value === MessageChannel.SMS) return MESSAGE_LIMITS.SMS
    if (channel.value === MessageChannel.WHATSAPP) return MESSAGE_LIMITS.WHATSAPP
    return undefined
  })

  const canSend = computed(() => {
    const hasMessage = message.value.trim().length > 0
    const hasSubject = channel.value === MessageChannel.EMAIL ? subject.value.trim().length > 0 : true
    const hasContacts = sendToAll.value || contacts.value.length > 0
    return hasMessage && hasSubject && hasContacts
  })

  const setContacts = (value: string[]) => {
    contacts.value = value
  }

  const setCountry = (value?: string) => {
    country.value = value
  }

  const buildPayload = () => ({
    channel: channel.value,
    message: message.value.trim(),
    sendToAll: sendToAll.value,
    contacts: sendToAll.value ? [] : contacts.value,
    ...(channel.value === MessageChannel.SMS && country.value ? { country: country.value } : {}),
    ...(channel.value === MessageChannel.EMAIL ? { subject: subject.value.trim() } : {}),
  })

  const reset = () => {
    message.value = ''
    subject.value = ''
    isSending.value = false
    contacts.value = preselectedContacts
    sendToAll.value = sendToAllDefault
    country.value = undefined
  }

  const send = async (): Promise<MessageEnqueueResult | null> => {
    if (!canSend.value) {
      toast.add({
        severity: 'warn',
        summary: t('common.general.warning'),
        detail: t('send.validation_fill_required'),
        life: 3000,
      })
      return null
    }
    isSending.value = true
    try {
      const payload = buildPayload()
      const response = await sendBatchMessage(payload)
      if (response) reset()
      return response
    } finally {
      isSending.value = false
    }
  }

  return { channel, message, subject, isSending, maxLength, canSend, setContacts, setCountry, country, send, reset }
}


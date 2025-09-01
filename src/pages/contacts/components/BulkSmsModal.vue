<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import EmailIcon from '@/assets/svg/email.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { type IBatchMessage,MessageChannel } from '@/services/send/interfaces/message.interface'
import { useSendService } from '@/services/send/useSendService'

interface Props {
  visible: boolean
  selectedContacts: IContact[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'message-sent'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const toast = useToast()
const { sendBatchMessage } = useSendService()

const selectedChannel = ref<MessageChannel>(MessageChannel.SMS)
const message = ref('')
const subject = ref('')
const isSending = ref(false)

const MAX_SINGLE_MESSAGE = 160
const MAX_CONCATENATED_MESSAGE = 153
const MAX_CHARACTERS = 459

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const channelOptions = computed(() => [
  { name: t('general.sms'), value: MessageChannel.SMS },
  { name: t('general.email_channel'), value: MessageChannel.EMAIL },
])

const validContacts = computed(() => {
  if (selectedChannel.value === MessageChannel.SMS) {
    return props.selectedContacts.filter(contact => contact.phone)
  } else {
    return props.selectedContacts.filter(contact => contact.email)
  }
})

const contactNumbers = computed(() => {
  if (selectedChannel.value === MessageChannel.SMS) {
    return validContacts.value.map(contact => {
      let phoneNumber = contact.phone!.replace(/^\+/, '')

      if (contact.countryCode && phoneNumber.startsWith(contact.countryCode)) {
        phoneNumber = phoneNumber.substring(contact.countryCode.length)
      }

      return phoneNumber
    })
  } else {
    return validContacts.value.map(contact => contact.email!)
  }
})

const countryCode = computed(() => {
  if (selectedChannel.value !== MessageChannel.SMS || validContacts.value.length === 0) {
    return undefined
  }

  const countryCodes = validContacts.value.map(contact => contact.countryCode)
  const countryFreq = countryCodes.reduce((acc, code) => {
    acc[code] = (acc[code] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.keys(countryFreq).reduce((a, b) =>
    countryFreq[a] > countryFreq[b] ? a : b
  )
})

const messageInfo = computed(() => {
  const length = message.value.length
  if (selectedChannel.value !== MessageChannel.SMS) {
    return `${length} ${t('general.characters')}`
  }

  let smsCount = 1
  if (length > MAX_SINGLE_MESSAGE) {
    smsCount = Math.ceil((length - MAX_SINGLE_MESSAGE) / MAX_CONCATENATED_MESSAGE) + 1
  }

  return `${length}/${MAX_CHARACTERS} ${t('general.characters')} - ${smsCount} ${t('general.sms')}`
})

const messageLength = computed(() => message.value.length)

const maxLength = computed(() => {
  return selectedChannel.value === MessageChannel.SMS ? MAX_CHARACTERS : undefined
})

const canSend = computed(() => {
  const hasMessage = message.value.trim().length > 0
  const hasSubject = selectedChannel.value === MessageChannel.EMAIL ? subject.value.trim().length > 0 : true
  const hasContacts = contactNumbers.value.length > 0

  return hasMessage && hasSubject && hasContacts
})

watch(() => props.visible, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

const resetForm = () => {
  message.value = ''
  subject.value = ''
  selectedChannel.value = MessageChannel.SMS
}

const sendBulkMessage = async () => {
  if (!canSend.value) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: t('general.enter_all_fields_send_message'),
      life: 3000,
    })
    return
  }

  isSending.value = true
  try {
    const batchMessage: IBatchMessage = {
      channel: selectedChannel.value,
      message: message.value.trim(),
      sendToAll: false,
      contacts: contactNumbers.value,
      ...(selectedChannel.value === MessageChannel.SMS && countryCode.value && { country: countryCode.value }),
      ...(selectedChannel.value === MessageChannel.EMAIL && { subject: subject.value.trim() })
    }

    await sendBatchMessage(batchMessage)

    emit('message-sent')
    dialogVisible.value = false

    const count = contactNumbers.value.length
    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('bulk_sms.messages_sent_successfully', { count }),
      life: 4000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('general.error_sending_message'),
      life: 3000,
    })
  } finally {
    isSending.value = false
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}
</script>

<template>
    <AppDialog
    v-model:modelValue="dialogVisible"
    modal
    :header="t('bulk_sms.title')"
    :style="{ width: '650px' }"
    :closable="!isSending"
    @hide="closeDialog"
  >
    <div class="space-y-4">
      <!-- Selector de canal (SMS/Email) -->
      <div>
        <AppSelect
          v-model="selectedChannel"
          :options="channelOptions"
          class="w-full"
        >
          <template #icon>
            <SmsIcon v-if="selectedChannel === MessageChannel.SMS" class="w-4 h-4 dark:fill-white" />
            <EmailIcon v-else class="w-4 h-4 dark:fill-white" />
          </template>
        </AppSelect>
      </div>

            <!-- Información de contactos seleccionados -->
      <Message
        size="small"
        icon="pi pi-send"
        severity="info"
      >
        <div>
          <div class="font-medium mb-1">{{ t('bulk_sms.selected_contacts_info') }}</div>
          <div class="text-sm">
            {{ t('bulk_sms.contacts_count', { count: validContacts.length, total: selectedContacts.length }) }}
          </div>
          <div v-if="validContacts.length !== selectedContacts.length" class="text-xs mt-1 opacity-80">
            {{
              selectedChannel === MessageChannel.SMS
                ? t('bulk_sms.contacts_without_phone', { count: selectedContacts.length - validContacts.length })
                : t('bulk_sms.contacts_without_email', { count: selectedContacts.length - validContacts.length })
            }}
          </div>
        </div>
      </Message>



      <div v-if="selectedChannel === MessageChannel.EMAIL">
        <AppInput
          v-model="subject"
          :placeholder="t('general.email_subject')"
          :disabled="isSending"
          class="w-full"
        >
          <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
        </AppInput>
      </div>

      <div>
        <AppTextarea
          v-if="selectedChannel === MessageChannel.SMS"
          v-model="message"
          :placeholder="t('bulk_sms.message_placeholder')"
          :rows="8"
          :aiAttach="true"
          :aiInsertMode="'replace'"
          :autoResize="true"
          :maxlength="maxLength"
          :disabled="isSending"
          class="w-full"
        >
          <template #icon><SmsIcon class="w-4 h-4 dark:fill-white" /></template>
        </AppTextarea>

        <AppEditor
          v-else
          v-model="message"
          content-type="html"
          ai-attach
          :placeholder="t('general.write_email_message')"
          :disabled="isSending"
          class="w-full"
        />

        <div class="flex justify-center mt-2">
          <small class="text-sm text-gray-500 dark:text-gray-400">
            {{ messageInfo }}
          </small>
        </div>

        <div v-if="selectedChannel === MessageChannel.SMS && messageLength > MAX_CHARACTERS" class="text-center mt-1">
          <span class="text-red-500 dark:text-red-400 text-xs">
            {{ t('bulk_sms.message_too_long') }}
          </span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton
          @click="closeDialog"
          severity="secondary"
          :disabled="isSending"
          size="small"
        >
          {{ t('general.cancel') }}
        </AppButton>
        <AppButton
          @click="sendBulkMessage"
          :loading="isSending"
          :disabled="!canSend || (selectedChannel === MessageChannel.SMS && messageLength > MAX_CHARACTERS)"
          size="small"
        >
          <i class="pi pi-send mr-2"></i>
          {{
            isSending
              ? t('bulk_sms.sending')
              : selectedChannel === MessageChannel.SMS
                ? t('bulk_sms.send_messages')
                : t('bulk_sms.send_emails')
          }}
        </AppButton>
      </div>
    </template>
    </AppDialog>
</template>

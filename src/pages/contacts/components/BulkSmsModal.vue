<script setup lang="ts">
import { computed, watch } from 'vue'

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
import { useSendMessage } from '@/composables/useSendMessage'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { MESSAGE_LIMITS,MessageChannel } from '@/services/send/constants'

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

const {
  channel: selectedChannel,
  message,
  subject,
  isSending,
  maxLength,
  canSend,
  country,
  send,
  reset,
} = useSendMessage({ initialChannel: MessageChannel.SMS })

const MAX_CHARACTERS = MESSAGE_LIMITS.SMS

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const channelOptions = computed(() => [
  { name: t('common.general.sms'), value: MessageChannel.SMS },
  { name: t('common.general.email_channel'), value: MessageChannel.EMAIL },
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



const messageLength = computed(() => message.value.length)

watch(selectedChannel, () => {
  if (selectedChannel.value !== MessageChannel.SMS) {
    country.value = undefined
  }
})

watch(() => props.visible, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

const resetForm = () => {
  reset()
  selectedChannel.value = MessageChannel.SMS
}

const sendBulkMessage = async () => {
  if (!canSend.value) {
    toast.add({
      severity: 'warn',
      summary: t('contact.general.warning'),
      detail: t('contact.bulk_sms.enter_all_fields_send_message'),
      life: 3000,
    })
    return
  }
  if (selectedChannel.value === MessageChannel.SMS && countryCode.value) {
    country.value = countryCode.value
  }
  const response = await send()
  if (response) {
    emit('message-sent')
    dialogVisible.value = false
    const count = contactNumbers.value.length
    toast.add({
      severity: 'success',
      summary: t('contact.general.success'),
      detail: t('contact.bulk_sms.messages_sent_successfully', { count }),
      life: 4000,
    })
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
    :header="t('contact.bulk_sms.title')"
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
          <div class="font-medium mb-1">{{ t('contact.bulk_sms.selected_contacts_info') }}</div>
          <div class="text-sm">
            {{ t('contact.bulk_sms.contacts_count', { count: validContacts.length, total: selectedContacts.length }) }}
          </div>
          <div v-if="validContacts.length !== selectedContacts.length" class="text-xs mt-1 opacity-80">
            {{
              selectedChannel === MessageChannel.SMS
                ? t('contact.bulk_sms.contacts_without_phone', { count: selectedContacts.length - validContacts.length })
                : t('contact.bulk_sms.contacts_without_email', { count: selectedContacts.length - validContacts.length })
            }}
          </div>
        </div>
      </Message>



      <div v-if="selectedChannel === MessageChannel.EMAIL">
        <AppInput
          v-model="subject"
          :placeholder="t('contact.contacts.contact.general.email_subject')"
          :disabled="isSending"
          class="w-full"
        >
          <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
        </AppInput>
      </div>

      <div>
        <AppEditor
          v-model="message"
          :content-type="selectedChannel === MessageChannel.SMS ? 'text' : 'html'"
          :ai-attach="true"
          :ai-insert-mode="'replace'"
          :placeholder="selectedChannel === MessageChannel.SMS ? t('contact.bulk_sms.message_placeholder') : t('contact.general.write_email_message')"
          :disabled="isSending"
          :maxlength="selectedChannel === MessageChannel.SMS ? maxLength : undefined"
          :rows="selectedChannel === MessageChannel.SMS ? 6 : 8"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex w-auto justify-end gap-2">
        <AppButton
          @click="closeDialog"
          severity="secondary"
          :disabled="isSending"
          size="small"
        >
          {{ t('contact.general.cancel') }}
        </AppButton>
        <AppButton
          @click="sendBulkMessage"
          :loading="isSending"
          :disabled="!canSend || (selectedChannel === MessageChannel.SMS && messageLength > MAX_CHARACTERS)"
          size="small"
        >
          {{
            isSending
              ? t('contact.bulk_sms.sending')
              : selectedChannel === MessageChannel.SMS
                ? t('contact.bulk_sms.send_messages')
                : t('contact.bulk_sms.send_emails')
          }}
        </AppButton>
      </div>
    </template>
    </AppDialog>
</template>

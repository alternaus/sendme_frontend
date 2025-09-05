<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'

import { useI18n } from 'vue-i18n'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useContactService } from '@/services/contact/useContactService'
import { MESSAGE_LIMITS,MessageChannel } from '@/services/send/constants/message.constants'
import { createSmsMessageTypeOptions } from '@/services/send/helpers/message-options.helper'
import { useSendService } from '@/services/send/useSendService'

import { useFormSendMessage } from '../composables/useSendForm'

export default defineComponent({
  name: 'SendSmsFormPage',
  components: {
    AppTextarea,
    AppEditor,
    AppSelect,
    PhoneIcon,
    BtnSend,
    ContactsIcon,
  },
  setup() {
    const { t } = useI18n()
    const contactsInput = ref('')
    const contactsCount = ref<number | null>(null)
    const sendService = useSendService()
    const contactService = useContactService()
    const { form, handleSubmit, resetForm, errors, setValues } = useFormSendMessage(MessageChannel.SMS)
    const MAX_CHARACTERS = MESSAGE_LIMITS.SMS

    const messageTypeOptions = createSmsMessageTypeOptions(t)

    const fetchContactsCount = async () => {
      try {
        const contacts = await contactService.getContactCount()
        contactsCount.value = contacts?.total ?? null
      } catch {
        contactsCount.value = null
      }
    }

    watchEffect(() => {
      if (form.sendToAll.value) {
        fetchContactsCount()
      }
    })

    watchEffect(() => {
      form.contacts.value = contactsInput.value
        .split(',')
        .map((num) => num.trim())
        .filter((num) => num.length > 0)
    })

    const sendMessage = handleSubmit(async (values) => {
      const batchMessage = {
        channel: MessageChannel.SMS,
        message: values.message,
        sendToAll: values.sendToAll,
        contacts: values.sendToAll ? [] : values.contacts,
        country: values.country,
        messageType: values.messageType,
      }

      const response = await sendService.sendBatchMessage(batchMessage)
      if (response) {
        resetForm()
        contactsInput.value = ''
      }
    })

    return {
      form,
      sendMessage,
      errors,
      setValues,
      contactsInput,
      MAX_CHARACTERS,
      contactsCount,
      messageTypeOptions,
    }
  },
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-center items-center gap-2">
      <div
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="!form.sendToAll.value ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="form.sendToAll.value = false"
      >
        <PhoneIcon class="w-5 h-5 fill-current" />
      </div>
      <div
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="form.sendToAll.value ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="form.sendToAll.value = true"
      >
        <ContactsIcon class="w-5 h-5 fill-current" />
      </div>
    </div>
    <div v-if="form.sendToAll.value" class="text-center">
      <small class="text-xs text-gray-500 dark:text-gray-400">
        {{ (contactsCount ?? 0) + ' ' + $t('contact.contacts') }}
      </small>
    </div>

    <AppSelect
      v-model="form.messageType.value"
      :options="messageTypeOptions"
      :label="$t('general.message_type')"
      :placeholder="$t('general.select_message_type')"
      class="w-full"
    />

    <AppTextarea
      v-if="!form.sendToAll.value"
      v-model="contactsInput"
      :rows="2"
      :placeholder="$t('general.enter_numbers_separated_by_commas')"
      class="w-full"
    >
      <template #icon><PhoneIcon class="w-4 h-4 dark:fill-white" /></template>
    </AppTextarea>

    <AppEditor
      v-model="form.message.value"
      content-type="text"
      :ai-attach="true"
      :placeholder="$t('general.editor.sms_placeholder')"
      :maxlength="MAX_CHARACTERS"
      :rows="10"
      class="w-full"
    />

    <div class="flex justify-center mt-3">
      <button type="button" @click="sendMessage" class="transition-transform hover:scale-105">
        <BtnSend class="w-12 h-12 cursor-pointer" />
      </button>
    </div>
  </div>
</template>

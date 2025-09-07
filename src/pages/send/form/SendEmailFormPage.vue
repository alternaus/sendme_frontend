<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import { useContactService } from '@/services/contact/useContactService'
import { MessageChannel } from '@/services/send/constants/message.constants'
import { useSendService } from '@/services/send/useSendService'

import { useFormSendMessage } from '../composables/useSendForm'

export default defineComponent({
  name: 'SendEmailFormPage',
  components: {
    AppInput,
    AppEditor,
    EmailIcon,
    BtnSend,
    ContactsIcon,
  },
  setup() {
    const contactsInput = ref('')
    const contactsCount = ref<number | null>(null)
    const sendService = useSendService()
    const contactService = useContactService()
    const { form, handleSubmit, resetForm, errors, setValues } = useFormSendMessage(MessageChannel.EMAIL)

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
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
    })

    const sendMessage = handleSubmit(async (values) => {
      const batchMessage = {
        channel: MessageChannel.EMAIL,
        message: values.message,
        sendToAll: values.sendToAll,
        contacts: values.sendToAll ? [] : values.contacts,
        subject: values.subject,
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
      contactsCount,
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
        <EmailIcon class="w-5 h-5 dark:fill-white" />
      </div>
      <div
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="form.sendToAll.value ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="form.sendToAll.value = true"
      >
        <ContactsIcon class="w-5 h-5 dark:fill-white" />
      </div>
    </div>
    <div v-if="form.sendToAll.value" class="text-center">
      <small class="text-xs text-gray-500 dark:text-gray-400">
        {{ (contactsCount ?? 0) + ' ' + $t('contact.contacts') }}
      </small>
    </div>

    <AppInput
      v-if="!form.sendToAll.value"
      v-model="contactsInput"
      :placeholder="$t('send.enter_emails_separated_by_commas')"
      class="w-full"
    >
      <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
    </AppInput>

    <AppInput
      v-model="form.subject.value"
      :placeholder="$t('send.email_subject')"
      class="w-full"
    >
      <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
    </AppInput>

    <AppEditor
      v-model="form.message.value"
      content-type="html"
      :ai-attach="true"
      :placeholder="$t('send.editor.email_placeholder')"
      class="w-full"
    />

    <div class="flex justify-center mt-3">
      <button type="button" @click="sendMessage" class="transition-transform hover:scale-105">
        <BtnSend class="w-12 h-12 cursor-pointer" />
      </button>
    </div>
  </div>
</template>

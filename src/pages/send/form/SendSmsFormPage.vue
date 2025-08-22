<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'

import { useI18n } from 'vue-i18n'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useContactService } from '@/services/contact/useContactService'
import { MessageChannel } from '@/services/send/interfaces/message.interface'
import { useSendService } from '@/services/send/useSendService'

import { useFormSendMessage } from '../composables/useSendForm'

export default defineComponent({
  name: 'SendSmsFormPage',
  components: {
    AppTextarea,
    PhoneIcon,
    SmsIcon,
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
    const MAX_SINGLE_MESSAGE = 160
    const MAX_CONCATENATED_MESSAGE = 153
    const MAX_CHARACTERS = 459

    const messageInfo = computed(() => {
      const length = form.message.value.length
      let smsCount = 1

      if (length > MAX_SINGLE_MESSAGE) {
        smsCount = Math.ceil((length - MAX_SINGLE_MESSAGE) / MAX_CONCATENATED_MESSAGE) + 1
      }

      return `${length} ${t('general.characters')} - ${smsCount} ${t('general.sms')}`
    })

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
      }

      const response = await sendService.sendBatchMessage(batchMessage)
      if (response) {
        resetForm()
        contactsInput.value = ''
      }
    })

    return {
      form,
      messageInfo,
      sendMessage,
      errors,
      setValues,
      contactsInput,
      MAX_CHARACTERS,
      contactsCount,
    }
  },
})
</script>

<template>
  <div>
    <div class="flex justify-center items-center flex-wrap my-2 mb-4">
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="
          !form.sendToAll.value
            ? 'bg-white dark:bg-zinc-700 dark:border-zinc-600 border rounded-lg border-slate-300'
            : ''
        "
        @click="form.sendToAll.value = false"
      >
        <PhoneIcon class="w-6 h-6 dark:fill-white" />
      </div>
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="form.sendToAll.value ? 'bg-white border rounded-lg border-slate-300' : ''"
        @click="form.sendToAll.value = true"
      >
        <ContactsIcon class="w-6 h-6 dark:fill-white" />
      </div>
    </div>
    <div class="flex flex-col mb-2" v-if="form.sendToAll.value">
      <small class="text-center text-sm text-gray-500 dark:text-gray-100">
        {{ (contactsCount ?? 0) + ' ' + $t('contact.contacts') }}
      </small>
    </div>

    <AppTextarea
      v-if="!form.sendToAll.value"
      v-model="contactsInput"
      :rows="2"
      :placeholder="$t('general.enter_numbers_separated_by_commas')"
      class="w-full mb-4"
    >
      <template #icon><PhoneIcon class="w-4 h-4 dark:fill-white" /></template>
    </AppTextarea>

    <AppTextarea
      v-model="form.message.value"
      :rows="12"
      :placeholder="$t('general.write_message')"
      :maxlength="MAX_CHARACTERS"
      class="w-full mb-2"
    >
      <template #icon><SmsIcon class="w-4 h-4 dark:fill-white" /></template>
    </AppTextarea>

    <div class="flex flex-col">
      <small class="text-center text-sm text-gray-500 dark:text-gray-100">
        {{ messageInfo }}
      </small>
    </div>

    <div class="flex justify-center my-4">
      <button type="button" @click="sendMessage">
        <BtnSend class="w-14 h-14 cursor-pointer" />
      </button>
    </div>
  </div>
</template>

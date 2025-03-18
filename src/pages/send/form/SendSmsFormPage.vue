<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
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
    const toast = useToast()
    const sendToAllContacts = ref(false)
    const contactsInput = ref('')
    const sendService = useSendService()
    const { form, handleSubmit, resetForm, errors, setValues } = useFormSendMessage()
    const maxCharacters = 160

    const remainingCharacters = computed(() => maxCharacters - form.message.value.length)

    watchEffect(() => {
      form.contacts.value = contactsInput.value
        .split(',')
        .map((num) => num.trim())
        .filter((num) => num.length > 0)
    })

    const sendMessage = handleSubmit(async (values) => {
      // console.log('values', values)
      const response = await sendService.sendMessageSms(values)

      if (response) {
        resetForm()
        contactsInput.value = ''
        toast.add({
          severity: 'success',
          summary: t('general.success'),
          detail: t('general.message_send_success'),
          life: 3000,
        })
      } else {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('general.error_sending_message'),
          life: 3000,
        })
      }
    })

    return {
      form,
      remainingCharacters,
      sendMessage,
      errors,
      setValues,
      sendToAllContacts,
      contactsInput,
    }
  },
})
</script>

<template>
  <div>
    <div class="flex justify-center items-center flex-wrap my-2 mb-4">
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="!sendToAllContacts ? 'bg-white border rounded-lg border-slate-300' : ''"
        @click="sendToAllContacts = false"
      >
        <PhoneIcon class="w-6 h-6" />
      </div>
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="sendToAllContacts ? 'bg-white border rounded-lg border-slate-300' : ''"
        @click="sendToAllContacts = true"
      >
        <ContactsIcon class="w-6 h-6" />
      </div>
    </div>

    <AppTextarea
      v-if="!sendToAllContacts"
      v-model="contactsInput"
      :rows="2"
      :placeholder="$t('general.enter_numbers_separated_by_commas')"
      class="w-full mb-4"
    >
      <template #icon><PhoneIcon class="w-4 h-4" /></template>
    </AppTextarea>

    <AppTextarea
      v-model="form.message.value"
      :rows="12"
      :placeholder="$t('general.write_message')"
      class="w-full mb-2"
    >
      <template #icon><SmsIcon class="w-4 h-4" /></template>
    </AppTextarea>

    <div class="flex flex-col">
      <small class="text-center text-sm text-gray-500">
        {{ remainingCharacters }} {{ $t('general.characters') }}
      </small>
    </div>

    <div class="flex justify-center my-4">
      <button type="button" @click="sendMessage">
        <BtnSend class="w-14 h-14 cursor-pointer" />
      </button>
    </div>
  </div>
</template>

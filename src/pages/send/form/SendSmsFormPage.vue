<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'

import { useI18n } from 'vue-i18n'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import TagManager from '@/components/molecules/TagManager.vue'
import { useContactService } from '@/services/contact/useContactService'
import { MESSAGE_LIMITS, MessageChannel } from '@/services/send/constants'
import { useSmsService } from '@/services/send/useSmsService'

import { createSmsMessageTypeOptions } from '../../../services/send/helpers/message-options.helper'
import { type SendMessageForm, SendType, useFormSendMessage } from '../../send/composables/useSendForm'

export default defineComponent({
  name: 'SendSmsFormPage',
  components: {
    AppTextarea,
    AppEditor,
    AppSelect,
    PhoneIcon,
    BtnSend,
    ContactsIcon,
    CredentialIcon,
    TagManager,
  },
  setup() {
    const { t } = useI18n()
    const contactsInput = ref('')
    const contactsCount = ref<number | null>(null)
    const sendType = ref<SendType>(SendType.CONTACTS) // Nueva variable para tipo de envío
    const smsService = useSmsService()
    const contactService = useContactService()
    const { form, handleSubmit, resetForm, errors, setValues } = useFormSendMessage(MessageChannel.SMS)
    const MAX_CHARACTERS = MESSAGE_LIMITS.SMS

    const messageTypeOptions = createSmsMessageTypeOptions(t)

    // Computed para mostrar el editor de mensaje progresivamente
    const shouldShowMessageEditor = computed(() => {
      if (!form.messageType.value) return false

      if (sendType.value === SendType.ALL) return true
      if (sendType.value === SendType.CONTACTS) return contactsInput.value.length > 0
      if (sendType.value === SendType.TAGS) return (form.tagIds.value?.length ?? 0) > 0

      return false
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

    // Sincronizar sendType con los campos del formulario
    watchEffect(() => {
      form.sendToAll.value = sendType.value === SendType.ALL
      form.sendToTags.value = sendType.value === SendType.TAGS
    })

    watchEffect(() => {
      form.contacts.value = contactsInput.value
        .split(',')
        .map((num) => num.trim())
        .filter((num) => num.length > 0)
    })

    const sendMessage = handleSubmit(async (values: SendMessageForm) => {
      const basePayload = {
        message: values.message,
        type: values.messageType,
        ...(values.country ? { country: values.country } : {}),
      }

      let response

      if (values.sendToAll) {
        response = await smsService.sendSmsToAll(basePayload)
      } else if (values.sendToTags) {
        response = await smsService.sendSmsToTags({ ...basePayload, tagIds: values.tagIds || [] })
      } else {
        response = await smsService.sendSmsToContacts({ ...basePayload, contacts: values.contacts })
      }

      if (response) {
        resetForm()
        contactsInput.value = ''
        sendType.value = SendType.CONTACTS
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
      sendType,
      SendType,
      shouldShowMessageEditor,
    }
  },
})
</script>

<template>
  <div class="space-y-4">
    <!-- Step 1: Tipo de envío (contactos, todos, o tags) -->
    <div class="flex justify-center items-center gap-3">
      <div
        class="p-2 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.CONTACTS ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.CONTACTS"
        :title="$t('send.tooltip_send_to_contacts')"
      >
        <PhoneIcon class="w-5 h-5 fill-current" />
      </div>
      <div
        class="p-2 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.ALL ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.ALL"
        :title="$t('send.tooltip_send_to_all')"
      >
        <ContactsIcon class="w-5 h-5 fill-current" />
      </div>
      <div
        class="p-2 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.TAGS ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.TAGS"
        :title="$t('send.tooltip_send_to_tags')"
      >
        <CredentialIcon class="w-5 h-5 fill-current" />
      </div>
    </div>

    <!-- Info contactos cuando es "todos" -->
    <div v-show="sendType === SendType.ALL" class="text-center">
      <small class="text-xs text-gray-500 dark:text-gray-400">
        {{ (contactsCount ?? 0) + ' ' + $t('contact.contacts') }}
      </small>
    </div>

    <!-- Step 2: Tipo de mensaje SMS -->
    <div v-if="sendType !== null">
      <AppSelect
        v-model="form.messageType.value"
        :options="messageTypeOptions"
        :label="$t('send.message_type')"
        :placeholder="$t('send.select_message_type')"
        class="w-full"
      />
    </div>

    <!-- Step 3: Input específico según tipo de envío -->
    <!-- Input de contactos específicos -->
    <div v-if="sendType === SendType.CONTACTS && form.messageType.value">
      <AppTextarea
        v-model="contactsInput"
        :placeholder="$t('send.enter_numbers_separated_by_commas')"
        class="w-full text-sm"
      >
        <template #icon><PhoneIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppTextarea>
    </div>

    <!-- Selector de tags -->
    <div v-if="sendType === SendType.TAGS && form.messageType.value">
      <TagManager
        v-model="form.tagIds.value"
        :placeholder="$t('send.select_tags')"
        :allow-create="false"
        :allow-manage="false"
        :error-message="errors.tagIds"
        :show-error-message="!!errors.tagIds"
        class="w-full"
      />
    </div>

    <!-- Step 4: Editor de mensaje -->
    <div v-if="shouldShowMessageEditor">
      <AppEditor
        v-model="form.message.value"
        content-type="text"
        :ai-attach="true"
        :placeholder="$t('send.editor.sms_placeholder')"
        :maxlength="MAX_CHARACTERS"
        :rows="10"
        class="w-full text-sm"
      />
    </div>

    <!-- Step 5: Botón de envío -->
    <div v-if="form.message.value" class="flex justify-center pt-2">
      <button type="button" @click="sendMessage" class="transition-transform hover:scale-105">
        <BtnSend class="w-10 h-10 cursor-pointer" />
      </button>
    </div>
  </div>
</template>

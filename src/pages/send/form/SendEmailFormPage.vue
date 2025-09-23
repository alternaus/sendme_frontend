<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'

import BtnSend from '@/assets/svg/btn_send.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import ContactChips from '@/components/molecules/ContactChips.vue'
import TagManager from '@/components/molecules/TagManager.vue'
import { useContactService } from '@/services/contact/useContactService'
import { MessageChannel } from '@/services/send/constants'
import { useEmailService } from '@/services/send/useEmailService'

import { SendType, useFormSendMessage } from '../../send/composables/useSendForm'

export default defineComponent({
  name: 'SendEmailFormPage',
  components: {
    AppInput,
    AppEditor,
    EmailIcon,
    BtnSend,
    ContactsIcon,
    CredentialIcon,
    TagManager,
    ContactChips,
  },
  setup() {
    const contactsCount = ref<number | null>(null)
    const sendType = ref<SendType>(SendType.CONTACTS)
    const emailService = useEmailService()
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
      form.sendToAll.value = sendType.value === SendType.ALL
      form.sendToTags.value = sendType.value === SendType.TAGS
    })

    const shouldShowSubject = computed(() => {
      if (sendType.value === SendType.ALL) return true
      if (sendType.value === SendType.CONTACTS) return (form.contacts.value?.length ?? 0) > 0
      if (sendType.value === SendType.TAGS) return (form.tagIds.value?.length ?? 0) > 0
      return false
    })

    const shouldShowMessageEditor = computed(() => {
      return shouldShowSubject.value && (form.subject.value?.length ?? 0) > 0
    })

    const sendMessage = handleSubmit(async (values) => {
      const basePayload = {
        subject: values.subject?.trim() ?? '',
        message: values.message,
      }

      let response

      if (values.sendToAll) {
        response = await emailService.sendEmailToAll(basePayload)
      } else if (values.sendToTags) {
        response = await emailService.sendEmailToTags({ ...basePayload, tagIds: values.tagIds || [] })
      } else {
        response = await emailService.sendEmailToContacts({ ...basePayload, contacts: values.contacts })
      }

      if (response) {
        resetForm()
        sendType.value = SendType.CONTACTS
      }
    })

    return {
      form,
      sendMessage,
      errors,
      setValues,
      contactsCount,
      sendType,
      SendType,
      shouldShowSubject,
      shouldShowMessageEditor,
    }
  },
})
</script>

<template>
  <div class="space-y-3">
    <!-- Step 1: Tipo de envío (contactos, todos, o tags) -->
    <div class="flex justify-center items-center gap-2">
      <div
        v-tooltip.bottom="$t('send.tooltip_send_to_contacts')"
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.CONTACTS ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.CONTACTS"
      >
        <EmailIcon class="w-5 h-5 dark:fill-white" />
      </div>
      <div
        v-tooltip.bottom="$t('send.tooltip_send_to_all')"
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.ALL ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.ALL"
      >
        <ContactsIcon class="w-5 h-5 dark:fill-white" />
      </div>
      <div
        v-tooltip.bottom="$t('send.tooltip_send_to_tags')"
        class="p-1.5 cursor-pointer rounded-lg transition-colors"
        :class="sendType === SendType.TAGS ? 'bg-white dark:bg-zinc-700 border border-slate-300 dark:border-zinc-600' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'"
        @click="sendType = SendType.TAGS"
      >
        <CredentialIcon class="w-5 h-5 dark:fill-white" />
      </div>
    </div>

    <!-- Contact count display (when sending to all) -->
    <div v-if="sendType === SendType.ALL" class="text-center">
      <small class="text-xs text-gray-500 dark:text-gray-400">
        {{ (contactsCount ?? 0) + ' ' + $t('contact.contacts') }}
      </small>
    </div>

    <!-- Step 2: Input específico según tipo de envío (progresivo) -->

    <!-- Contact input (when not sending to all) -->
    <div v-if="sendType === SendType.CONTACTS">
      <ContactChips
        v-model="form.contacts.value"
        type="email"
        :placeholder="$t('send.enter_emails_separated_by_commas')"
        class="w-full"
      />
    </div>

    <!-- Selector de tags -->
    <div v-if="sendType === SendType.TAGS">
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

    <!-- Step 3: Email subject (progressive - show when contact selection is made) -->
    <div v-if="shouldShowSubject">
      <AppInput
        v-model="form.subject.value"
        :placeholder="$t('send.email_subject')"
        class="w-full"
      >
        <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>
    </div>

    <!-- Step 4: Message editor (progressive - show when subject has content) -->
    <div v-if="shouldShowMessageEditor">
      <AppEditor
        v-model="form.message.value"
        content-type="html"
        :ai-attach="true"
        :placeholder="$t('send.editor.email_placeholder')"
        class="w-full"
      />
    </div>

    <!-- Step 5: Send button (progressive - show when message has content) -->
    <div v-if="form.message.value.length > 0" class="flex justify-center mt-3">
      <button type="button" @click="sendMessage" class="transition-transform hover:scale-105">
        <BtnSend class="w-12 h-12 cursor-pointer" />
      </button>
    </div>
  </div>
</template>




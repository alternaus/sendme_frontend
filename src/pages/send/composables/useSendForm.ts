import {  useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { MessageChannel, SmsMessageType } from '@/services/send/constants/message.constants'
import { validateContactsRequiredWhenSpecific } from '@/services/send/validators/contacts-required-when-specific.validator'

export enum SendType {
  CONTACTS = 'contacts',
  ALL = 'all',
  TAGS = 'tags'
}

export interface SendMessageForm {
  channel: MessageChannel;
  message: string;
  sendToAll?: boolean;
  sendToTags?: boolean; // Nueva opción para tags
  contacts: string[];
  tagIds?: string[]; // Nueva propiedad para IDs de tags
  country: string;
  subject?: string; // Para emails
  messageType?: SmsMessageType; // Para SMS
}

export interface SendMessageFormRef {
  channel: Ref<MessageChannel>;
  message: Ref<string>;
  sendToAll: Ref<boolean>;
  sendToTags: Ref<boolean>;
  contacts: Ref<string[]>;
  tagIds: Ref<string[]>;
  country: Ref<string>;
  subject: Ref<string>;
  messageType: Ref<SmsMessageType>;
}

export const useFormSendMessage = (defaultChannel: MessageChannel = MessageChannel.SMS) => {
  const { t } = useI18n()

  yup.setLocale({
    mixed: {
      required: () => t('send.required_field'),
    }
  })

  const schema = yup.object<SendMessageForm>({
    channel: yup.string().oneOf(Object.values(MessageChannel)).required(),
    message: yup.string().required(),
    sendToAll: yup.boolean().optional(),
    sendToTags: yup.boolean().optional(),
    contacts: yup.array().of(yup.string()).when(['sendToAll', 'sendToTags', 'channel'], {
      is: (sendToAll: boolean, sendToTags: boolean, _channel: MessageChannel) => !sendToAll && !sendToTags,
      then: (schema) => schema.min(1, t('send.contacts_required')).test('contacts-valid', function(value) {
        const { channel } = this.parent
        if (!value || value.length === 0) return false
        const contacts = value.filter((c): c is string => typeof c === 'string')
        return validateContactsRequiredWhenSpecific(contacts, false, channel)
      }),
      otherwise: (schema) => schema.optional(),
    }),
    tagIds: yup.array().of(yup.string()).when(['sendToTags'], {
      is: (sendToTags: boolean) => sendToTags,
      then: (schema) => schema.min(1, t('send.tags_required')),
      otherwise: (schema) => schema.optional(),
    }),
    country: yup.string(),
    subject: yup.string().when('channel', {
      is: MessageChannel.EMAIL,
      then: (schema) => schema.required(t('send.required_field')),
      otherwise: (schema) => schema.optional(),
    }),
    messageType: yup.string().oneOf(Object.values(SmsMessageType)).when('channel', {
      is: MessageChannel.SMS,
      then: (schema) => schema.required(t('send.required_field')),
      otherwise: (schema) => schema.optional(),
    }),
  })


  const {defineField, handleSubmit, resetForm, errors, setValues} = useForm<SendMessageForm>({
    validationSchema: schema,
    initialValues: {
      channel: defaultChannel,
      message: '',
      sendToAll: false,
      sendToTags: false,
      contacts: [],
      tagIds: [],
      country: 'CO',
      subject: '',
      messageType: SmsMessageType.SMS,
    },
    validateOnMount: false,
  })

  const [channel] = defineField('channel')
  const [message] = defineField('message')
  const [sendToAll] = defineField('sendToAll')
  const [sendToTags] = defineField('sendToTags')
  const [contacts] = defineField('contacts')
  const [tagIds] = defineField('tagIds')
  const [country] = defineField('country')
  const [subject] = defineField('subject')
  const [messageType] = defineField('messageType')


  return {
    form:{
      channel,
      message,
      sendToAll,
      sendToTags,
      contacts,
      tagIds,
      country,
      subject,
      messageType,
    },
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}

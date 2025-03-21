import {  useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface SendMessageForm {
  contacts: string[];
  message: string;
  country: string;
}

export interface SendMessageFormRef {
  contacts: Ref<string[]>;
  message: Ref<string>;
  country: Ref<string>;
}

export const useFormSendMessage = () => {
  const { t } = useI18n()

  yup.setLocale({
    mixed: {
      required: () => t('general.required_field'),
    }
  })

  const schema = yup.object<SendMessageForm>({
    message: yup.string().required(),
    contacts: yup.array().of(yup.string().matches(/^\d+$/, t('general.invalid_phone'))).optional(),
    country: yup.string(),
  })
  

  const {defineField, handleSubmit, resetForm, errors, setValues} = useForm<SendMessageForm>({
    validationSchema: schema,
    initialValues: {
      contacts: [],
      message: '',
      country: 'CO',
    },
    validateOnMount: false,
  })
  const [contacts] = defineField('contacts')
  const [message] = defineField('message')
  const [country] = defineField('country')


  return {
    form:{
      contacts,
      message,
      country,
    },
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}
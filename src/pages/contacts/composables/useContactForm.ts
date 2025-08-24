import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import { ContactStatus } from '@/services/contact/enums/contact-status.enum'

export interface CustomValue {
  customFieldId?: number
  value?: string
  id?: number
}

export interface ContactForm {
  name: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  status: ContactStatus
  birthDate: Date | null
  customValues: CustomValue[]
}

export interface ContactFormRef {
  name: Ref<string>
  lastName: Ref<string>
  email: Ref<string>
  phone: Ref<string>
  countryCode: Ref<string>
  status: Ref<'active' | 'inactive'>
  birthDate: Ref<Date>
  organizationId: Ref<number>
  customValue: Ref<FieldEntry<CustomValue>[]>
}

export const useFormContact = () => {
  const { t } = useI18n()

  yup.setLocale({
    mixed: {
      required: () => t('general.required_field'),
    },
    string: {
      email: () => t('general.invalid_email'),
    },
  })

  //✅ Definir esquema de validación con traducciones
  const schema = yup.object<ContactForm>({
    name: yup.string().required().label(t('general.name')),
    lastName: yup.string().required().label(t('general.last_name')),
    email: yup.string().email().required().label(t('general.email')),
    phone: yup.string().required().label(t('general.phone')),
    countryCode: yup.string().required().label(t('general.country_code')),
    status: yup.string().oneOf(['active', 'inactive']).required().label(t('general.status')),
    birthDate: yup.date().required().label(t('general.birth_date')),
    customValues: yup.array().of(
      yup.object().shape({
        customFieldId: yup.number().integer().required().label('form.customFieldId'),
        value: yup.string().required().label('form.customValue'),
        id: yup.number().integer().nullable().label('form.customId'),
      }),
    ),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<ContactForm>({
    validationSchema: schema,
    initialValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '',
      status: ContactStatus.ACTIVE,
      birthDate: new Date(),
      customValues: [],
    },
    validateOnMount: false,
  })

  const [name] = defineField('name')
  const [lastName] = defineField('lastName')
  const [email] = defineField('email')
  const [phone] = defineField('phone')
  const [countryCode] = defineField('countryCode')
  const [status] = defineField('status')
  const [birthDate] = defineField('birthDate')

  const {
    fields: customValues,
    push: addCustomValue,
    remove: removeCustomValue,
  } = useFieldArray<CustomValue>('customValues')

  const addCustomField = (field: { customFieldId: number; value?: string; id?: number }) => {
    addCustomValue(field)
  }

  const removeCustomField = (index: number) => {
    removeCustomValue(index)
  }

  return {
    form: {
      name,
      lastName,
      email,
      phone,
      countryCode,
      status,
      birthDate,
      customValues,
    },
    handleSubmit,
    resetForm,
    errors,
    setValues,
    addCustomField,
    removeCustomField,
  }
}

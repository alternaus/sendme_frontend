import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
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

const schema = yup.object<ContactForm>({
  name: yup.string().required().label('Nombre'),
  lastName: yup.string().required().label('Apellido'),
  email: yup.string().email().required().label('Correo Electrónico'),
  phone: yup.string().required().label('Teléfono'),
  countryCode: yup.string().required().label('Código de País'),
  status: yup.string().oneOf(['active', 'inactive']).required().label('Estado'),
  birthDate: yup.date().required().label('Fecha de Nacimiento'),
  customValues: yup.array().of(
    yup.object().shape({
      customFieldId: yup.number().integer().required().label('ID de Campo Personalizado'),
      value: yup.string().required().label('Valor del Campo'),
      id: yup.number().integer().nullable().label('ID de Valor personalizado'),
    }),
  ),
})

export const useFormContact = () => {
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

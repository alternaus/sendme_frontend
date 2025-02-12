import { type FieldEntry,useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface CustomValue {
  customFieldId: number | undefined
  value: string | undefined
}

export interface ContactForm {
  name: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  status: 'active' | 'inactive'
  birthDate: Date
  organizationId: number
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
  customValues: Ref<FieldEntry<CustomValue>[]>
}

const schema = yup.object<ContactForm>({
  name: yup.string().required().label('Nombre'),
  lastName: yup.string().required().label('Apellido'),
  email: yup.string().email().required().label('Correo Electrónico'),
  phone: yup.string().required().label('Teléfono'),
  countryCode: yup.string().required().label('Código de País'),
  status: yup.string().oneOf(['active', 'inactive']).required().label('Estado'),
  birthDate: yup.date().required().label('Fecha de Nacimiento'),
  organizationId: yup.number().integer().required().label('ID de Organización'),
  customValues: yup.array().of(
    yup.object().shape({
      label: yup.string().required().label('Etiqueta del Campo'),
      customFieldId: yup.number().integer().required().label('ID de Campo Personalizado'),
      value: yup.string().required().label('Valor del Campo'),
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
      status: 'active',
      birthDate: new Date(),
      organizationId: 0,
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
  const [organizationId] = defineField('organizationId')

  const {
    fields: customValues,
    push: addCustomValue,
    remove: removeCustomValue,
  } = useFieldArray<CustomValue>('customValues')

  const addCustomField = (field: { customFieldId: number; value: string | undefined }) => {
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
      organizationId,
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

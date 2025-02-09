import { useForm, useFieldArray } from 'vee-validate'
import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: 'Este campo es obligatorio',
  },
})

const schema = yup.object({
  name: yup.string().required().label('Nombre'),
  lastName: yup.string().required().label('Apellido'),
  email: yup.string().email().required().label('Correo Electrónico'),
  phone: yup.string().required().label('Teléfono'),
  countryCode: yup.string().required().label('Código de País'),
  status: yup.string().oneOf(['active', 'inactive']).required().label('Estado'),
  birthDate: yup.date().required().label('Fecha de Nacimiento'),
  organizationId: yup.number().integer().required().label('ID de Organización'),
  customValue: yup.array().of(
    yup.object().shape({
      customFieldId: yup.number().integer().required().label('ID de Campo Personalizado'),
      value: yup.string().required().label('Valor del Campo'),
    }),
  ),
})

export const useFormContact = () => {
  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm({
    validationSchema: schema,
    initialValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '',
      status: 'active',
      birthDate: new Date().toISOString().split('T')[0],
      organizationId: 0,
      customValue: [
        {
          customFieldId: 0,
          value: '',
        },
      ],
    },
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
  } = useFieldArray('customValue')

  const addCustomField = () => {
    addCustomValue({
      customFieldId: 0,
      value: '',
    })
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

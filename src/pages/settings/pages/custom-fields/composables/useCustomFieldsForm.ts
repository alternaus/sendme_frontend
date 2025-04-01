import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface CustomFieldForm {
  fieldName: string
  dataType: 'string' | 'number' | 'date'
}

export interface CustomFieldFormRef {
  customFields: Ref<FieldEntry<CustomFieldForm>[]>
}

export const useCustomFieldForm = () => {
  const schema = yup.object({
    customFields: yup.array().of(
      yup.object({
        fieldName: yup.string().required('El nombre del campo es obligatorio'),
        dataType: yup
          .string()
          .oneOf(['string', 'number', 'date'])
          .required('El tipo de campo es obligatorio'),
      }),
    ),
  })

  const { handleSubmit, errors, resetForm } = useForm<{
    customFields: CustomFieldForm[]
  }>({
    validationSchema: schema,
    initialValues: {
      customFields: [],
    },
  })

  const {
    fields: customFields,
    push: addCustomField,
    remove: removeCustomField,
  } = useFieldArray<CustomFieldForm>('customFields')

  const addEmptyField = () => {
    if (customFields.value.length < 10) {
      addCustomField({
        fieldName: '',
        dataType: 'string',
      })
    }
  }

  return {
    customFields,
    addCustomField,
    removeCustomField,
    addEmptyField,
    handleSubmit,
    errors,
    resetForm,
  }
}

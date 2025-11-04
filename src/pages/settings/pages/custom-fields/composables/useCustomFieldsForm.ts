import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface CustomFieldForm {
  fieldName: string
  dataType: 'STRING' | 'NUMBER' | 'DATE'
}

export interface CustomFieldFormRef {
  customFields: Ref<FieldEntry<CustomFieldForm>[]>
}

export const useCustomFieldForm = () => {
  const { t } = useI18n()

  //Configurar Yup con los mensajes traducidos
  yup.setLocale({
    mixed: {
      required: () => t('settings.common.required_field'),
    }
  })

  const schema = yup.object({
    customFields: yup.array().of(
      yup.object({
        fieldName: yup.string().required().label(t('settings.custom_fields.field_label')),
        dataType: yup
          .string()
          .oneOf(['STRING', 'NUMBER', 'DATE'])
          .required()
          .label(t('settings.custom_fields.field_type')),
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
        dataType: 'STRING',
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

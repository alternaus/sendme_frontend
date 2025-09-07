import { type FieldEntry, useFieldArray, useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface UserForm {
  name: string
  email: string
}

export interface UserFormRef {
  users: Ref<FieldEntry<UserForm>[]>
}

export const useUserForm = () => {
  const { t } = useI18n()

  yup.setLocale({
    mixed: {
      required: () => t('general.required_field'),
    },
    string: {
      email: () => t('general.invalid_email')
    }
  })

  const schema = yup.object({
    users: yup.array().of(
      yup.object({
        name: yup.string().required().label(t('settings.users.name')),
        email: yup.string().email().required().label(t('settings.users.email')),
      }),
    ).max(3),
  })

  const { handleSubmit, errors, resetForm } = useForm<{
    users: UserForm[]
  }>({
    validationSchema: schema,
    initialValues: {
      users: [],
    },
  })

  const {
    fields: users,
    push: addUser,
    remove: removeUser,
  } = useFieldArray<UserForm>('users')

  const addEmptyUser = () => {
    if (users.value.length < 3) {
      addUser({
        name: '',
        email: '',
      })
    }
  }

  return {
    users,
    addUser,
    removeUser,
    addEmptyUser,
    handleSubmit,
    errors,
    resetForm,
  }
}

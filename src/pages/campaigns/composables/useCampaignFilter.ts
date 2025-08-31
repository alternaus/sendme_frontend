import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface CampaignFilterForm {
  search: string
  name: string
  status: string
  channelId: string
  dateRange: Date[]
}

export interface CampaignFilterFormRef {
  search: Ref<string>
  name: Ref<string>
  status: Ref<string>
  channelId: Ref<string>
  dateRange: Ref<Date[]>
}

export const useCampaignFilter = () => {
  const schema = yup.object<CampaignFilterForm>({
    search: yup.string(),
    name: yup.string(),
    status: yup.string(),
    channelId: yup.string(),
    dateRange: yup.array().of(yup.date()),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<CampaignFilterForm>({
    validationSchema: schema,
    initialValues: {
      search: '',
      name: '',
      status: '',
      channelId: '',
      dateRange: [],
    },
    validateOnMount: false,
  })

  const [search] = defineField('search')
  const [name] = defineField('name')
  const [status] = defineField('status')
  const [channelId] = defineField('channelId')
  const [dateRange] = defineField('dateRange')

  return {
    search,
    name,
    status,
    channelId,
    dateRange,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}

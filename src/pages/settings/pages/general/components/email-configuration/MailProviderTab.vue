<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type {
  CreateEmailConfigurationDto,
  EmailConfigurationResponseDto,
  UpdateEmailConfigurationDto
} from '@/services/email-configuration/emailConfigurationTypes'
import { useMailProviderService } from '@/services/email-configuration/useMailProviderService'

import { useMailProviderForm } from './composables/useMailProviderForm'

const toast = useToast()
const { form, handleSubmit, setValues, resetForm, errors } = useMailProviderForm()
const { getEmailConfigurations, createEmailConfiguration, updateEmailConfiguration } = useMailProviderService()

const loading = ref(false)
const saving = ref(false)
const currentId = ref<number | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getEmailConfigurations()
    const list: EmailConfigurationResponseDto[] = Array.isArray(res) ? res : []
    const item = list?.[0]
    if (item) {
      currentId.value = (item).id as number
      setValues({
        name: (item).name,
        host: (item).host,
        port: (item).port,
        secure: (item).secure,
        username: (item).username,
        password: '',
        fromEmail: (item).fromEmail,
        fromName: (item).fromName,
        isDefault: (item).isDefault,
        isActive: (item).isActive,
      })
    }
  } finally {
    loading.value = false
  }
})

const boolOpts = [{ name: 'Yes', value: true }, { name: 'No', value: false }]

const onSubmit = handleSubmit(async (values) => {
  saving.value = true
  try {
    if (currentId.value) {
      const updatePayload: UpdateEmailConfigurationDto = {
        name: values.name,
        host: values.host,
        port: values.port ?? undefined,
        secure: values.secure,
        username: values.username,
        fromEmail: values.fromEmail,
        fromName: values.fromName,
        isDefault: values.isDefault,
        isActive: values.isActive,
        ...(values.password ? { password: values.password } : {}),
      } as unknown as UpdateEmailConfigurationDto

      await updateEmailConfiguration(currentId.value, updatePayload)
      toast.add({ severity: 'success', summary: 'Saved', detail: 'Configuration updated', life: 2500 })
    } else {
      const createPayload: CreateEmailConfigurationDto = {
        name: values.name,
        host: values.host,
        port: values.port ?? 587,
        secure: values.secure,
        username: values.username,
        password: values.password,
        fromEmail: values.fromEmail,
        fromName: values.fromName,
        isDefault: values.isDefault,
        isActive: values.isActive,
      } as unknown as CreateEmailConfigurationDto

      const created = await createEmailConfiguration(createPayload)
      const createdData: EmailConfigurationResponseDto = (created)
      currentId.value = (createdData).id as number
      toast.add({ severity: 'success', summary: 'Saved', detail: 'Configuration created', life: 2500 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not save', life: 3000 })
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <AppCard class="w-full p-4">
    <template #content>
      <form @submit.prevent="onSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Datos básicos -->
        <AppInput v-model="form.name.value" :error-message="errors.name" label="Name" />
        <AppInput v-model="form.fromName.value" :error-message="errors.fromName" label="From Name" />
        <AppInput v-model="form.fromEmail.value" :error-message="errors.fromEmail" type="email" label="From Email" />
        <AppInput v-model="form.username.value" :error-message="errors.username" label="Username" />
        <AppInput v-model="form.password.value" :error-message="errors.password" type="password" label="Password" />

        <!-- SMTP -->
        <AppInput v-model="form.host.value" :error-message="errors.host" label="SMTP Host" />
        <AppInput v-model="form.port.value" :error-message="errors.port" type="number" label="Port" />
        <AppSelect v-model="form.secure.value" :options="boolOpts" optionLabel="name" optionValue="value"
          :error-message="errors.secure" label="Secure" />

        <AppSelect v-model="form.isDefault.value" :options="boolOpts" optionLabel="name" optionValue="value"
          :error-message="errors.isDefault" label="Default" />
        <AppSelect v-model="form.isActive.value" :options="boolOpts" optionLabel="name" optionValue="value"
          :error-message="errors.isActive" label="Active" />

        <div class="flex gap-3 pt-2 md:col-span-2">
          <AppButton type="submit" :disabled="saving || loading" severity="primary"
            :label="currentId ? 'Update' : 'Create'" />
          <AppButton type="button" severity="secondary" :disabled="saving" label="Reset" @click="resetForm()" />
        </div>
      </form>

    </template>
  </AppCard>
</template>

<style scoped>
:deep([data-pc-name="tablist"]) {
  margin-block-end: var(--p-content-padding, 1rem);
  border-radius: 0.75rem;
  /* rounded-lg */
}

:deep([data-pc-name="tab"]) {
  border-radius: 0.75rem;
  /* rounded-lg */
}
</style>

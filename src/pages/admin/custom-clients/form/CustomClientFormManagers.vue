<script lang="ts" setup>
import { computed } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import type { CustomClientFormData } from '@/composables/useCustomClientForm'

interface Props {
  form: Record<keyof CustomClientFormData, { value: unknown }>
  errors: Record<string, string | undefined>
}

interface Emits {
  (e: 'update:form', field: keyof CustomClientFormData, value: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const managers = computed({
  get: () => props.form.managers.value as Array<{ name: string; email: string; password: string }>,
  set: (value) => emit('update:form', 'managers', value),
})

const addManager = () => {
  managers.value = [...managers.value, { name: '', email: '', password: '' }]
}

const removeManager = (index: number) => {
  managers.value = managers.value.filter((_, i) => i !== index)
}

const updateManager = (index: number, field: 'name' | 'email' | 'password', value: string | number | null) => {
  const updated = [...managers.value]
  updated[index] = { ...updated[index], [field]: value || '' }
  managers.value = updated
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('custom_clients.form.managers.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('custom_clients.form.managers.subtitle') }}
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <div
        v-for="(manager, index) in managers"
        :key="index"
        class="flex flex-col gap-4"
      >
        <div class="flex justify-between items-center">
          <h4 class="font-medium text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.managers.manager_number', { number: index + 1 }) }}
          </h4>
          <AppButton
            v-if="managers.length > 1"
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            class="w-auto!"
            @click="removeManager(index)"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppInput
            :model-value="manager.name"
            :label="$t('custom_clients.form.managers.name')"
            :placeholder="$t('custom_clients.form.managers.name_placeholder')"
            :errorMessage="errors[`managers.${index}.name`]"
            required
            @update:model-value="(value) => updateManager(index, 'name', value)"
          />

          <AppInput
            :model-value="manager.email"
            type="email"
            :label="$t('custom_clients.form.managers.email')"
            :placeholder="$t('custom_clients.form.managers.email_placeholder')"
            :errorMessage="errors[`managers.${index}.email`]"
            required
            @update:model-value="(value) => updateManager(index, 'email', value)"
          />

          <AppInput
            :model-value="manager.password"
            type="password"
            :label="$t('custom_clients.form.managers.password')"
            :placeholder="$t('custom_clients.form.managers.password_placeholder')"
            :errorMessage="errors[`managers.${index}.password`]"
            required
            @update:model-value="(value) => updateManager(index, 'password', value)"
          />
        </div>
      </div>

      <AppButton
        :label="$t('custom_clients.form.managers.add_manager')"
        icon="pi pi-plus"
        outlined
        class="w-auto!"
        @click="addManager"
      />
    </div>
  </div>
</template>

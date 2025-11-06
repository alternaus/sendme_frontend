<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold mb-2">{{ $t('custom_clients.form.managers.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('custom_clients.form.managers.subtitle') }}</p>
    </div>

    <div v-for="(manager, index) in localManagers" :key="index" class="border rounded-lg p-4 space-y-4">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold">{{ $t('custom_clients.form.managers.manager_number', { number: index + 1 }) }}</h4>
        <AppButton v-if="localManagers.length > 1" severity="danger" outlined size="small" @click="removeManager(index)">
          {{ $t('custom_clients.form.managers.remove_manager') }}
        </AppButton>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppInput v-model="manager.name" :label="$t('custom_clients.form.managers.name')" required />
        <AppInput v-model="manager.email" :label="$t('custom_clients.form.managers.email')" type="email" required />
        <AppInput v-model="manager.password" :label="$t('custom_clients.form.managers.password')" type="password" required />
      </div>
    </div>

    <AppButton @click="addManager" outlined class="w-full">
      <i class="pi pi-plus mr-2"></i>{{ $t('custom_clients.form.managers.add_manager') }}
    </AppButton>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import type { IManagerFormData } from '@/services/organization/interfaces/create-client.interface'

const props = defineProps<{ modelValue: IManagerFormData[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: IManagerFormData[]): void }>()

const localManagers = ref<IManagerFormData[]>([{ name: '', email: '', password: '' }])

watch(() => props.modelValue, (v) => { if (v?.length) localManagers.value = [...v] }, { immediate: true, deep: true })
watch(localManagers, () => emit('update:modelValue', [...localManagers.value]), { deep: true })

const addManager = () => localManagers.value.push({ name: '', email: '', password: '' })
const removeManager = (index: number) => localManagers.value.splice(index, 1)
</script>

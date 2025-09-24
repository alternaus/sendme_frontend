<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import type { ICampaign } from '@/services/campaign/interfaces/campaign.interface'
import type { IDuplicateCampaign } from '@/services/campaign/interfaces/duplicate-campaign.interface'

interface Props {
  visible: boolean
  campaign: ICampaign | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'duplicate', data: IDuplicateCampaign): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const name = ref('')
const description = ref('')
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit('update:visible', value)
    if (!value) {
      resetForm()
    }
  }
})

const isFormValid = computed(() => {
  return name.value.trim().length > 0
})

const resetForm = () => {
  name.value = ''
  description.value = ''
  loading.value = false
}

const handleDuplicate = () => {
  if (!isFormValid.value || loading.value) return

  const duplicateData: IDuplicateCampaign = {
    name: name.value.trim()
  }

  // Solo incluir description si no está vacía
  if (description.value.trim()) {
    duplicateData.description = description.value.trim()
  }

  emit('duplicate', duplicateData)
}

const handleCancel = () => {
  dialogVisible.value = false
}

watch(() => props.visible, (newVisible) => {
  if (newVisible && props.campaign) {
    name.value = `${props.campaign.name} - ${t('campaign.actions.copy')}`
    description.value = props.campaign.description || ''
  }
})

defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  }
})
</script>

<template>
  <AppDialog
    v-model:modelValue="dialogVisible"
    modal
    :header="t('campaign.actions.duplicate_campaign')"
    :style="{ width: '500px' }"
    class="duplicate-campaign-modal"
  >
    <div class="space-y-4 my-4">
      <div>
        <AppInput
          v-model="name"
          type="text"
          :label="t('campaign.form.name')"
          :placeholder="t('campaign.form.name_placeholder')"
          :disabled="loading"
          required
        />
      </div>

      <div>
        <AppInput
          v-model="description"
          type="text"
          :label="t('campaign.form.description')"
          :placeholder="t('campaign.form.description_placeholder')"
          :disabled="loading"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <AppButton
          :label="t('common.actions.cancel')"
          severity="secondary"
          @click="handleCancel"
          :disabled="loading"
        />
        <AppButton
          :label="t('common.actions.save')"
          severity="primary"
          @click="handleDuplicate"
          :disabled="!isFormValid || loading"
          :loading="loading"
        />
      </div>
    </template>
  </AppDialog>
</template>

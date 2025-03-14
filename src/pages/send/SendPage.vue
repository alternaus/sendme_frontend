<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
    AppSelect,
  },
  setup() {
    const { t } = useI18n()
    const { push } = useRouter()
    const statusOptions = [
      { name: t('whatsapp.whatsapp'), value: 'whatsapp' },
      { name: t('general.sms'), value: 'sms' },
    ]
    return {
      push,
      // ActionTypes,
      IconTypes,
      statusOptions
    }
  },
})
</script>
<template >
  <AppHeader
    :icon="IconTypes.SEND"
    :text="$t('general.instant_message')"
    :actions="[]"
  />
  <form @submit.prevent="" class="w-full">
    <AppSelect
        :options="statusOptions"
        placeholder="Seleccione un estado"
        class="w-full mt-3"
        :label="$t('general.status')"
      >
        <!-- <template #icon><StatusIcon class="w-4 h-4 dark:fill-white" /></template> -->
      </AppSelect>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import Customcard from './components/CustomCard.vue'
import { IconTypesReports } from './components/enums/icon-types-reports.enum'
export default defineComponent({
  components: {
    AppHeader,
    Customcard,
  },
  setup() {
    // const { t } = useI18n()
    const router = useRouter()
    return {
      router,
      IconTypes,
      IconTypesReports,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.REPORTS" :text="$t('report.reports')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <Customcard :icon="IconTypesReports.MESSAGES" :text="$t('general.messages')" />
    <Customcard :icon="IconTypesReports.SENDING" :text="$t('report.sending_by_campaign')" />
    <Customcard :icon="IconTypesReports.AUDIT" :text="$t('report.audit')" />
  </div>
</template>

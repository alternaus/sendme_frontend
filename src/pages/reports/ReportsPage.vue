<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

//import { useI18n } from 'vue-i18n'
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
    //const { t } = useI18n()
    const router = useRouter()
    const navigateToAudit = () => {
      router.push({ name: 'report.audit' })
    }
    const navigateToMessages = () => {
      router.push({ name: 'report.message' })
    }
    return {
      router,
      IconTypes,
      IconTypesReports,
      navigateToAudit,
      navigateToMessages,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.REPORTS" :text="$t('report.reports')" :actions="[]" />
  <div class="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-5 p-4 w-fit mx-auto lg:mx-8">
    <Customcard
      :icon="IconTypesReports.MESSAGES"
      :text="$t('general.messages')"
      @click="navigateToMessages"
    />
    <Customcard :icon="IconTypesReports.SENDING" :text="$t('report.sending_by_campaign')" />
    <Customcard
      :icon="IconTypesReports.AUDIT"
      :text="$t('report.audit')"
      @click="navigateToAudit"
    />
  </div>
</template>

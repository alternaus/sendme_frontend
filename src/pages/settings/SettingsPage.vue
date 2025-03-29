<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

// import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import CustomCard from './components/CustomCard.vue'
import { IconTypesSettings } from './components/enums/icon-types-settings.enum'


export default defineComponent({
  components: {
    AppHeader,
    CustomCard,
  },
  setup() {
    // const { t } = useI18n()
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
      IconTypesSettings,
      navigateToAudit,
      navigateToMessages,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('general.settings')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <CustomCard :icon="IconTypesSettings.CUSTOM_FIELDS" :text="$t('general.personalized_information')"
      @click="navigateToMessages" />
    <CustomCard :icon="IconTypesSettings.USERS" :text="$t('user.users')" />
    <CustomCard :icon="IconTypesSettings.INTEGRATIONS" :text="$t('general.integrations')" @click="navigateToAudit" />
  </div>
</template>

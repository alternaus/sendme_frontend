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
    const navigateToCustomFields = () => {
      router.push({ name: 'settings.custom-fields' })
    }
    const navigateToUsers = () => {
      router.push({ name: 'settings.users' })
    }
    const navigateToIntegrations = () => {
      router.push({ name: 'settings.integrations' })
    }
    return {
      router,
      IconTypes,
      IconTypesSettings,
      navigateToCustomFields,
      navigateToUsers,
      navigateToIntegrations
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('general.settings')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <CustomCard :icon="IconTypesSettings.CUSTOM_FIELDS" :text="$t('general.personalized_information')"
      @click="navigateToCustomFields" />
    <CustomCard :icon="IconTypesSettings.USERS" @click="navigateToUsers" :text="$t('user.users')" />
    <CustomCard :icon="IconTypesSettings.INTEGRATIONS" :text="$t('general.integrations')"
      @click="navigateToIntegrations" />
  </div>
</template>

<script setup lang="ts">
import AppLinkCard from '@/components/atoms/cards/AppLinkCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import { IconTypesSettings } from './components/enums/icon-types-settings.enum'
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('settings.title')" :actions="[]" />

  <div class="flex flex-wrap justify-center lg:justify-start gap-6 p-6 w-fit mx-auto lg:mx-8">
    <AppLinkCard
      :icon="IconTypesSettings.CUSTOM_FIELDS"
      :text="$t('settings.personalized_information')"
      :to="{ name: 'settings.custom-fields' }"
    />

    <AppLinkCard
      :icon="IconTypesSettings.USERS"
      :text="$t('settings.users.users')"
      :to="{ name: 'settings.users' }"
    />

    <AppLinkCard
      :icon="IconTypesSettings.INTEGRATIONS"
      :text="$t('settings.general_settings')"
      :to="{ name: 'settings.general' }"
    />
  </div>
</template>

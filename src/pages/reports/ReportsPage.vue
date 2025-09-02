<script setup lang="ts">
import AppLinkCard from '@/components/atoms/cards/AppLinkCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import { IconTypesReports } from './components/enums/icon-types-reports.enum'
</script>

<template>
  <AppHeader :icon="IconTypes.REPORTS" :text="$t('report.reports')" :actions="[]" />

  <div class="flex flex-wrap justify-center lg:justify-start gap-6 p-6 w-fit mx-auto lg:mx-8">
    <AppLinkCard
      :icon="IconTypesReports.MESSAGES"
      :text="$t('general.messages')"
      :to="{ name: 'report.message' }"
    />

    <AppLinkCard
      :icon="IconTypesReports.SENDING"
      :text="$t('report.sending_by_campaign')"
      :to="{ name: 'report.dispatches' }"
    />

    <AppLinkCard
      :icon="IconTypesReports.AUDIT"
      :text="$t('report.audit')"
      :to="{ name: 'report.audit' }"
    />
  </div>


</template>

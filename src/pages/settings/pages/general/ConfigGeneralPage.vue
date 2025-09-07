<script setup lang="ts">
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import ApiKeyTab from './components/api-keys/ApiKeyTab.vue'
import MailProviderTab from './components/email-configuration/MailProviderTab.vue'
import SettingTab from './components/organization-configuration/SettingTab.vue'
import WebhookTab from './components/webhooks/WebhookTab.vue'
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('settings.title')" :actions="[]" />

  <Tabs value="0" class="rounded-xl overflow-hidden mt-4">
    <TabList class="rounded-t-lg text-sm">
      <Tab value="0" class="px-3 py-2">
        <span class="font-bold whitespace-nowrap">{{ $t('settings.email_configuration.tab_header') }}</span>
      </Tab>
      <Tab value="1" class="px-3 py-2">
        <span class="font-bold whitespace-nowrap">{{ $t('settings.organization.tab_header') }}</span>
      </Tab>
      <Tab value="2" class="px-3 py-2">
        <span class="font-bold whitespace-nowrap">{{ $t('settings.api_keys.tab_header') }}</span>
      </Tab>
      <Tab value="3" class="px-3 py-2">
        <span class="font-bold whitespace-nowrap">{{ $t('settings.webhooks.tab_header') }}</span>
      </Tab>
    </TabList>

    <TabPanels class="rounded-b-lg">
      <TabPanel value="0" as="p" class="m-0">
        <MailProviderTab />
      </TabPanel>
      <TabPanel value="1" as="p" class="m-0">
        <SettingTab />
      </TabPanel>
      <TabPanel value="2" as="p" class="m-0">
        <ApiKeyTab />
      </TabPanel>
      <TabPanel value="3" as="p" class="m-0">
        <WebhookTab />
      </TabPanel>
    </TabPanels>
  </Tabs>

</template>

<style lang="scss" scoped>
:deep([data-pc-name="tablist"]) {
  border-bottom: 0;
  gap: .5rem;
}

:deep([data-pc-name="tablist"] [data-pc-section="inkbar"]) {
  display: none;
}

/* Píldoras tipo botón (tokens del tema) */
:deep([role="tab"]) {
  background: var(--p-content-background);
  color: var(--p-text-color);
  border-radius: 0.5rem;
  margin: 0.5rem 0.75rem;
  padding: .5rem .75rem;
  line-height: 1;
  transition: background-color .15s, color .15s, border-color .15s, box-shadow .15s;
}

:deep([role="tab"][aria-selected="true"]) {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-color: var(--p-primary-color);
}

:deep([data-pc-name="tabpanels"]) {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius);
  padding: var(--p-content-padding, 1rem);
}
</style>

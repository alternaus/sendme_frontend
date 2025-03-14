<template>
  <div class="card flex justify-center">
    <Breadcrumb :home="home" :model="breadcrumbItems">
      <template #item="{ item, props }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a :href="href" v-bind="props.action" @click="navigate">
            <span v-if="item.icon" :class="[item.icon, 'text-color']" />
            <span class="text-primary font-semibold">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else-if="item.url" :href="item.url" :target="item.target" v-bind="props.action">
          <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
        </a>
      </template>
    </Breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Breadcrumb from 'primevue/breadcrumb';

import { useI18n } from 'vue-i18n';

import { useBreadcrumbStore } from '@/stores/breadcrumbStore';

const { t } = useI18n();
const store = useBreadcrumbStore();

const home = {
  icon: 'pi pi-home',
  route: '/'
};

const breadcrumbItems = computed(() =>
  store.breadcrumbs.map(item => ({
    label: t(item.text), 
    route: item.to, 
    url: item.url,
    icon: item.icon
  }))
);
</script>

<style scoped>
:deep(.p-breadcrumb) {
  font-size: 13px;
  background: none;
  padding: 0 15px;
}

</style>

<template>
  <div class="card flex justify-center">
    <Breadcrumb :home="home" :model="breadcrumbItems">
      <template #item="{ item, props }">
        <router-link
          v-if="item.to"
          v-slot="{ href, navigate }"
          :to="item.to"
          custom
        >
          <a :href="href" v-bind="props.action" @click="navigate">
            <span :class="[item.icon, 'text-color']" />
            <span
              :class="[
                item.icon,
                'text-color',
                { 'text-primary': isLastItem(item) }
              ]"
            >
              {{ item.label }}
            </span>
          </a>
        </router-link>
        <a v-else-if="item.url" :href="item.url" :target="item.target">
          <span
            :class="['font-semibold', { 'text-primary': isLastItem(item) }]"
          >
            {{ item.label }}
          </span>
        </a>
        <span v-else>
          <span
            :class="['font-semibold', { 'text-primary': isLastItem(item) }]"
          >
            {{ item.label }}
          </span>
        </span>
      </template>
    </Breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import Breadcrumb from 'primevue/breadcrumb'

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

const store = useBreadcrumbStore()

const home = {
  icon: 'pi pi-home',
}

const breadcrumbItems = computed(() => store.breadcrumbs)

const isLastItem = (item: any) => {
  return store.breadcrumbs.indexOf(item) === store.breadcrumbs.length - 1
}
</script>

<style scoped>
:deep(.p-breadcrumb) {
  font-size: 13px;
  background: none;
  padding: 0 15px;
}
.text-primary {
  font-weight: bold;
}
</style>

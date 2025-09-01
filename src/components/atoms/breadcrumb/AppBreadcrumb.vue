<script setup lang="ts">
import { computed } from 'vue'

import Breadcrumb from 'primevue/breadcrumb'

import { useI18n } from 'vue-i18n'

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

type BreadcrumbStoreItem = {
  text: string
  to?: { name: string; params?: Record<string, string | number> } | null
  url?: string
  active?: boolean
  icon?: string
}

interface Props {
  homeConfig?: {
    icon?: string
    route?: string
    label?: string
  }
  containerClass?: string
  activeItemClass?: string
  inactiveItemClass?: string
  externalLinkConfig?: {
    openInNewTab?: boolean
    target?: string
  }
  pt?: object
  ptOptions?: object
}
const props = withDefaults(defineProps<Props>(), {
  homeConfig: () => ({
    icon: 'pi pi-home',
    route: '/',
    label: ''
  }),
  containerClass: 'card flex justify-center',
  activeItemClass: 'text-primary font-semibold',
  inactiveItemClass: 'text-surface-700 dark:text-surface-0',
  externalLinkConfig: () => ({
    openInNewTab: false,
    target: '_blank'
  })
})

defineOptions({
  inheritAttrs: false
})

const { t } = useI18n()
const store = useBreadcrumbStore()

const home = computed(() => ({
  icon: props.homeConfig.icon,
  route: props.homeConfig.route,
  label: props.homeConfig.label ? t(props.homeConfig.label) : ''
}))

const breadcrumbItems = computed(() =>
  store.breadcrumbs.map(item => ({
    label: t(item.text),
    route: item.to,
    url: item.url,
    icon: item.icon,
    target: getTargetForItem(item)
  }))
)

const getTargetForItem = (item: BreadcrumbStoreItem): string | undefined => {
  if (!item.url) return undefined

  if (!props.externalLinkConfig.openInNewTab) return undefined

  if (isExternalUrl(item.url)) {
    return props.externalLinkConfig.target
  }

  return undefined
}

const isExternalUrl = (url: string): boolean => {
  if (!url) return false

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url)
      const currentDomain = window.location.hostname
      return urlObj.hostname !== currentDomain
    } catch {
      return true
    }
  }

  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return false
  }

  return true
}
</script>

<template>
  <div :class="containerClass">
    <Breadcrumb
      v-bind="{
        home,
        model: breadcrumbItems,
        pt,
        ptOptions,
        ...$attrs
      }"
    >
      <template #item="{ item, props: itemProps }">
        <router-link
          v-if="item.route"
          v-slot="{ href, navigate }"
          :to="item.route"
          custom
        >
          <a
            :href="href"
            v-bind="itemProps.action"
            @click="navigate"
          >
            <span
              v-if="item.icon"
              :class="[item.icon, 'text-color']"
            />
            <span :class="activeItemClass">
              {{ item.label }}
            </span>
          </a>
        </router-link>

        <a
          v-else-if="item.url"
          :href="item.url"
          :target="item.target"
          v-bind="itemProps.action"
        >
          <span :class="inactiveItemClass">
            {{ item.label }}
          </span>
        </a>

        <span
          v-else
          :class="inactiveItemClass"
        >
          {{ item.label }}
        </span>
      </template>
    </Breadcrumb>
  </div>
</template>

<style scoped>
:deep(.p-breadcrumb) {
  font-size: 0.8125rem;
  background: none;
  padding: 0 0.9375rem;
}

</style>

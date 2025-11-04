<script setup lang="ts">
import Card from 'primevue/card'

interface Props {
  cardClass?: string
  title?: string
  subtitle?: string
  content?: string
  footer?: string
  headerImage?: string
  headerImageAlt?: string
  pt?: object
  ptOptions?: object
}

withDefaults(defineProps<Props>(), {
  cardClass: '!shadow-md !w-auto',
  pt: () => ({
    body: {
      style: 'padding: 0.5rem;'
    }
  })
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <Card
    v-bind="{
      ptOptions,
      ...$attrs
    }"
    :class="cardClass"
    :pt="{
      body: {
        style: 'padding: 0.8rem !important;'
      },
      ...pt
    }"
  >
    <template v-if="$slots.header || headerImage" #header>
      <slot name="header">
        <img
          v-if="headerImage"
          :src="headerImage"
          :alt="headerImageAlt || ''"
        />
      </slot>
    </template>

    <template v-if="$slots.title || title" #title>
      <slot name="title">
        {{ title }}
      </slot>
    </template>

    <template v-if="$slots.subtitle || subtitle" #subtitle>
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </template>

    <template v-if="$slots.content || $slots.default || content" #content>
      <slot name="content">
        <slot>
          {{ content }}
        </slot>
      </slot>
    </template>

    <template v-if="$slots.footer || footer" #footer>
      <slot name="footer">
        {{ footer }}
      </slot>
    </template>
  </Card>
</template>

<style lang="scss">
</style>

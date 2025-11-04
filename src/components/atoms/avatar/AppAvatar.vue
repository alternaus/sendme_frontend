<script setup lang="ts">
import Avatar from 'primevue/avatar'

interface Props {
  image?: string
  imageAlt?: string
  shape?: 'circle' | 'square'
  size?: 'normal' | 'large' | 'xlarge'|'small'
  label?: string
  icon?: string
  pt?: object
  ptOptions?: object
}

withDefaults(defineProps<Props>(), {
  shape: 'circle',
  size: 'large'
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <Avatar
    v-bind="{
      image,
      imageAlt,
      shape,
      size,
      label,
      icon,
      pt,
      ptOptions,
      ...$attrs
    }"
  />
</template>

<style lang="scss"></style>

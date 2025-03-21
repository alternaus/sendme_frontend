<script lang="ts">
import { defineComponent } from 'vue'

import Card from 'primevue/card'

export default defineComponent({
  name: 'AppCard',
  components: {
    Card,
  },
  setup() {
    return {}
  },
})
</script>

<template>
  <Card class="!shadow-xl !w-auto">
    <template #title>
      <slot name="title"></slot>
    </template>
    <template #content>
      <slot name="content"></slot>
    </template>
  </Card>
</template>

<style lang="scss"></style>

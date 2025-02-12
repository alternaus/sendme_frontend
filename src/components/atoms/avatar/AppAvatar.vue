<script lang="ts">
import { defineComponent } from 'vue'

import Avatar from 'primevue/avatar'

export default defineComponent({
  name: 'AppAvatar',
  components: {
    Avatar,
  },
  props: {
    shape: {
      type: String as () => 'circle' | 'square',
      default: 'circle',
    },
    label: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return { ...props }
  },
})
</script>

<template>
  <avatar class="!w-14 !h-14" :shape="shape" :label="label" />
</template>

<style lang="scss"></style>

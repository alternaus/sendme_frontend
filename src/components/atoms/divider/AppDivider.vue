<script lang="ts">
import Divider from 'primevue/divider'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppDivider',
  components: {
    Divider,
  },
  setup() {
    return {}
  },
})
</script>

<template>
  <divider align="center" class="!m-0"> <small>O</small> </divider>
</template>

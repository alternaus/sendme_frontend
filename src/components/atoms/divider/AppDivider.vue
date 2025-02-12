<script lang="ts">
import { defineComponent } from 'vue'

import Divider from 'primevue/divider'

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

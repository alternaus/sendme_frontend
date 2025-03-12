<script lang="ts">
import { defineComponent } from 'vue';

import PrimeTag from 'primevue/tag';

export default defineComponent({
  name: 'AppTag',
  props: {
    label: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      default: 'primary', 
    },
    rounded: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    PrimeTag,
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <PrimeTag 
    :value="label" 
    :severity="severity" 
    :rounded="rounded" 
    class="!text-xs !px-3 !py-1" 
  />
</template>

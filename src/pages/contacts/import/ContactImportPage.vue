<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.CONTACTS" :actions="[]" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
  },
  setup() {
    return {
      IconTypes,
    }
  },
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
  },
  setup() {
    // const { t } = useI18n()
    const { push } = useRouter()
    return {
      push,
      // ActionTypes,
      IconTypes,
    }
  },
})
</script>
<template >
  <AppHeader
    :icon="IconTypes.SETTINGS"
    :text="$t('general.settings')"
    :actions="[]"
  />
</template>

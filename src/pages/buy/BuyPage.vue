<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
export default defineComponent({
  components: {
    AppHeader,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()

    return {
      router,
      IconTypes,
      t,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy_messages')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <div class="flex flex-col items-center">
      {{ $t('general.choose_value_recharge') }}
      <small>
        {{ $t('general.info_remember_recharge') }}
      </small>
    </div>
  </div>
</template>

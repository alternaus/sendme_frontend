<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
    AppCard
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    
    return {
      router,
      IconTypes,
      t
    }
  },
})
</script>
<template >
  <AppHeader   :actions="[]" />
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <AppCard class="w-full mt-4">
    <template #content>
      <div class="flex flex-col">
        <small class="txt-center">Hola </small>
        <small>Hola </small>
      </div>
    </template>
  </AppCard>
  <AppCard class="w-full mt-4">
    <template #content>
      Hola
    </template>
  </AppCard>
</div>

</template>
<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.IMPORT" :actions="[]" />

  <AppCard>
    <template #content>
      <UploadFile />
    </template>
  </AppCard>


</template>

<script lang="ts">
import { defineComponent } from 'vue'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import UploadFile from '../components/UploadFile.vue'


export default defineComponent({
  components: {
    AppHeader,
    AppCard,
    UploadFile
  },
  setup() {

    return {
      IconTypes,
    }
  },
})
</script>

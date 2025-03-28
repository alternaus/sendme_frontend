<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.IMPORT" :actions="[]" />

  <AppCard>
    <template #content>
      <div class="w-full flex justify-center">
        <div class="max-w-auto w-full text-center">
          <p class="text-xl font-bold my-2">{{ $t('contact.import.notice.title') }}</p>
          <ul class="list-inside list-disc text-sm text-left mx-auto w-fit">
            <li>{{ $t('contact.import.notice.first_row') }}</li>
            <li>{{ $t('contact.import.notice.phone_required') }}</li>
            <li>{{ $t('contact.import.notice.supported_formats') }}</li>
            <li>{{ $t('contact.import.notice.final_message') }}</li>
          </ul>
        </div>
      </div>
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

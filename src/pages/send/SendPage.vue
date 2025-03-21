<script lang="ts">
import {  defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import SendIcon from '@/assets/svg/send.svg?component'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import SendSmsFormPage from './form/SendSmsFormPage.vue'
import SendWhatsappFormPage from './form/SendWhatsappFormPage.vue'
export default defineComponent({
  components: {
    AppHeader,
    AppSelect,
    SendIcon,
    SendSmsFormPage,
    SendWhatsappFormPage,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const sendOptions = [
      { name: t('whatsapp.whatsapp'), value: 'whatsapp' },
      { name: t('general.sms'), value: 'sms' },
    ]

    const selectedOption = ref('sms')
    return {
      router,
      IconTypes,
      sendOptions,
      selectedOption,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.SEND" :actions="[]" />
  <div class="container-phone py-6 p-4">
    <div class="flex justify-center items-center text-center mb-4">

      <small class="text-lg font-semibold">{{ $t('general.instant_message') }}</small>
    </div>
    <AppSelect v-model="selectedOption" :options="sendOptions" class="w-full mb-4">
      <template #icon><SendIcon class="w-4 h-4" /></template>
    </AppSelect>

    <div v-if="selectedOption === 'sms'">
      <SendSmsFormPage />
    </div>
    <div v-else>
      <SendWhatsappFormPage />
    </div>
  </div>
</template>
<style scoped lang="scss">
.container-phone {
  width: 80vw;
  max-width: 340px;
  height: 70vh;
  border-radius: 50px;
  background: #f6f6f6;
  border: 6px solid #333;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
</style>

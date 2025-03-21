<script lang="ts">
import { defineComponent, ref } from 'vue'
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
  <AppHeader :icon="IconTypes.SEND" :text="$t('general.send_instant_message')" :actions="[]" />
  <div class="container-phone ml-4">
    <div class="container-phone-inner">
      <div class="flex justify-center items-center text-center mb-4">
        <small class="text-base font-semibold">{{
          selectedOption === 'sms'
            ? $t('general.instant_message')
            : $t('general.whatsapp_instant_message')
        }}</small>
      </div>
      <AppSelect v-model="selectedOption" :options="sendOptions" class="w-full mb-4">
        <template #icon><SendIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppSelect>

      <div v-if="selectedOption === 'sms'">
        <SendSmsFormPage />
      </div>
      <div v-else>
        <SendWhatsappFormPage />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.container-phone {
  width: 80vw;
  max-width: 340px;
  height: 75vh;
  border-radius: 50px;
  background: #f6f6f6;
  border: 6px solid #333;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;
  .dark & {
    background: #1e1e1e; /* Fondo oscuro */
    border-color: #555;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
  }
}

.container-phone-inner {
  flex: 1; /* Hace que este contenedor tome el espacio disponible dentro de container-phone */
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(75vh - 50px); /* Ajusta según la altura total menos espacio para encabezado */

  /* ✅ Personalizar la barra de scroll */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #aaa transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #aaa;
    border-radius: 10px;
  }
}
</style>

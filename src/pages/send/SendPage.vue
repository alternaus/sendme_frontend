<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import EmailIcon from '@/assets/svg/email.svg?component'
import SendIcon from '@/assets/svg/send.svg?component'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import SendEmailFormPage from './form/SendEmailFormPage.vue'
import SendSmsFormPage from './form/SendSmsFormPage.vue'
import SendWhatsappFormPage from './form/SendWhatsappFormPage.vue'
export default defineComponent({
  components: {
    AppHeader,
    AppSelect,
    SendIcon,
    EmailIcon,
    SendSmsFormPage,
    SendWhatsappFormPage,
    SendEmailFormPage,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const sendOptions = [
      { name: t('send.channels.WHATSAPP'), value: 'WHATSAPP' },
      { name: t('send.channels.SMS'), value: 'SMS' },
      { name: t('send.channels.EMAIL'), value: 'EMAIL' },
    ]

    const selectedOption = ref('SMS')
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
  <AppHeader :icon="IconTypes.SEND" :text="$t('send.send_instant_message')" :actions="[]" />

  <!-- Diseño de teléfono para SMS y WhatsApp -->
  <div v-if="selectedOption !== 'EMAIL'" class="container-phone ml-4">
    <div class="container-phone-inner">
      <div class="flex justify-center items-center text-center mb-4">
        <small class="text-base font-semibold">{{
          selectedOption === 'SMS'
            ? $t('send.instant_message')
            : $t('send.whatsapp_instant_message')
        }}</small>
      </div>
      <AppSelect v-model="selectedOption" :options="sendOptions" class="w-full mb-4">
        <template #icon><SendIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppSelect>

      <div v-if="selectedOption === 'SMS'">
        <SendSmsFormPage />
      </div>
      <div v-else-if="selectedOption === 'WHATSAPP'">
        <SendWhatsappFormPage />
      </div>
    </div>
  </div>

  <!-- Diseño de escritorio para Email -->
  <div v-else class="container-email ml-4">
    <div class="container-email-inner">
      <div class="flex justify-center items-center text-center mb-4">
        <EmailIcon class="w-6 h-6 mr-2 dark:fill-white" />
        <small class="text-base font-semibold">{{ $t('send.email_instant_message') }}</small>
      </div>
      <AppSelect v-model="selectedOption" :options="sendOptions" class="w-full mb-4">
        <template #icon><SendIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppSelect>

      <SendEmailFormPage />
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
    background: #1e1e1e;
    border-color: #555;
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
  }
}

.container-phone-inner {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(75vh - 50px);

  scrollbar-width: thin;
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

.container-email {
  width: 90vw;
  max-width: 600px;
  height: 75vh;
  border-radius: 20px;
  background: #f6f6f6;
  border: 3px solid #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  .dark & {
    background: #1e1e1e;
    border-color: #555;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
}

.container-email-inner {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(75vh - 60px);

  scrollbar-width: thin;
  scrollbar-color: #aaa transparent;

  &::-webkit-scrollbar {
    width: 8px;
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

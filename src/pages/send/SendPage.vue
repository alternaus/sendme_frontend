<script lang="ts">
import { computed,defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import EmailIcon from '@/assets/svg/email.svg?component'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { MessageChannel } from '@/services/send/constants'

import SendEmailFormPage from './form/SendEmailFormPage.vue'
import SendSmsFormPage from './form/SendSmsFormPage.vue'
export default defineComponent({
  emits: ['sent'],
  components: {
    AppHeader,
    AppSelectButton,
    EmailIcon,
    SendSmsFormPage,
    SendEmailFormPage,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const sendOptions = [
      { name: t('send.channels.SMS'), value: MessageChannel.SMS },
      { name: t('send.channels.EMAIL'), value: MessageChannel.EMAIL },
    ]

    const selectedOption = ref<MessageChannel | string | null>(MessageChannel.SMS)

    // Computed para manejar la conversión entre null y el AppSelectButton
    const selectButtonValue = computed({
      get: () => selectedOption.value || '',
      set: (value: string | number | boolean | string[]) => {
        selectedOption.value = (value === '' || value === null) ? null : value as MessageChannel
      }
    })

    return {
      router,
      IconTypes,
      sendOptions,
      selectedOption,
      selectButtonValue,
      MessageChannel,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.SEND" :text="$t('send.send_instant_message')" :actions="[]" />

  <div class="flex flex-col items-center justify-start min-h-0 px-4">
    <div class="w-full max-w-md mb-1">
      <AppSelectButton
        v-model="selectButtonValue"
        :options="sendOptions"
        class="w-full"
        :allowEmpty="true"
      />
    </div>

    <div v-if="selectedOption === MessageChannel.SMS" class="container-phone">
      <div class="container-phone-inner">
        <div class="flex justify-center items-center text-center mb-2">
          <small class="text-base font-semibold">{{ $t('send.instant_message') }}</small>
        </div>
        <SendSmsFormPage />
      </div>
    </div>

    <div v-else-if="selectedOption === MessageChannel.EMAIL" class="container-email">
      <div class="container-email-inner">
        <div class="flex justify-center items-center text-center mb-2">
          <EmailIcon class="w-6 h-6 mr-2 dark:fill-white" />
          <small class="text-base font-semibold">{{ $t('send.email_instant_message') }}</small>
        </div>
        <SendEmailFormPage />
      </div>
    </div>
  </div>

</template>
<style scoped lang="scss">
.container-phone {
  width: min(95%, 500px);
  max-width: 500px;
  height: min(calc(85vh - 150px), 800px);
  max-height: 800px;
  border-radius: 35px;
  background: #f6f6f6;
  border: 6px solid #333;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin: 0 auto;
  transition: all 0.3s ease;

  @media (max-height: 700px) {
    height: calc(85vh - 120px);
    max-height: none;
  }

  @media (max-height: 600px) {
    height: calc(85vh - 100px);
    max-height: none;
  }

  @media (max-width: 600px) {
    width: 95%;
    max-width: 450px;
    border-radius: 25px;
    border-width: 4px;
    padding: 15px;
    height: min(calc(85vh - 160px), 700px);
  }

  @media (max-width: 400px) {
    width: 98%;
    max-width: 350px;
    border-radius: 20px;
    padding: 12px;
    height: calc(85vh - 140px);
  }

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
  max-height: calc(min(calc(85vh - 100px), 800px) - 60px);
  scrollbar-width: thin;
  scrollbar-color: #aaa transparent;

  @media (max-height: 700px) {
    max-height: calc(85vh - 180px);
  }

  @media (max-height: 600px) {
    max-height: calc(85vh - 160px);
  }

  @media (max-width: 600px) {
    max-height: calc(min(calc(85vh - 220px), 700px) - 50px);
  }

  @media (max-width: 400px) {
    max-height: calc(85vh - 200px);
  }

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
  width: min(98%, 1200px);
  max-width: 1200px;
  height: min(calc(85vh - 120px), 750px);
  max-height: 750px;
  border-radius: 15px;
  background: #f6f6f6;
  border: 3px solid #333;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 25px;
  margin: 0 auto;
  transition: all 0.3s ease;

  @media (max-height: 700px) {
    height: calc(85vh - 140px);
    max-height: none;
  }

  @media (max-height: 600px) {
    height: calc(85vh - 120px);
    max-height: none;
  }

  @media (max-width: 1024px) {
    width: min(96%, 900px);
    max-width: 900px;
    padding: 20px;
    height: min(calc(85vh - 130px), 700px);
    max-height: 700px;
  }

  @media (max-width: 768px) {
    width: 98%;
    max-width: 700px;
    padding: 18px;
    border-radius: 12px;
    height: min(calc(85vh - 140px), 650px);
    max-height: 650px;
  }

  @media (max-width: 640px) {
    width: min(98%, calc(100vw - 16px));
    max-width: none;
    border-radius: 8px;
    margin: 8px;
    padding: 16px;
    height: calc(85vh - 150px);
    max-height: none;
  }

  @media (max-width: 480px) {
    width: min(96%, calc(100vw - 24px));
    margin: 12px;
    padding: 12px;
    height: calc(85vh - 130px);
    border-radius: 6px;
  }

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
  max-height: calc(min(calc(85vh - 180px), 750px) - 80px);
  scrollbar-width: thin;
  scrollbar-color: #aaa transparent;

  @media (max-height: 700px) {
    max-height: calc(85vh - 220px);
  }

  @media (max-height: 600px) {
    max-height: calc(85vh - 200px);
  }

  @media (max-width: 1024px) {
    max-height: calc(min(calc(85vh - 190px), 700px) - 70px);
  }

  @media (max-width: 768px) {
    max-height: calc(min(calc(85vh - 200px), 650px) - 65px);
  }

  @media (max-width: 640px) {
    max-height: calc(85vh - 215px);
  }

  @media (max-width: 480px) {
    max-height: calc(85vh - 190px);
  }

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

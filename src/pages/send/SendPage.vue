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

    const selectedOption = ref<MessageChannel | string | null>(null)

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

  <div class="ml-4">
    <!-- Selector principal de canal -->
    <div class="max-w-md mb-6">
      <AppSelectButton
        v-model="selectButtonValue"
        :options="sendOptions"
        class="w-full"
        :allowEmpty="true"
      />
    </div>

    <!-- Diseño de teléfono solo para SMS -->
    <div v-if="selectedOption === MessageChannel.SMS" class="container-phone" :title="$t('send.tooltip_phone_mode')">
      <div class="container-phone-inner">
        <div class="flex justify-center items-center text-center mb-4">
          <small class="text-base font-semibold">{{ $t('send.instant_message') }}</small>
        </div>
        <SendSmsFormPage />
      </div>
    </div>

    <!-- Diseño de escritorio para Email -->
    <div v-else-if="selectedOption === MessageChannel.EMAIL" class="container-email" :title="$t('send.tooltip_email_mode')">
      <div class="container-email-inner">
        <div class="flex justify-center items-center text-center mb-4">
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

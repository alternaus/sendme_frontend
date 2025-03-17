<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useSendService } from '@/services/send/useSendService' // Servicio para enviar el mensaje
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppHeader,
    AppSelect,
    AppInput,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const sendService = useSendService()
    const authStore = useAuthStore()
    const statusOptions = [
      { name: t('whatsapp.whatsapp'), value: 'whatsapp' },
      { name: t('general.sms'), value: 'sms' },
    ]

    const selectedStatus = ref('sms')
    const message = ref('')
    const phoneNumbers = ref('')
    const sendToAllContacts = ref(false)
    const maxCharacters = 160

    // Contador de caracteres restantes
    const remainingCharacters = computed(() => maxCharacters - message.value.length)

    // Función para enviar el mensaje
    const sendMessage = async () => {
      if (!message.value.trim()) {
        alert(t('general.message_required'))
        return
      }

      if (
        selectedStatus.value === 'sms' &&
        !sendToAllContacts.value &&
        !phoneNumbers.value.trim()
      ) {
        alert(t('general.numbers_required'))
        return
      }

      const contacts = sendToAllContacts.value
        ? ['all']
        : phoneNumbers.value.split(',').map((num) => num.trim())

      const payload = {
        contacts,
        message: message.value,
        country: 'CO',
      }

      const response = await sendService.sendMessageSms(payload)

      if (response) {
        alert(t('general.message_sent'))
      } else {
        alert(t('general.message_error'))
      }
    }

    return {
      router,
      IconTypes,
      statusOptions,
      selectedStatus,
      message,
      phoneNumbers,
      sendToAllContacts,
      remainingCharacters,
      sendMessage,
      authStore,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.SEND" :text="$t('general.instant_message')" :actions="[]" />
  <form @submit.prevent="sendMessage" class="w-full p-4">
    <div class="container-phone py-6 p-4">
      <AppSelect v-model="selectedStatus" :options="statusOptions" class="w-full mb-4" />

      <!-- Opciones solo si es SMS -->
      <div v-if="selectedStatus === 'sms'">
        <div class="flex items-center mb-2">
          <input type="checkbox" v-model="sendToAllContacts" class="mr-2" />
          <label>{{ $t('general.send_all_contacts') }}</label>
        </div>

        <AppInput
          v-if="!sendToAllContacts"
          v-model="phoneNumbers"
          :placeholder="$t('general.enter_numbers')"
          class="w-full mb-4"
        />
      </div>

      <!-- Campo de mensaje -->
      <div class="relative">
        <AppInput
          v-model="message"
          type="textarea"
          :placeholder="$t('general.write_message')"
          class="w-full mb-2"
        />
        <p class="text-right text-sm text-gray-500">{{ remainingCharacters }} caracteres</p>
      </div>

      <!-- Botón de enviar -->
      <button type="submit" class="w-full bg-yellow-500 text-white py-2 rounded mt-4">
        {{ $t('general.send') }}
      </button>
    </div>
  </form>
</template>
<style scoped lang="scss">
.container-phone {
  width: 80vw;
  max-width: 340px;
  height: 70vh;
  border-radius: 50px;
  background: #F6F6F6;
  border: 6px solid #333;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  position: relative;
}
</style>

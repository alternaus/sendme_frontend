<script lang="ts">
import { defineComponent, ref } from 'vue'

// import { useToast } from 'primevue/usetoast'
// import { useI18n } from 'vue-i18n'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
// import SmsIcon from '@/assets/svg/sms.svg?component'
// import BtnSend from '@/assets/svg/btn_send.svg?component'
// import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'

export default defineComponent({
  name: 'SendWhatsappFormPage',
  components: {
    PhoneIcon, 
    // AppTextarea,
    // SmsIcon,
    // BtnSend,
    ContactsIcon,
  },
  setup() {
    // const { t } = useI18n()
    // const toast = useToast()
    const sendToAllContacts = ref(false)
    return {
      sendToAllContacts,
    }
  }
})
</script>
<template >
  <div>
    <div class="flex justify-center items-center flex-wrap my-2 mb-4">
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="!sendToAllContacts ? 'bg-white border rounded-lg border-slate-300' : ''"
        @click="sendToAllContacts = false"
      >
        <PhoneIcon class="w-6 h-6" />
      </div>
      <div
        class="p-2 mx-2 cursor-pointer"
        :class="sendToAllContacts ? 'bg-white border rounded-lg border-slate-300' : ''"
        @click="sendToAllContacts = true"
      >
        <ContactsIcon class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>
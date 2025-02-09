<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="flex-col items-center justify-center col-span-1 hidden lg:flex">
          <p
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 text-lg font-bold"
          >
            3
          </p>
          <p class="text-center mt-2 font-medium">Mensaje</p>
        </div>

        <div class="col-span-11 grid grid-cols-8 gap-4 items-center justify-center text-center">
          <div class="flex flex-col items-center justify-center gap-1 col-span-12 lg:col-span-1">
            <SmsIcon class="w-12 h-12 dark:fill-white" />
            <span class="text-gray-700 dark:text-neutral-300 font-medium">SMS</span>
          </div>

          <div class="flex items-center justify-center col-span-12 lg:col-span-5">
            <AppEditor
              :modelValue="form.content.value"
              :errorMessage="errors.content"
              @update:modelValue="updateContent"
            />
          </div>
          <div class="flex flex-col items-center justify-center gap-2 col-span-12 lg:col-span-2">
            <p class="text-gray-700 dark:text-neutral-300 font-medium">Dato dinámico</p>
            <AppSelect :options="[]" type="text" class="w-full text-center" />
            <AppButton label="Insertar en el mensaje" />
          </div>
        </div>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import SmsIcon from '@/assets/svg/sms.svg?component'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import type { CampaignFormRef } from '../composables/useCampaignForm'
import { error } from 'console'

export default defineComponent({
  components: {
    AppCard,
    AppEditor,
    SmsIcon,
    AppSelect,
    AppButton,
  },
  props: {
    form: {
      type: Object as PropType<CampaignFormRef>,
      default: () => ({ content: { value: '' } }),
    },
    errors: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
  },
  methods: {
    updateContent(value: string) {
      this.$emit('update:form', { ...this.form, content: { value } })
    },
  },
})
</script>

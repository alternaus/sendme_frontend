<script lang="ts">
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDivider from '@/components/atoms/divider/AppDivider.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppInputPassword from '@/components/atoms/inputs/AppInputPassword.vue'
import AppLink from '@/components/atoms/links/AppLink.vue'

import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    AppInput,
    AppInputPassword,
    AppButton,
    AppLink,
    AppDivider,
  },
  setup() {
    return {}
  },
})
</script>

<template>
  <div class="flex justify-center items-center gap-4 flex-col">
    <app-input />
    <app-input-password />
    <app-button label="Ingresar" />
    <app-link label="Forgot password?" />
    <app-divider />
    <div class="w-full grid grid-cols-2 gap-4">
      <app-button label="Google" variant="white" />
      <app-button label="Facebook" variant="white" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

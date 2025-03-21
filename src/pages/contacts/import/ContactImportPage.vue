<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.IMPORT" :actions="[]" />

  <AppCard>
    <template #content>
      <div>
        <h3 class="text-xl font-bold my-2">Información importante</h3>
        <ul class=" list-inside list-disc ml-4 text-sm">
          <li>La primera fila no se importa debido a que normalmente es el título de la columna.</li>
          <li>El campo 'Teléfono' es obligatorio, sin este no se importarán tus contactos.</li>
          <li>Los formatos soportados son .xlsx y .csv.</li>
          <li>Al finalizar encontrarás la lista de números para llamar.</li>
        </ul>

        <AppButton class="mt-8 !mx-auto !w-auto" :label="'Cargar Archivo'">
          <template #icon-start>
            <ImportIcon class="w-5 h-5" />
          </template>
        </AppButton>
      </div>
    </template>
  </AppCard>


</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ImportIcon from '@/assets/svg/table-actions/import.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
    AppCard,
    AppButton, ImportIcon
  },
  setup() {
    return {
      IconTypes,
    }
  },
})
</script>

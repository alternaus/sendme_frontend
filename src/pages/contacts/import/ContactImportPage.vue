<template>
  <AppHeader :text="$t('contact.import_contacts')" :icon="IconTypes.IMPORT" :actions="[]" />


  <AppCard>
    <template #content>
      <div class="flex justify-content-center mb-4">
        <SelectButton v-model="importType" :options="importOptions" optionLabel="label" optionValue="value"
        class="mx-auto"
          :allowEmpty="false">
          <template #option="slotProps">
            <span>
              <i :class="slotProps.option.icon" style="margin-right:8px" />
              {{ slotProps.option.label }}
            </span>
          </template>
        </SelectButton>
      </div>

      <div class="flex justify-content-center" v-if="importType === 'google'">
        <PrimeButton label="Importar desde Google" icon="pi pi-cloud-upload" size="small" :loading="loading"
          @click="handleGoogleImport" class="mb-2 mx-auto!" />
      </div>
      <div v-else>
        <UploadFile />
      </div>

    </template>
  </AppCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import PrimeButton from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { useToast } from 'primevue/usetoast'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useContactService } from '@/services/contact/useContactService'

import UploadFile from '../components/UploadFile.vue'

const { syncGoogleContacts } = useContactService()

export default defineComponent({
  components: {
    AppHeader,
    AppCard,
    UploadFile,
    SelectButton,
    PrimeButton,
  },
  setup() {

    const toast = useToast()
    const importType = ref<'google' | 'excel'>('excel')
    const importOptions = [
      { label: 'Google', value: 'google', icon: 'pi pi-google' },
      { label: 'Excel', value: 'excel', icon: 'pi pi-file-excel' }
    ]
    const loading = ref(false)
    const result = ref<{ imported: number; created: number; updated: number } | null>(null)

    const handleGoogleImport = async () => {
      loading.value = true
      result.value = null
      try {
        const res = await syncGoogleContacts()
        result.value = {
          imported: Number(res.imported ?? 0),
          created: Number(res.created ?? 0),
          updated: Number(res.updated ?? 0),
        }
        toast.add({
          severity: 'success',
          summary: 'Importación exitosa',
          detail: `Se importaron ${result.value.imported} contactos correctamente.`,
          life: 4000
        })
      } catch {

        toast.add({
          severity: 'error',
          summary: 'Conexión requerida',
          detail: 'Debes conectar tu cuenta a Google para importar contactos.',
          life: 4000
        })

      } finally {
        loading.value = false
      }
    }

    return {
      IconTypes,
      importType,
      importOptions,
      loading,
      result,
      handleGoogleImport,
    }
  },
})
</script>

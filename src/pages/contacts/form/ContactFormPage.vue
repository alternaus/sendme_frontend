<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { type FieldEntry } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import BirthdayIcon from '@/assets/svg/birthday.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useContactService } from '@/services/contact/useContactService'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

import { type CustomValue,useFormContact } from '../composables/useContactForm'

export default defineComponent({
  components: {
    AppInput,
    AppHeader,
    AppCard,
    AppButton,
    AppSelect,
    AppDatePicker,
    CredentialIcon,
    PhoneIcon,
    EmailIcon,
    BirthdayIcon,
    StatusIcon,
    InformationIcon,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()
    const { t } = useI18n()
    const breadcrumbStore = useBreadcrumbStore()

    const contactId = route.params?.id ? String(route.params.id) : ''
    const { form, handleSubmit, resetForm, errors, addCustomField, setValues } = useFormContact()
    const { getCustomFields } = useCustomFieldService()
    const { getContact, createContact, updateContact } = useContactService()

    const customFields = ref<{ id: number; fieldName: string; dataType: string }[]>([])

    const breadcrumbData = computed(() => [
      { text: 'contact.contacts', to: { name: 'contacts.index' }, active: false },
      {
        text: contactId ? 'actions.edit' : 'actions.create',
        to: contactId
          ? { name: 'contacts.view', params: { id: contactId } }
          : { name: 'contacts.create' },
        active: true,
      },
    ])

    watchEffect(() => {
      breadcrumbStore.setBreadcrumbs(breadcrumbData.value)
    })
    onMounted(async () => {
      try {
        const response = await getCustomFields()
        customFields.value = response

        response.forEach((field) => {
          addCustomField({
            customFieldId: field.id,
            value: '',
            id: undefined,
          })
        })
        if (contactId) {
          const contact = await getContact(contactId)

          setValues({
            name: contact.name,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            countryCode: contact.countryCode,
            status: contact.status,
            birthDate: contact.birthDate ? new Date(contact.birthDate) : undefined,
            customValues: contact.customValues?.map((custom) => ({
              customFieldId: custom.customFieldId,
              value: custom.value,
              id: custom.id,
            })),
          })
        }

        // Navegar al último elemento después de que se hayan cargado los campos
        await nextTick()
        setTimeout(() => {
          const customFieldsContainer = document.querySelector('.custom-fields-container')
          if (customFieldsContainer) {
            const lastField = customFieldsContainer.lastElementChild
            if (lastField) {
              lastField.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }
          }
        }, 100)
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('contact.custom_fields_not_loaded'),
          life: 3000,
        })
      }
    })

    const statusOptions = [
      { name: t('general.active'), value: 'active' },
      { name: t('general.inactive'), value: 'inactive' },
    ]

    const onSubmitForm = handleSubmit(
      async (values) => {
        try {
          const payload = {
            ...values,
            birthDate: values.birthDate ? values.birthDate : new Date(),
            customValues: values.customValues
              .filter((customValue) => customValue.customFieldId !== undefined)
              .map((customValue) => ({
                customFieldId: customValue.customFieldId as number,
                value: customValue.value || '',
                id: customValue.id,
              })),
          }

          if (contactId) {
            await updateContact(contactId, payload)
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('contact.contact_updated'),
              life: 3000,
            })
          } else {
            await createContact(payload)
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('contact.contact_created'),
              life: 3000,
            })
          }

          router.push('/contacts')
        } catch {
          toast.add({
            severity: 'error',
            summary: t('general.error'),
            detail: t('contact.error_saving_contact'),
            life: 3000,
          })
        }
      },
      (errors) => {
        console.log('❌ Errores en el formulario:', errors)
      },
    )

    const getError = (index: number, field: string) => {
      const errorKey = `customValues[${index}].${field}`
      return (errors?.value as Record<string, string | undefined>)[errorKey] || ''
    }

    const handleDateChange = (value: Date | null, custom: FieldEntry<CustomValue>) => {
      if (custom.value) {
        custom.value.value = value ? value.toISOString() : ''
      }
    }

    const goBack = () => {
      router.push('/contacts')
    }

    return {
      IconTypes,
      ActionTypes,
      form,
      errors,
      resetForm,
      onSubmitForm,
      addCustomField,
      statusOptions,
      customFields,
      getError,
      contactId,
      goBack,
      handleDateChange,
    }
  },
})
</script>

<template>
  <AppHeader :text="contactId ? $t('contact.edit_contact') : $t('contact.new_contact')" :icon="IconTypes.CONTACTS"
    :actions="[]" />

  <form @submit.prevent="onSubmitForm" class="w-full">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput v-model="form.name.value" type="text" class="w-full rounded-md mt-3" :error-message="errors.name"
        :label="$t('general.name')">
        <template #icon>
          <CredentialIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppInput v-model="form.lastName.value" type="text" class="w-full rounded-md mt-3"
        :error-message="errors.lastName" :label="$t('general.last_name')">
        <template #icon>
          <CredentialIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppInput v-model="form.email.value" type="email" class="w-full rounded-md mt-3" :error-message="errors.email"
        :label="$t('general.email')">
        <template #icon>
          <EmailIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppInput v-model="form.phone.value" type="tel" class="w-full rounded-md mt-3" :error-message="errors.phone"
        :label="$t('general.phone')">
        <template #icon>
          <PhoneIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppInput v-model="form.countryCode.value" type="text" class="w-full rounded-md mt-3"
        :error-message="errors.countryCode" :label="$t('general.country_code')">
        <template #icon>
          <CredentialIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppDatePicker v-model="form.birthDate.value" placeholder="Seleccione una fecha" class="w-full mt-3"
        :error-message="errors.birthDate" :label="$t('general.birth_date')">
        <template #icon>
          <BirthdayIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppDatePicker>

      <AppSelect v-model="form.status.value" :options="statusOptions" class="w-full mt-3" :error-message="errors.status"
        :label="$t('general.status')">
        <template #icon>
          <StatusIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppSelect>
    </div>

    <AppCard class="w-full shadow-lg p-6 mt-4">
      <template #content>
        <div class="flex items-center justify-center gap-2 mb-4">
          <InformationIcon class="w-8 h-8 dark:fill-white" />
          <h2 class="text-center text-xl font-semibold">
            {{ $t('general.personalized_information') }}
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-[300px] overflow-y-auto pr-2 custom-fields-container">
          <div v-for="(custom, index) in form.customValues.value" :key="index" class="flex flex-col gap-1">
            <label class="text-sm font-medium">{{
              customFields.find((field) => field.id === custom.value.customFieldId)?.fieldName
            }}</label>
            <template v-if="customFields.find((field) => field.id === custom.value.customFieldId)?.dataType === 'string'">
              <AppInput v-model="custom.value.value" type="text" class="w-full rounded-md"
                :error-message="getError(index, 'value')" />
            </template>
            <template v-else-if="customFields.find((field) => field.id === custom.value.customFieldId)?.dataType === 'number'">
              <AppInput v-model="custom.value.value" type="number" class="w-full rounded-md"
                :error-message="getError(index, 'value')" />
            </template>
            <template v-else-if="customFields.find((field) => field.id === custom.value.customFieldId)?.dataType === 'date'">
              <AppDatePicker :model-value="custom.value.value ? new Date(custom.value.value) : new Date()"
                @update:model-value="(val) => handleDateChange(val, custom)"
                class="w-full rounded-md"
                :error-message="getError(index, 'value')" />
            </template>
          </div>
        </div>
      </template>
    </AppCard>
    <div class="flex justify-center flex-col lg:flex-row gap-5 mt-7">
      <AppButton class="w-full sm:w-auto" type="submit" severity="primary" :label="$t('general.save')" />
      <AppButton class="w-full sm:w-auto" severity="secondary" :label="$t('general.cancel')" @click="goBack" />
    </div>
  </form>
</template>

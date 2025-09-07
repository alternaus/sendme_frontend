<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { type FieldEntry } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import BirthdayIcon from '@/assets/svg/birthday.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import AppPhoneInput from '@/components/molecules/phone-input/AppPhoneInput.vue'
import { useContactService } from '@/services/contact/useContactService'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

import CustomFieldsForm from '../components/CustomFieldsForm.vue'
import { type CustomValue, useFormContact } from '../composables/useContactForm'

export default defineComponent({
  components: {
    AppInput,
    AppPhoneInput,
    AppHeader,
    AppButton,
    AppStatusSelect,
    AppDatePicker,
    CredentialIcon,
    EmailIcon,
    BirthdayIcon,
    StatusIcon,
    CustomFieldsForm,
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

    const customFields = ref<{ id: string; fieldName: string; dataType: string }[]>([])
    const touchedFields = ref<Record<string, boolean>>({})

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
            customValues: []
          })


          const addedFields = new Set()


          contact.customValues?.forEach((custom) => {
            addCustomField({
              customFieldId: custom.customFieldId,
              value: custom.value || '',
              id: custom.id,
            })
            addedFields.add(custom.customFieldId.toString())
          })


          response.forEach((field) => {
            if (!addedFields.has(field.id.toString())) {
              addCustomField({
                customFieldId: field.id,
                value: '',
                id: undefined,
              })
            }
          })
        } else {
          response.forEach((field) => {
            addCustomField({
              customFieldId: field.id,
              value: '',
              id: undefined,
            })
          })
        }


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
          summary: t('contact.general.error'),
          detail: t('contact.custom_fields_not_loaded'),
          life: 3000,
        })
      }
    })

    // Los estados ahora se manejan directamente en AppStatusSelect

    const onSubmitForm = handleSubmit(
      async (values) => {
        console.log('Form values:', values) // Debug log
        try {
          const payload = {
            ...values,
            birthDate: values.birthDate ? values.birthDate : new Date(),
            customValues: values.customValues ? values.customValues
              .filter((customValue) => customValue.customFieldId !== undefined && customValue.customFieldId !== null)
              .map((customValue) => ({
                customFieldId: customValue.customFieldId as string,
                value: customValue.value || '',
                id: customValue.id,
              })) : [],
          }

          console.log('Payload being sent:', payload) // Debug log

          if (contactId) {
            await updateContact(contactId, payload)
            toast.add({
              severity: 'success',
              summary: t('contact.general.success'),
              detail: t('contact.contact_updated'),
              life: 3000,
            })
          } else {
            await createContact(payload)
            toast.add({
              severity: 'success',
              summary: t('contact.general.success'),
              detail: t('contact.contact_created'),
              life: 3000,
            })
          }

          router.push('/contacts')
        } catch (error) {
          console.error('Error submitting form:', error) // Debug log
          toast.add({
            severity: 'error',
            summary: t('contact.general.error'),
            detail: t('contact.error_saving_contact'),
            life: 3000,
          })
        }
      },
      (validationErrors) => {
        console.log('Validation errors:', validationErrors) // Debug log
        form.customValues.value.forEach((_, index) => {
          touchedFields.value[`customValues[${index}].value`] = true
        })
      },
    )

    const handleCustomFieldChange = (index: number, field: string) => {
      const errorKey = `customValues[${index}].${field}`
      touchedFields.value[errorKey] = true
    }

    const handleCustomDateChange = (value: Date | null, custom: FieldEntry<CustomValue>, index: number) => {
      if (custom.value) {
        custom.value.value = value ? value.toISOString() : null
        handleCustomFieldChange(index, 'value')
      }
    }

    const goBack = () => {
      router.push('/contacts')
    }

    const handlePhoneInput = (phoneResult: { number: string; valid: boolean; country: { dialCode: string } }) => {
      // Asegurar que el código de país se guarde correctamente
      if (phoneResult.country?.dialCode) {
        form.countryCode.value = phoneResult.country.dialCode
      }
    }

    return {
      IconTypes,
      ActionTypes,
      form,
      errors,
      resetForm,
      onSubmitForm,
      addCustomField,
      customFields,
      contactId,
      goBack,
      handleCustomDateChange,
      handleCustomFieldChange,
      handlePhoneInput,
      touchedFields,
    }
  },
})
</script>

<template>
  <AppHeader :text="contactId ? $t('contact.edit_contact') : $t('contact.new_contact')" :icon="IconTypes.CONTACTS"
    :actions="[]" />

  <form @submit.prevent="onSubmitForm" class="w-full pt-4">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput v-model="form.name.value" type="text" class="w-full rounded-md mt-3" :error-message="errors.name"
        :label="$t('contact.general.name')">
        <template #icon>
          <CredentialIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppInput v-model="form.lastName.value" type="text" class="w-full rounded-md mt-3"
        :error-message="errors.lastName" :label="$t('contact.general.last_name')">
        <template #icon>
          <CredentialIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>

      <AppPhoneInput
        v-model="form.phone.value"
        v-model:countryCode="form.countryCode.value"
        class="w-full mt-3"
        :label="$t('contact.general.phone')"
        :placeholder="$t('contact.general.phone_placeholder')"
        :error-message="errors.phone || errors.countryCode"
        default-country="CO"
        :preferred-countries="['CO', 'US', 'MX', 'ES', 'PE', 'AR', 'CL', 'EC']"
        @input="handlePhoneInput"
      />

      <AppInput v-model="form.email.value" type="email" class="w-full rounded-md mt-3" :error-message="errors.email"
        :label="$t('contact.general.email')">
        <template #icon>
          <EmailIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppInput>



      <AppDatePicker v-model="form.birthDate.value" class="w-full mt-3"
        :error-message="errors.birthDate" :label="$t('contact.general.birth_date')">
        <template #icon>
          <BirthdayIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppDatePicker>

      <AppStatusSelect
        v-model="form.status.value"
        status-type="contact"
        class="w-full mt-3"
        :error-message="errors.status"
        :label="$t('contact.general.status')"
        :show-colors="true"
      >
        <template #icon>
          <StatusIcon class="w-4 h-4 dark:fill-white" />
        </template>
      </AppStatusSelect>
    </div>

    <CustomFieldsForm
      :custom-values="form.customValues.value"
      :custom-fields="customFields"
      :errors="errors"
      :touched-fields="touchedFields"
      @field-change="handleCustomFieldChange"
      @date-change="handleCustomDateChange"
    />
    <div class="flex justify-center flex-col lg:flex-row gap-5 mt-7">
      <AppButton class="w-full sm:w-auto" type="submit" severity="primary" :label="$t('contact.general.save')" />
      <AppButton class="w-full sm:w-auto" severity="secondary" :label="$t('contact.general.cancel')" @click="goBack" />
    </div>
  </form>
</template>

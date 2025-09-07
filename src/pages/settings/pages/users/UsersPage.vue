<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useUserService } from '@/services/user/useUserService'
import { useAuthStore } from '@/stores/useAuthStore'

const { t } = useI18n()
const toast = useToast()
const { getUsers, createUser, updateUser, deleteUser } = useUserService()
const authStore = useAuthStore()

const MAX_USERS = 3

const users = ref<Array<{
  id?:string;
  name: string;
  email: string;
  isEditing: boolean;
}>>([])

const loadUsers = async () => {
  try {
    const response = await getUsers({ page: 1, limit: MAX_USERS })

    users.value = response.data.slice(0, MAX_USERS).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isEditing: false
    }))

    const remainingSlots = MAX_USERS - users.value.length
    for (let i = 0; i < remainingSlots; i++) {
      users.value.push({
        name: '',
        email: '',
        isEditing: true
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('settings.users.error_loading'),
      life: 3000
    })

    users.value = Array(MAX_USERS).fill(null).map(() => ({
      name: '',
      email: '',
      isEditing: true
    }))
  }
}


const toggleEditMode = (index: number) => {
  users.value[index].isEditing = !users.value[index].isEditing
}

const clearUser = (index: number) => {
  users.value[index] = {
    name: '',
    email: '',
    isEditing: true
  }
}

const validateUser = (user: { name: string, email: string }) => {
  const errors = []

  if (!user.name.trim()) {
    errors.push(t('settings.users.name') + ': ' + t('general.required_field'))
  }

  if (!user.email.trim()) {
    errors.push(t('settings.users.email') + ': ' + t('general.required_field'))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push(t('settings.users.email') + ': ' + t('general.invalid_email'))
  }

  return errors
}

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8)
}

const saveUsers = async () => {
  const usersWithData = users.value.filter(user =>
    user.name.trim() !== '' || user.email.trim() !== ''
  )

  if (usersWithData.length === 0) {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('settings.users.no_users_added'),
      life: 3000
    })
    return
  }

  let hasErrors = false
  for (const user of usersWithData) {
    const errors = validateUser(user)
    if (errors.length > 0) {
      hasErrors = true
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: errors.join(', '),
        life: 5000
      })
    }
  }

  if (hasErrors) return

  const organizationId = authStore.user?.organizationId

  try {
    for (const user of usersWithData) {
      if (user.id) {
        await updateUser(user.id, {
          name: user.name,
          email: user.email
        })
      } else {
        if (!organizationId) {
          throw new Error('No organization ID found for the current user.')
        }
        await createUser({
          name: user.name,
          email: user.email,
          roleId: 'user',
          organizationId,
          password: generateRandomPassword(),
        })
      }
    }

    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('settings.users.users_updated'),
      life: 3000
    })

    await loadUsers()
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('user.error_saving'),
      life: 3000
    })
  }
}

//Eliminar un usuario
const handleRemoveUser = async (index: number) => {
  const user = users.value[index]

  if (user.id) {
    try {
      await deleteUser(user.id)
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('user.user_deleted'),
        life: 3000
      })
    } catch  {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('user.error_deleting'),
        life: 3000
      })
      return
    }
  }

  //Limpiar el usuario en la posición
  clearUser(index)
}

//Hay algún usuario en modo de edición?
const hasEditingUsers = () => {
  return users.value.some(user => user.isEditing)
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('settings.users.title')" :actions="[]" />
  <div class="">
    <AppCard class="h-full max-h-[calc(100vh-140px-4rem)]">
      <template #content>
        <div class="h-full flex flex-col">
          <div class="flex-none">
            <p class="text-center text-neutral-600 dark:text-neutral-300">
              {{ $t('settings.users.add_users_limit', { max: MAX_USERS }) }}
            </p>
          </div>

          <div class="flex-1 min-h-0 max-h-64 lg:max-h-96 overflow-y-auto my-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 auto-rows-min">
              <div v-for="(user, idx) in users" :key="idx"
                class="p-4 my-2 bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 h-fit">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                      {{ idx + 1 }}
                    </div>
                    <div class="flex gap-2">
                      <AppButton
                        v-if="user.id"
                        @click="toggleEditMode(idx)"
                        :icon="user.isEditing ? 'pi pi-times' : 'pi pi-pencil'"
                        :severity="user.isEditing ? 'secondary' : 'info'"
                        variant="text"
                        rounded />
                      <AppButton
                        @click="handleRemoveUser(idx)"
                        icon="pi pi-trash"
                        severity="danger"
                        variant="text"
                        rounded />
                    </div>
                  </div>

                  <div class="space-y-6 mt-2">
                    <template v-if="user.isEditing">
                      <AppInput
                        v-model="user.name"
                        :label="$t('settings.users.name')"
                        class="w-full" />

                      <AppInput
                        v-model="user.email"
                        :label="$t('settings.users.email')"
                        type="email"
                        class="w-full" />
                    </template>
                    <template v-else>
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('settings.users.name') }}</small>
                          <p class="font-medium">{{ user.name }}</p>
                        </div>
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('settings.users.email') }}</small>
                          <p class="font-medium">{{ user.email }}</p>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-none flex justify-center items-center gap-4 py-4">
            <AppButton
              v-if="hasEditingUsers()"
              type="button"
              class="!w-fit"
              :label="$t('general.save')"
              @click="saveUsers"
              icon="pi pi-save" />
          </div>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<style scoped></style>

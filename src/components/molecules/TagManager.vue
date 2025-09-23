<template>
  <div class="tag-manager-prime w-full">
    <!-- Con FloatLabel cuando hay label -->
    <FloatLabel variant="on" v-if="label">
      <div class="relative">
        <i class="pi pi-tags absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"></i>
        <MultiSelect
          v-model="selectedTags"
          :options="tagOptions"
          option-label="name"
          option-value="id"
          :placeholder="computedPlaceholder"
          :disabled="disabled"
          filter
          :show-clear="true"
          display="chip"
          :max-selected-labels="10"
          size="small"
          class="w-full pl-8"
          :class="[inputClasses, { 'p-invalid': showErrorMessage && errorMessage }]"
          @change="onSelectionChange"
          @filter="onFilter"
        >
        <!-- Template para las opciones en el dropdown -->
        <template #option="slotProps">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: slotProps.option.color || FALLBACK_TAG_COLOR }"
              />
              <span>{{ slotProps.option.name }}</span>
            </div>
            <div v-if="allowManage" class="flex items-center gap-1">
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                @click.stop="editTag(slotProps.option)"
                class="p-1"
                :pt="{ root: { style: 'width: 1.5rem; height: 1.5rem' } }"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                severity="danger"
                @click.stop="confirmDeleteTag(slotProps.option)"
                class="p-1"
                :pt="{ root: { style: 'width: 1.5rem; height: 1.5rem' } }"
              />
            </div>
          </div>
        </template>

        <!-- Template para los chips seleccionados -->
        <template #chip="{ value }">
          <div
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            :style="{ backgroundColor: getTagColor(value) || FALLBACK_TAG_COLOR }"
          >
            <span>{{ getTagName(value) }}</span>
          </div>
        </template>

        <!-- Template para el header del panel -->
        <template #header>
          <div class="font-medium px-3 py-2">{{ t('common.tags.labels.available_tags') }}</div>
        </template>

        <!-- Template para el icono de filtro -->
        <template #filtericon>
          <i class="pi pi-search" />
        </template>

        <!-- Template para el footer del panel -->
        <template #footer>
          <div class="p-3 flex justify-between">
            <Button
              v-if="allowCreate && showCreateButton"
              :label="t('common.tags.buttons.create_from_filter', { name: currentFilterValue })"
              severity="secondary"
              variant="text"
              size="small"
              icon="pi pi-plus"
              @click="createTagFromFilter"
            />
            <Button
              v-if="allowCreate && !showCreateButton"
              :label="t('common.tags.buttons.new_tag')"
              severity="secondary"
              variant="text"
              size="small"
              icon="pi pi-plus"
              @click="openCreateModal"
            />
          </div>
        </template>
      </MultiSelect>
      </div>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label -->
    <div class="relative" v-else>
      <i class="pi pi-tag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"></i>
      <MultiSelect
        v-model="selectedTags"
        :options="tagOptions"
        option-label="name"
        option-value="id"
        :placeholder="computedPlaceholder"
        :disabled="disabled"
        filter
        :show-clear="true"
        display="chip"
        :max-selected-labels="10"
        size="small"
        class="w-full pl-8"
      :class="[inputClasses, { 'p-invalid': showErrorMessage && errorMessage }]"
      @change="onSelectionChange"
      @filter="onFilter"
    >
      <!-- Template para las opciones en el dropdown -->
      <template #option="slotProps">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: slotProps.option.color || FALLBACK_TAG_COLOR }"
            />
            <span>{{ slotProps.option.name }}</span>
          </div>
          <div v-if="allowManage" class="flex items-center gap-1">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              @click.stop="editTag(slotProps.option)"
              class="p-1"
              :pt="{ root: { style: 'width: 1.5rem; height: 1.5rem' } }"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              @click.stop="confirmDeleteTag(slotProps.option)"
              class="p-1"
              :pt="{ root: { style: 'width: 1.5rem; height: 1.5rem' } }"
            />
          </div>
        </div>
      </template>

      <!-- Header con botón crear cuando no existe la etiqueta -->
      <template #header>
        <div v-if="showCreateButton" class="border-b border-gray-200 dark:border-gray-700 p-3">
          <Button
            :label="t('common.tags.buttons.create_from_filter', { name: currentFilterValue })"
            icon="pi pi-plus"
            @click="createTagFromFilter"
            class="w-full justify-center"
            size="small"
            severity="success"
          />
        </div>
      </template>
    </MultiSelect>
    </div>

    <!-- Error message -->
    <div v-if="showErrorMessage && errorMessage" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>

    <!-- Modal para crear/editar etiqueta -->
    <Dialog
      v-model:visible="showCreateModal"
      :header="editingTag ? t('common.tags.modals.edit_title') : t('common.tags.modals.create_title')"
      modal
      :style="{ width: '400px' }"
      :draggable="false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <AppInput
          v-model="tagForm.name"
          :label="t('common.tags.labels.name')"
          :placeholder="t('common.tags.placeholders.name')"
          :error-message="formErrors.name"
          :show-error-message="!!formErrors.name"
          :maxlength="100"
          class="mt-6"
          required
        />

        <AppTextarea
          v-model="tagForm.description"
          :label="t('common.tags.labels.description')"
          :placeholder="t('common.tags.placeholders.description')"
          :rows="2"
          :maxlength="255"
        />

        <div class="field">
          <label class="block text-sm font-medium mb-1">{{ t('common.tags.labels.color') }}</label>
          <ColorPicker
            v-model="tagForm.color"
            format="hex"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 pt-3">
          <Button
            :label="t('common.tags.buttons.cancel')"
            severity="secondary"
            size="small"
            @click="closeCreateModal"
          />
          <Button
            :label="editingTag ? t('common.tags.buttons.update') : t('common.tags.buttons.create')"
            size="small"
            type="submit"
          />
        </div>
      </form>
    </Dialog>

    <!-- Modal de confirmación para eliminar -->
    <Dialog
      v-model:visible="showDeleteModal"
      :header="t('common.tags.modals.delete_title')"
      modal
      :style="{ width: '350px' }"
      :draggable="false"
    >
      <div class="space-y-3">
        <p>{{ t('common.tags.modals.delete_confirm', { name: tagToDelete?.name }) }}</p>
        <div class="flex justify-end gap-2 pt-3">
          <Button
            :label="t('common.tags.buttons.cancel')"
            severity="secondary"
            size="small"
            @click="closeDeleteModal"
          />
          <Button
            :label="t('common.tags.buttons.delete')"
            severity="danger"
            size="small"
            @click="handleDelete"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import ColorPicker from 'primevue/colorpicker'
import Dialog from 'primevue/dialog'
import FloatLabel from 'primevue/floatlabel'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import type { ICreateTag, ITag, IUpdateTag } from '@/services/tag/interfaces'
import { useTagService } from '@/services/tag/useTagService'

interface Props {
  modelValue?: string[]
  placeholder?: string
  label?: string
  disabled?: boolean
  allowCreate?: boolean
  allowManage?: boolean
  errorMessage?: string
  showErrorMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: '',
  label: '',
  disabled: false,
  allowCreate: true,
  allowManage: true,
  errorMessage: '',
  showErrorMessage: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'change': [value: string[]]
}>()

const { t } = useI18n()
const toast = useToast()
const tagService = useTagService()

const DEFAULT_TAG_COLOR = '#3B82F6'
const FALLBACK_TAG_COLOR = '#6B7280'

const ensureColorWithHash = (color?: string, fallback = DEFAULT_TAG_COLOR): string => {
  const sanitized = (color ?? '').trim().replace(/^#+/, '')
  if (!sanitized) {
    return fallback
  }
  return `#${sanitized}`
}

const serializeColor = (color?: string, fallback = DEFAULT_TAG_COLOR): string => {
  return ensureColorWithHash(color, fallback).replace('#', '')
}

const normalizeTag = (tag: ITag): ITag => ({
  ...tag,
  color: ensureColorWithHash(tag.color, FALLBACK_TAG_COLOR)
})

// Estado de datos
const tags = ref<ITag[]>([])
const selectedTags = ref<string[]>([])
const currentFilterValue = ref('')

// Computed para el placeholder
const computedPlaceholder = computed(() => {
  return props.placeholder || t('common.tags.placeholders.select')
})

// Computed para asegurar que el modelValue sea siempre un array válido
const validModelValue = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

// Estado de modales
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

// Computed para determinar si mostrar el botón crear
const showCreateButton = computed(() => {
  const filterValue = currentFilterValue.value.trim().toLowerCase()
  if (!filterValue) return false

  // Verificar si ya existe una etiqueta con ese nombre
  const existingTag = tags.value.find(tag =>
    tag.name.toLowerCase() === filterValue
  )

  return !existingTag
})

// Estado de formularios
const tagForm = ref<ICreateTag>({
  name: '',
  description: '',
  color: DEFAULT_TAG_COLOR
})
const formErrors = ref<Partial<Record<keyof ICreateTag, string>>>({})
const editingTag = ref<ITag | null>(null)
const tagToDelete = ref<ITag | null>(null)

// Computed properties
const tagOptions = computed(() => {
  return tags.value.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: ensureColorWithHash(tag.color, FALLBACK_TAG_COLOR),
    description: tag.description
  }))
})

// Clases del input siguiendo el patrón de otros componentes
const inputClasses = computed(() => {
  return '!rounded-xl'
})

// Métodos de utilidad
const getTagName = (tagId: string): string => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const getTagColor = (tagId: string): string => {
  const tag = tags.value.find(t => t.id === tagId)
  return ensureColorWithHash(tag?.color, FALLBACK_TAG_COLOR)
}

// Métodos principales
const loadTags = async () => {
  try {
    const response = await tagService.getTags()
    tags.value = response.map(normalizeTag)
  } catch (error) {
    console.error('Error loading tags:', error)
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: t('common.tags.messages.load_error'),
      life: 3000
    })
  }
}

const onSelectionChange = (event: { value: string[] }) => {
  // Asegurarse de que siempre se emita un array, nunca undefined o null
  const newValue = event.value || []
  selectedTags.value = newValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const onFilter = (event: { value: string }) => {
  currentFilterValue.value = event.value
}

const createTagFromFilter = async () => {
  const tagName = currentFilterValue.value.trim()
  if (!tagName) return

  try {
    const newTagData: ICreateTag = {
      name: tagName,
      description: '',
      color: serializeColor(DEFAULT_TAG_COLOR)
    }

    const createdTag = await tagService.createTag(newTagData)
    const normalizedTag = normalizeTag(createdTag)
    tags.value.push(normalizedTag)

    // Seleccionar el nuevo tag automáticamente
    const updatedSelection = [...selectedTags.value, normalizedTag.id]
    selectedTags.value = updatedSelection
    emit('update:modelValue', updatedSelection)
    emit('change', updatedSelection)

    toast.add({
      severity: 'success',
      summary: t('common.tags.messages.created'),
      detail: t('common.tags.messages.created'),
      life: 3000
    })
  } catch (error) {
    console.error('Error creating tag:', error)
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: t('common.tags.messages.create_error'),
      life: 3000
    })
  }
}

const openCreateModal = () => {
  editingTag.value = null
  tagForm.value = {
    name: '',
    description: '',
    color: DEFAULT_TAG_COLOR
  }
  formErrors.value = {}
  showCreateModal.value = true
}

const editTag = (option: { id: string; name: string; color?: string; description?: string }) => {
  // Encontrar el tag completo en la lista original
  const fullTag = tags.value.find(tag => tag.id === option.id)
  if (fullTag) {
    editingTag.value = fullTag
    const tagColor = ensureColorWithHash(fullTag.color)
    tagForm.value = {
      name: fullTag.name,
      description: fullTag.description || '',
      color: tagColor
    }
    formErrors.value = {}
    showCreateModal.value = true
  }
}

const confirmDeleteTag = (option: { id: string; name: string; color?: string; description?: string }) => {
  // Encontrar el tag completo en la lista original
  const fullTag = tags.value.find(tag => tag.id === option.id)
  if (fullTag) {
    tagToDelete.value = fullTag
    showDeleteModal.value = true
  }
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingTag.value = null
  formErrors.value = {}
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  tagToDelete.value = null
}

const handleSubmit = async () => {
  formErrors.value = {}

  if (!tagForm.value.name.trim()) {
    formErrors.value.name = t('common.tags.validation.name_required')
    return
  }

  const nameExists = tags.value.some(
    tag => tag.name.toLowerCase() === tagForm.value.name.toLowerCase() &&
           tag.id !== editingTag.value?.id
  )

  if (nameExists) {
    formErrors.value.name = t('common.tags.validation.name_exists')
    return
  }

  try {
    if (editingTag.value) {
      const updateData: IUpdateTag = {
        name: tagForm.value.name.trim(),
        description: tagForm.value.description?.trim() || undefined,
        color: serializeColor(tagForm.value.color)
      }

      const updatedTag = await tagService.updateTag(editingTag.value.id, updateData)
      const index = tags.value.findIndex(t => t.id === editingTag.value!.id)
      if (index !== -1) {
        tags.value[index] = normalizeTag(updatedTag)
      }

      toast.add({
        severity: 'success',
        summary: t('common.tags.messages.updated'),
        detail: t('common.tags.messages.updated'),
        life: 3000
      })
    } else {
      const newTagData: ICreateTag = {
        name: tagForm.value.name.trim(),
        description: tagForm.value.description?.trim() || '',
        color: serializeColor(tagForm.value.color)
      }

      const createdTag = await tagService.createTag(newTagData)
      const normalizedTag = normalizeTag(createdTag)
      tags.value.push(normalizedTag)

      toast.add({
        severity: 'success',
        summary: t('common.tags.messages.created'),
        detail: t('common.tags.messages.created'),
        life: 3000
      })
    }

    closeCreateModal()
  } catch (error) {
    console.error('Error saving tag:', error)
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: editingTag.value ? t('common.tags.messages.update_error') : t('common.tags.messages.create_error'),
      life: 3000
    })
  }
}

const handleDelete = async () => {
  if (!tagToDelete.value) return

  try {
    await tagService.deleteTag(tagToDelete.value.id)

    // Remover de la lista de tags
    tags.value = tags.value.filter(t => t.id !== tagToDelete.value!.id)

    // Remover de tags seleccionados si está presente
    if (selectedTags.value.includes(tagToDelete.value.id)) {
      const updatedValues = selectedTags.value.filter(id => id !== tagToDelete.value!.id)
      selectedTags.value = updatedValues
      emit('update:modelValue', updatedValues)
      emit('change', updatedValues)
    }

    toast.add({
      severity: 'success',
      summary: t('common.tags.messages.deleted'),
      detail: t('common.tags.messages.deleted'),
      life: 3000
    })

    closeDeleteModal()
  } catch (error) {
    console.error('Error deleting tag:', error)
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: t('common.tags.messages.delete_error'),
      life: 3000
    })
  }
}

// Lifecycle
onMounted(() => {
  loadTags()

  // Asegurar que se emita un valor válido al montar el componente
  if (!Array.isArray(props.modelValue)) {
    emit('update:modelValue', [])
    emit('change', [])
  }
})

// Watchers
watch(() => validModelValue.value, (newValue) => {
  selectedTags.value = newValue
}, { immediate: true })
</script>

<style scoped>
.tag-manager-prime {
  width: 100%;
}

/* Customización de MultiSelect para mejor apariencia */
:deep(.p-multiselect-chip) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.p-multiselect-token) {
  padding: 0.125rem 0.25rem !important;
  margin: 0.125rem 0.25rem 0.125rem 0 !important;
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

/* Hacer que el contenedor de chips sea más compacto */
:deep(.p-multiselect-label-container) {
  padding: 0.25rem 0.5rem !important;
  gap: 0.25rem !important;
}

:deep(.p-multiselect .p-multiselect-label) {
  padding: 0.25rem 0.5rem !important;
}

/* Estilos para el icono izquierdo con position absolute */
.tag-manager-prime .relative i.pi-tag {
  font-size: 0.875rem;
  pointer-events: none;
}

/* Asegurar que el padding izquierdo del MultiSelect permita ver el icono */
:deep(.pl-8.p-multiselect .p-multiselect-label) {
  padding-left: 0.5rem !important;
}

:deep(.pl-8.p-multiselect .p-multiselect-label-container) {
  padding-left: 0.5rem !important;
  padding: 0.1rem 0.5rem !important;
}
</style>

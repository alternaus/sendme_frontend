<template>
  <div class="tag-manager">
    <!-- Selector de tags con botones discretos -->
    <AppMultiselect
      v-model="selectedTags"
      :options="tagOptions"
      option-label="name"
      option-value="value"
      :placeholder="placeholder"
      size="small"
      :filter="true"
      :show-clear="true"
      :disabled="disabled"
      :error-message="errorMessage"
      :show-error-message="showErrorMessage"
      @change="onSelectionChange"
    >
      <template #option="{ option }">
        <div class="flex items-center gap-2">
          <div
            v-if="option.color"
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: option.color }"
          />
          <span>{{ option.name }}</span>
          <span v-if="showCounts && option.contactCount !== undefined" class="text-xs text-gray-500">
            ({{ option.contactCount }} contactos)
          </span>
        </div>
      </template>

      <template #value="{ value }">
        <div v-if="value && value.length > 0" class="flex flex-wrap gap-1">
          <AppTag
            v-for="tagId in value"
            :key="tagId"
            :value="getTagName(tagId)"
            :style="{ backgroundColor: getTagColor(tagId) }"
            size="small"
            rounded
          />
        </div>
      </template>
    </AppMultiselect>

    <!-- Botones discretos debajo del selector -->
    <div v-if="(allowCreate || allowManage) && !disabled" class="flex gap-2 mt-1">
      <button
        v-if="allowCreate"
        type="button"
        class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        @click="openCreateModal"
      >
        <i class="pi pi-plus text-xs"></i>
        Nueva etiqueta
      </button>
      <button
        v-if="allowManage"
        type="button"
        class="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
        @click="openManageModal"
      >
        <i class="pi pi-cog text-xs"></i>
        Gestionar
      </button>
    </div>    <!-- Modal compacto para crear/editar etiqueta -->
    <AppDialog
      v-model="showCreateModal"
      :header="editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta'"
      modal
      :style="{ width: '350px' }"
      :draggable="false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <AppInput
          v-model="tagForm.name"
          label="Nombre"
          placeholder="Nombre de la etiqueta"
          size="small"
          :maxlength="100"
          required
          :error-message="formErrors.name"
          :show-error-message="!!formErrors.name"
        />

        <AppTextarea
          v-model="tagForm.description"
          label="Descripción (opcional)"
          placeholder="Descripción"
          size="small"
          :maxlength="255"
          :rows="2"
        />

        <div>
          <label class="block text-sm font-medium mb-1">Color</label>
          <ColorPicker
            v-model="tagForm.color"
            format="hex"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton
            type="button"
            label="Cancelar"
            severity="secondary"
            size="small"
            text
            @click="closeCreateModal"
          />
          <AppButton
            type="submit"
            :label="editingTag ? 'Actualizar' : 'Crear'"
            size="small"
            :loading="submitting"
          />
        </div>
      </form>
    </AppDialog>

    <!-- Modal compacto para gestionar etiquetas -->
    <AppDialog
      v-model="showManageModal"
      header="Gestionar Etiquetas"
      modal
      :style="{ width: '500px', maxHeight: '70vh' }"
      :draggable="false"
    >
      <div class="space-y-3">
        <div v-if="tagsWithCounts.length === 0" class="text-center py-6 text-gray-500 text-sm">
          No hay etiquetas creadas
        </div>

        <div v-else class="max-h-80 overflow-y-auto space-y-2">
          <div
            v-for="tag in tagsWithCounts"
            :key="tag.id"
            class="flex items-center justify-between p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <div
                v-if="tag.color"
                class="w-3 h-3 rounded-full flex-shrink-0"
                :style="{ backgroundColor: tag.color }"
              />
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sm truncate">{{ tag.name }}</div>
                <div v-if="tag.description" class="text-xs text-gray-600 truncate">
                  {{ tag.description }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ tag.contactCount }} contactos • {{ tag.campaignCount }} campañas
                </div>
              </div>
            </div>
            <div class="flex gap-1 flex-shrink-0">
              <AppButton
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                text
                @click="editTag(tag)"
              />
              <AppButton
                icon="pi pi-trash"
                size="small"
                severity="danger"
                text
                @click="confirmDeleteTag(tag)"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <AppButton
            label="Cerrar"
            severity="secondary"
            size="small"
            @click="closeManageModal"
          />
        </div>
      </div>
    </AppDialog>

    <!-- Modal compacto de confirmación para eliminar -->
    <AppDialog
      v-model="showDeleteModal"
      header="Eliminar Etiqueta"
      modal
      :style="{ width: '320px' }"
      :draggable="false"
    >
      <div class="space-y-3">
        <p class="text-sm">¿Eliminar "{{ tagToDelete?.name }}"?</p>
        <p v-if="tagToDelete && (tagToDelete.contactCount > 0 || tagToDelete.campaignCount > 0)"
           class="text-amber-600 text-xs">
          Usada en {{ tagToDelete.contactCount }} contactos y {{ tagToDelete.campaignCount }} campañas.
        </p>

        <div class="flex justify-end gap-2 pt-2">
          <AppButton
            label="Cancelar"
            severity="secondary"
            size="small"
            text
            @click="closeDeleteModal"
          />
          <AppButton
            label="Eliminar"
            severity="danger"
            size="small"
            :loading="deleting"
            @click="handleDelete"
          />
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import ColorPicker from 'primevue/colorpicker'
import type { MultiSelectChangeEvent } from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppMultiselect from '@/components/atoms/selects/AppMultiselect.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import type { ICreateTag, ITag, ITagWithCounts, IUpdateTag } from '@/services/tag/interfaces'
import { useTagService } from '@/services/tag/useTagService'

interface Props {
  modelValue?: string[]
  placeholder?: string
  disabled?: boolean
  allowCreate?: boolean
  allowManage?: boolean
  showCounts?: boolean
  errorMessage?: string
  showErrorMessage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Seleccionar etiquetas',
  disabled: false,
  allowCreate: true,
  allowManage: true,
  showCounts: false,
  errorMessage: '',
  showErrorMessage: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'change': [value: string[]]
}>()

const toast = useToast()
const tagService = useTagService()

// Estado de datos
const tags = ref<ITag[]>([])
const tagsWithCounts = ref<ITagWithCounts[]>([])
const selectedTags = ref<string[]>([])

// Computed para opciones del multiselect
const tagOptions = computed(() => {
  return tags.value.map(tag => ({
    name: tag.name,
    value: tag.id,
    color: tag.color,
    contactCount: 0 // Por defecto, se actualiza cuando se necesite
  }))
})

// Estado de modales
const showCreateModal = ref(false)
const showManageModal = ref(false)
const showDeleteModal = ref(false)

// Estado de formulario
const editingTag = ref<ITag | null>(null)
const tagToDelete = ref<ITagWithCounts | null>(null)
const submitting = ref(false)
const deleting = ref(false)

const tagForm = ref<ICreateTag>({
  name: '',
  description: '',
  color: '#2196F3'
})

const formErrors = ref<Record<string, string>>({})

// Computed
// const selectedTagsData = computed(() => {
//   return tags.value.filter(tag => selectedTags.value.includes(tag.id))
// })

// Watchers
watch(() => props.modelValue, (newValue) => {
  selectedTags.value = newValue || []
}, { immediate: true })

watch(selectedTags, (newValue) => {
  emit('update:modelValue', newValue)
}, { deep: true })

// Métodos de datos
const loadTags = async () => {
  try {
    tags.value = await tagService.getTags()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las etiquetas'
    })
  }
}

const loadTagsWithCounts = async () => {
  try {
    tagsWithCounts.value = await tagService.getTagsWithCounts()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las etiquetas con conteos'
    })
  }
}

// Métodos de utilidad
const getTagName = (tagId: string): string => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.name || ''
}

const getTagColor = (tagId: string): string => {
  const tag = tags.value.find(t => t.id === tagId)
  return tag?.color || '#2196F3'
}

// Métodos de eventos
const onSelectionChange = (event: MultiSelectChangeEvent) => {
  emit('change', event.value || [])
}

// Métodos de modal de creación/edición
const openCreateModal = () => {
  editingTag.value = null
  tagForm.value = {
    name: '',
    description: '',
    color: '#2196F3'
  }
  formErrors.value = {}
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingTag.value = null
  formErrors.value = {}
}

const editTag = (tag: ITag) => {
  editingTag.value = tag
  tagForm.value = {
    name: tag.name,
    description: tag.description || '',
    color: tag.color || '#2196F3'
  }
  formErrors.value = {}
  showCreateModal.value = true
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!tagForm.value.name?.trim()) {
    formErrors.value.name = 'El nombre es requerido'
  } else if (tagForm.value.name.length > 100) {
    formErrors.value.name = 'El nombre no puede exceder 100 caracteres'
  }

  return Object.keys(formErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    if (editingTag.value) {
      // Actualizar etiqueta existente
      await tagService.updateTag(editingTag.value.id, tagForm.value as IUpdateTag)
      toast.add({
        severity: 'success',
        summary: 'Etiqueta actualizada',
        detail: 'La etiqueta se actualizó correctamente'
      })
    } else {
      // Crear nueva etiqueta
      const newTag = await tagService.createTag(tagForm.value)
      tags.value.push(newTag)
      toast.add({
        severity: 'success',
        summary: 'Etiqueta creada',
        detail: 'La etiqueta se creó correctamente'
      })
    }

    await loadTags()
    if (showManageModal.value) {
      await loadTagsWithCounts()
    }
    closeCreateModal()
  } catch (error: unknown) {
    let message = 'Error al procesar la etiqueta'
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } }
      message = apiError.response?.data?.message || message
    }
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    })
  } finally {
    submitting.value = false
  }
}

// Métodos de modal de gestión
const openManageModal = async () => {
  showManageModal.value = true
  await loadTagsWithCounts()
}

const closeManageModal = () => {
  showManageModal.value = false
}

// Métodos de eliminación
const confirmDeleteTag = (tag: ITagWithCounts) => {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  tagToDelete.value = null
}

const handleDelete = async () => {
  if (!tagToDelete.value) return

  deleting.value = true
  try {
    await tagService.deleteTag(tagToDelete.value.id)

    // Remover de las listas locales
    tags.value = tags.value.filter(t => t.id !== tagToDelete.value!.id)
    tagsWithCounts.value = tagsWithCounts.value.filter(t => t.id !== tagToDelete.value!.id)

    // Remover de selección si estaba seleccionada
    if (selectedTags.value.includes(tagToDelete.value.id)) {
      selectedTags.value = selectedTags.value.filter(id => id !== tagToDelete.value!.id)
    }

    toast.add({
      severity: 'success',
      summary: 'Etiqueta eliminada',
      detail: 'La etiqueta se eliminó correctamente'
    })

    closeDeleteModal()
  } catch (error: unknown) {
    let message = 'Error al eliminar la etiqueta'
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { message?: string } } }
      message = apiError.response?.data?.message || message
    }
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    })
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadTags()
})

// Exponer métodos públicos
defineExpose({
  loadTags,
  openCreateModal,
  openManageModal
})
</script>

<style scoped>
.tag-manager {
  /* El componente ocupa solo el espacio necesario como un input normal */
  width: 100%;
}

/* Botones discretos - solo visibles al hacer hover en el contenedor */
.tag-manager:hover .flex.gap-2.mt-1 {
  opacity: 1;
}

.tag-manager .flex.gap-2.mt-1 {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

/* Estilo de los botones de texto */
.tag-manager button {
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
</style>

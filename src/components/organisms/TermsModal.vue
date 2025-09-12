<template>
  <Dialog
    :visible="visible"
    modal
    :header="$t('terms.modal.title')"
    :style="{ width: '50rem' }"
    :closable="!blocking"
    :close-on-escape="!blocking"
    @update:visible="onVisibilityChange"
  >
    <ScrollPanel style="height: 300px">
      <div class="pr-3">
        <slot>
          <p>{{ $t('terms.content.description') }}</p>
        </slot>
      </div>
    </ScrollPanel>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          v-if="!blocking"
          :label="$t('terms.actions.cancel')"
          severity="secondary"
          outlined
          @click="$emit('cancel')"
          :disabled="loading"
        />
        <Button
          :label="loading ? $t('terms.actions.accepting') : $t('terms.actions.accept')"
          :loading="loading"
          @click="$emit('accept')"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ScrollPanel from 'primevue/scrollpanel'

interface Props {
  visible: boolean
  blocking?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  blocking: false,
  loading: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  accept: []
  cancel: []
}>()

const onVisibilityChange = (value: boolean) => {
  // Solo permitir cerrar el modal si no está en modo blocking
  if (!props.blocking || value === true) {
    emit('update:visible', value)
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="$t('terms.modal.title')"
    :style="{ width: '50rem' }"
    :closable="!blocking"
    @update:visible="$emit('update:visible', $event)"
  >
    <ScrollPanel style="height: 300px">
      <div class="pr-3">
        <slot>
          <p>{{ $t('terms.content.default') }}</p>
        </slot>
      </div>
    </ScrollPanel>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          v-if="!blocking"
          :label="$t('common.cancel')"
          severity="secondary"
          outlined
          @click="$emit('cancel')"
          :disabled="loading"
        />
        <Button
          :label="loading ? $t('common.accepting') : $t('common.accept')"
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

withDefaults(defineProps<Props>(), {
  blocking: false,
  loading: false
})

defineEmits<{
  'update:visible': [value: boolean]
  accept: []
  cancel: []
}>()
</script>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import Editor from 'primevue/editor'

export default defineComponent({
  name: 'AppEditor',
  components: {
    Editor,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorContent = ref(props.modelValue)

    watch(editorContent, (value) => {
      emit('update:modelValue', value)
    })

    return {
      editorContent,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <!-- ✅ Editor de texto -->
    <Editor
      v-model="editorContent"
      editorStyle="height: 150px"
      class="w-full !rounded-xl"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
    >
      <template v-slot:toolbar>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
          <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
          <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
        </span>
      </template>
    </Editor>

    <!-- 🔴 Mensaje de error -->
    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

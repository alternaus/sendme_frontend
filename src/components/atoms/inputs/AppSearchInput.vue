<script lang="ts">
import { computed, defineComponent } from 'vue'

import SearchIcon from '@/assets/svg/search.svg?component'

export default defineComponent({
  name: 'AppSearchInput',
  components: {
    SearchIcon,
  },
  props: {
    search: {
      type: String,
      required: true,
    },
  },
  emits: ['update:search'],
  setup(props, { emit }) {
    const isInputExpanded = computed(() => props.search.length > 0)

    const updateSearch = (event: Event) => {
      const target = event.target as HTMLInputElement
      emit('update:search', target.value)
    }

    const placeholder = computed(() => (isInputExpanded.value ? 'Buscar...' : ''))

    return {
      isInputExpanded,
      updateSearch,
      placeholder,
    }
  },
})
</script>

<template>
  <div class="box-search" :class="{ expanded: isInputExpanded }" v-tooltip.bottom="'Buscar'">
    <input
      type="text"
      class="input"
      :value="search"
      @input="updateSearch"
      :placeholder="placeholder"
    />
    <SearchIcon class="search fill-[var(--p-primary-color)]" />
  </div>
</template>

<style scoped>
.box-search {
  position: relative;
}

.input {
  padding: 10px;
  width: 35px;
  height: 35px;
  border: 1px solid var(--p-primary-color);
  border-radius: var(--radius-xl);
  box-sizing: border-box;
  font-size: 0.9rem;
  outline: none;
  transition: 0.5s;
}

.box-search:hover input,
.box-search.expanded input {
  width: 200px;
  background: transparent;
  border-radius: 15px;
}

.box-search .search {
  position: absolute;
  font-size: 1.2rem !important;
  top: 50%;
  right: -1px;
  transform: translate(-50%, -50%);
  font-size: 25px;
  background-color: transparent;
  transition: 0.2s;
}
</style>

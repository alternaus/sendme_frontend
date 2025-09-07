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
  <div class="box-search" :class="{ expanded: isInputExpanded }" v-tooltip.bottom="$t('common.general.search')">
    <input
      type="text"
      class="input sm"
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
  height: 35px;
  width: 100%;
  border: 1px solid var(--p-primary-color);
  border-radius: var(--radius-xl);
  box-sizing: border-box;
  font-size: 0.9rem;
  outline: none;
  transition: none;
}

@media (min-width: 640px) {
  .input {
    width: 40px;
    height: 40px;
    border-radius: 50px;
    transition: width 0.5s ease;
  }

  .box-search:hover .input,
  .box-search.expanded .input {
    width: 200px;
    background: transparent;
    /* border-radius: 15px;
    border-radius: 18px; */
  }
}

.box-search .search {
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translate(-50%, -50%);
  font-size: 25px;
  background-color: transparent;
  transition: 0.2s;
}
</style>

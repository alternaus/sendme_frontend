<script setup lang="ts">
import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'

defineProps<{
  isExpanded: boolean
  user?: {
    name?: string
    email?: string
    avatarUrl?: string
  }
}>()
</script>

<template>
  <div
    class="flex items-center p-2 border-black/10 dark:border-white/10"
    :class="{ 'justify-center': !isExpanded, 'gap-1': isExpanded }"
  >
    <AppAvatar class="cursor-pointer flex-shrink-0" :image="user?.avatarUrl" />
    <div
      class="flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-hidden"
      :class="{
        'w-0 opacity-0 ml-0': !isExpanded,
        'w-full opacity-100 ml-2': isExpanded,
      }"
    >
      <span
        class="text-sm font-semibold truncate transition-all duration-300 ease-in-out"
        :title="user?.name"
      >
        {{ user?.name }}
      </span>
      <span
        class="text-xs text-neutral-500 dark:text-neutral-400 truncate transition-all duration-300 ease-in-out"
        :title="user?.email"
      >
        {{ user?.email }}
      </span>
    </div>
  </div>
</template>

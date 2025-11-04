<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

import Drawer from 'primevue/drawer'

import Alterna from '@/assets/svg/alterna.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'

import type { IRoute } from '../interfaces/route.interface'

defineProps<{
  visible: boolean
  routes: IRoute[]
}>()

defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const currentRoute = useRoute()
const isDark = useDark({ selector: 'html' })
const openSubmenus = ref<Set<string>>(new Set())

const toggleSubmenu = (routePath: string) => {
  if (openSubmenus.value.has(routePath)) {
    openSubmenus.value.delete(routePath)
  } else {
    openSubmenus.value.add(routePath)
  }
}

const isRouteActive = (route: IRoute) => {
  const currentPath = currentRoute.path
  if (route.children) {
    return route.children.some(child => currentPath === child.path)
  }
  return currentPath === route.path
}

const isChildActive = (childPath: string) => {
  return currentRoute.path === childPath
}
</script>

<template>
  <Drawer
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :modal="true"
    position="left"
    style="width: 16rem"
  >
    <template #container="{ closeCallback }">
      <div
        class="flex flex-col h-full transition-colors duration-300"
        :class="
          isDark
            ? 'bg-[var(--p-surface-900)] text-[var(--p-surface-50)]'
            : 'bg-[var(--p-primary-color)] text-white'
        "
      >
        <!-- Header con logo -->
        <div class="py-2 px-2 flex items-center justify-between">
          <div class="w-10"></div>
          <router-link
            to="/"
            @click="closeCallback"
            class="flex items-center flex-1 justify-center"
          >
            <Logo
              :class="
                isDark
                  ? 'h-16 w-16 transition-all duration-500 ease-in-out fill-[var(--p-primary-color)]'
                  : 'h-16 w-16 transition-all duration-500 ease-in-out fill-black'
              "
            />
          </router-link>
          <div class="w-10 flex justify-end">
            <AppButton
              @click="closeCallback"
              icon="pi pi-times"
              size="small"
              text
              rounded
              :class="isDark ? '!text-[var(--p-primary-color)]' : '!text-white'"
            />
          </div>
        </div>

        <!-- Menu items -->
        <div class="flex-1 overflow-y-auto px-2 py-3">
          <ul class="space-y-1 w-full">
            <li v-for="route in routes" :key="route.path" class="w-full">
              <!-- Item sin hijos -->
              <router-link
                v-if="!route.children"
                :to="route.path"
                @click="closeCallback"
                class="group flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ease-in-out"
                :class="
                  isRouteActive(route)
                    ? isDark
                      ? 'bg-[var(--p-primary-color)]'
                      : 'bg-white'
                    : isDark
                      ? 'hover:bg-[var(--p-surface-800)]'
                      : 'hover:bg-white/10'
                "
              >
                <component
                  :is="route.icon"
                  :size="20"
                  :stroke-width="2"
                  class="flex-shrink-0 transition-colors duration-200"
                  :class="
                    isRouteActive(route)
                      ? isDark
                        ? 'text-[var(--p-surface-900)]'
                        : 'text-[var(--p-primary-color)]'
                      : isDark
                        ? 'text-[var(--p-primary-color)] group-hover:text-[var(--p-primary-color)]'
                        : 'text-white/90 group-hover:text-white'
                  "
                />
                <span
                  class="text-sm font-medium transition-all duration-200"
                  :class="
                    isRouteActive(route)
                      ? isDark
                        ? 'text-[var(--p-surface-900)]'
                        : 'text-[var(--p-primary-color)]'
                      : isDark
                        ? 'text-[var(--p-primary-color)] group-hover:text-[var(--p-primary-color)]'
                        : 'text-white/90 group-hover:text-white'
                  "
                >
                  {{ route.title }}
                </span>
              </router-link>

              <!-- Item con hijos (submenu) -->
              <div v-else class="w-full">
                <button
                  @click="toggleSubmenu(route.path)"
                  class="group flex items-center gap-3 w-full p-2.5 rounded-lg transition-all duration-200 ease-in-out"
                  :class="
                    isRouteActive(route)
                      ? isDark
                        ? 'bg-[var(--p-primary-color)]'
                        : 'bg-white'
                      : isDark
                        ? 'hover:bg-[var(--p-surface-800)]'
                        : 'hover:bg-white/10'
                  "
                >
                  <component
                    :is="route.icon"
                    :size="20"
                    :stroke-width="2"
                    class="flex-shrink-0 transition-colors duration-200"
                    :class="
                      isRouteActive(route)
                        ? isDark
                          ? 'text-[var(--p-surface-900)]'
                          : 'text-[var(--p-primary-color)]'
                        : isDark
                          ? 'text-[var(--p-primary-color)] group-hover:text-[var(--p-primary-color)]'
                          : 'text-white/90 group-hover:text-white'
                    "
                  />
                  <span
                    class="text-sm font-medium flex-1 text-left transition-all duration-200"
                    :class="
                      isRouteActive(route)
                        ? isDark
                          ? 'text-[var(--p-surface-900)]'
                          : 'text-[var(--p-primary-color)]'
                        : isDark
                          ? 'text-[var(--p-primary-color)] group-hover:text-[var(--p-primary-color)]'
                          : 'text-white/90 group-hover:text-white'
                    "
                  >
                    {{ route.title }}
                  </span>
                  <ChevronDown
                    :size="16"
                    class="transition-all duration-200"
                    :class="[
                      { 'rotate-180': openSubmenus.has(route.path) },
                      isRouteActive(route)
                        ? isDark
                          ? 'text-[var(--p-surface-900)]'
                          : 'text-[var(--p-primary-color)]'
                        : isDark
                          ? 'text-[var(--p-primary-color)]'
                          : 'text-white/90',
                    ]"
                  />
                </button>

                <!-- Submenu -->
                <div class="overflow-hidden">
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    leave-active-class="transition-all duration-150 ease-in"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-96"
                    leave-from-class="opacity-100 max-h-96"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <ul v-show="openSubmenus.has(route.path)" class="mt-1 ml-8 space-y-1">
                      <li v-for="child in route.children" :key="child.path">
                        <router-link
                          :to="child.path"
                          @click="closeCallback"
                          class="group flex items-center gap-2 p-2 pl-3 rounded-md transition-all duration-200"
                          :class="
                            isChildActive(child.path)
                              ? isDark
                                ? 'bg-[var(--p-primary-color)] text-[var(--p-surface-900)]'
                                : 'bg-white text-[var(--p-primary-color)]'
                              : isDark
                                ? 'text-[var(--p-primary-color)] hover:bg-[var(--p-surface-800)] hover:text-[var(--p-primary-color)]'
                                : 'text-white/90 hover:bg-white/10 hover:text-white'
                          "
                        >
                          <component
                            :is="child.icon"
                            v-if="child.icon"
                            :size="14"
                            :stroke-width="2"
                            class="flex-shrink-0 transition-colors duration-200"
                          />
                          <div
                            v-else
                            class="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                            :class="
                              isChildActive(child.path)
                                ? isDark
                                  ? 'bg-[var(--p-surface-900)]'
                                  : 'bg-[var(--p-primary-color)]'
                                : isDark
                                  ? 'bg-[var(--p-primary-color)] group-hover:bg-[var(--p-primary-color)]'
                                  : 'bg-white/90 group-hover:bg-white'
                            "
                          ></div>
                          <span class="text-xs font-medium">{{ child.title }}</span>
                        </router-link>
                      </li>
                    </ul>
                  </transition>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Alterna Logo -->
        <div class="relative mt-auto">
          <div class="flex items-center justify-center pb-4 px-2">
            <Alterna
              class="h-4 w-auto transition-all duration-300"
              :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-white'"
            />
          </div>
        </div>
      </div>
    </template>
  </Drawer>
</template>

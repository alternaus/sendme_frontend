<script setup lang='ts'>
import AppHeader from '@/components/molecules/header/AppHeader.vue';
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :text="$t('settings.title')" :actions="[]" />
</template>

<style lang='scss' scoped></style>

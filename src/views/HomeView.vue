<script setup lang="ts">
import { useRoute } from 'vue-router'

const { params,query } = useRoute()

console.log({ params,query })
</script>

<template>
  <main></main>
</template>

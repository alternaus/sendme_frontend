<script lang="ts">
import { defineComponent } from 'vue'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'

export default defineComponent({
  components: {
    AppCard,
    AppTable,
  },
})
</script>

<template>
  <div class="flex flex-col items-center h-screen w-full my-4">
    <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-8 w-full">
      <AppCard class="col-span-4 md:col-span-3 lg:col-span-2" />
      <AppCard class="col-span-4 md:col-span-3 lg:col-span-2" />
      <AppCard class="col-span-4 md:col-span-3 lg:col-span-3" />
      <AppCard class="col-span-4 md:col-span-3 lg:col-span-3" />
    </div>

    <AppTable
      class="w-full mt-8"
      :data="[
        { name: 'John Doe', email: '', phone: '' },
        { name: 'John Doe', email: '', phone: '' },
      ]"
      :headers="[
        { field: 'name', header: 'Name' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Phone' },
      ]"
      :pageSize="10"
      :pageCurrent="1"
      :totalItems="100"
    />
  </div>
</template>

<style lang="scss" scoped></style>

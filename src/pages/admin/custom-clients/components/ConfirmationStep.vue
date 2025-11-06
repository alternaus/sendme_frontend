<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold mb-2">{{ $t('custom_clients.form.confirmation.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('custom_clients.form.confirmation.subtitle') }}</p>
    </div>

    <div class="space-y-6">
      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-3">{{ $t('custom_clients.form.confirmation.organization_section') }}</h4>
        <dl class="grid grid-cols-2 gap-2 text-sm">
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.name') }}:</dt><dd class="font-medium">{{ organization.name }}</dd>
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.document') }}:</dt><dd>{{ organization.document }}</dd>
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.email') }}:</dt><dd>{{ organization.email }}</dd>
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.phone') }}:</dt><dd>{{ organization.phone }}</dd>
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.country') }}:</dt><dd>{{ organization.country }}</dd>
          <dt class="text-muted-foreground">{{ $t('custom_clients.fields.city') }}:</dt><dd>{{ organization.city }}</dd>
        </dl>
      </div>

      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-3">{{ $t('custom_clients.form.confirmation.plan_section') }}</h4>
        <p class="text-sm"><span class="text-muted-foreground">{{ $t('custom_clients.form.confirmation.plan_type_label') }}:</span>
          <span class="font-medium">{{ planType === 'existing' ? $t('custom_clients.form.confirmation.plan_existing') : $t('custom_clients.form.confirmation.plan_custom') }}</span>
        </p>
        <p v-if="planType === 'custom' && customPlan" class="text-sm mt-2">
          <span class="text-muted-foreground">{{ $t('custom_clients.form.custom_plan.plan_name') }}:</span> <span class="font-medium">{{ customPlan.planName }}</span>
        </p>
      </div>

      <div class="border rounded-lg p-4">
        <h4 class="font-semibold mb-3">{{ $t('custom_clients.form.confirmation.managers_section') }}</h4>
        <p class="text-sm">{{ $t('custom_clients.form.confirmation.manager_count', { count: managers.length }) }}</p>
        <ul class="mt-2 space-y-1">
          <li v-for="(manager, i) in managers" :key="i" class="text-sm">{{ manager.name }} ({{ manager.email }})</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ICustomPlanFormData, IManagerFormData, IOrganizationFormData } from '@/services/custom-client/interfaces/create-client.interface'

defineProps<{
  organization: IOrganizationFormData
  planType: 'existing' | 'custom'
  customPlan?: ICustomPlanFormData
  managers: IManagerFormData[]
}>()
</script>

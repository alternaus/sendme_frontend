<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ChannelIcon from '@/assets/svg/channel.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDateRangePicker from '@/components/atoms/datepickers/AppDateRangePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import type { IChannel } from '@/services/channel/interfaces/channel.interface'
import { useChannelService } from '@/services/channel/useChannelService'

interface Props {
  search?: string
  name?: string
  status?: string
  channelId?: string
  dateRange?: Date[]
}

interface Emits {
  'update:search': [value: string]
  'update:name': [value: string]
  'update:status': [value: string]
  'update:channelId': [value: string]
  'update:dateRange': [value: Date[]]
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  name: '',
  status: '',
  channelId: '',
  dateRange: () => [],
})

const emit = defineEmits<Emits>()

const { getChannels } = useChannelService()
const channels = ref<IChannel[]>([])
const loadingChannels = ref(false)
const updateField = (field: string, value: string | Date[] | null) => {
  switch (field) {
    case 'search':
      emit('update:search', value as string)
      break
    case 'name':
      emit('update:name', value as string)
      break
    case 'status':
      emit('update:status', value as string)
      break
    case 'channelId':
      emit('update:channelId', value as string)
      break
    case 'dateRange':
      emit('update:dateRange', value as Date[])
      break
    default:
  }
}

const fetchChannels = async () => {
  loadingChannels.value = true
  try {
    const response = await getChannels()
    if (response) {
      channels.value = response
    }
  } catch  {

  } finally {
    loadingChannels.value = false
  }
}



const channelOptions = computed(() =>
  channels.value.map(channel => ({
    value: channel.id.toString(),
    name: channel.name,
  }))
)

onMounted(() => {
  fetchChannels()
})
</script>

<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <AppInput
          :modelValue="search"
          type="text"
          class="w-full rounded-md mt-3"
          :label="$t('general.search')"
          @input="updateField('search', $event.target.value)"
        >
          <template #icon>
            <SearchIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>

        <AppInput
          :modelValue="name"
          type="text"
          class="w-full rounded-md mt-3"
          :label="$t('general.name')"
          @input="updateField('name', $event.target.value)"
        >
          <template #icon>
            <CredentialIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>

        <AppStatusSelect
          class="w-full mt-3"
          :modelValue="status"
          status-type="campaign"
          :label="$t('general.status')"
          :show-colors="true"
          @update:modelValue="updateField('status', $event as string)"
        >
          <template #icon>
            <StatusIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppStatusSelect>

        <AppSelect
          class="w-full mt-3"
          :modelValue="channelId"
          :options="channelOptions"
          :label="$t('campaign.channel')"
          @update:modelValue="updateField('channelId', $event as string)"
        >
          <template #icon>
            <ChannelIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>

        <AppDateRangePicker

          class="w-full mt-3"
          :modelValue="props.dateRange"
          :label="$t('general.date_range')"
          @update:modelValue="updateField('dateRange', $event)"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDateRangePicker>
      </div>
    </template>
  </AppCard>
</template>

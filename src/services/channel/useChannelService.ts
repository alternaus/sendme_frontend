import { useApiClient } from '@/composables/useApiClient'

import type { IChannel } from './interfaces/channel.interface'

export const useChannelService = () => {
  const privateApi = useApiClient(true)

  const listChannels = async () => {
    return privateApi.get<IChannel[]>('/channels')
  }

  return {
    listChannels,
  }
}

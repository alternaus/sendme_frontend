import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { ICampaign } from './interfaces/campaign.interface'
import type { ICreateCampaign } from './interfaces/create-campaign.interface'
import type { IFilterCampaign } from './interfaces/filter-campaign.interface'
import type { IUpdateCampaign } from './interfaces/update-campaign.interface'


export const useCampaignService = () => {
  const privateApi = useApiClient(true)

  const getCampaigns = async (query?: IFilterCampaign) => {
    return privateApi.get<IPaginationResponse<ICampaign>>('/campaigns', {
      params: { ...query },
    })
  }

  const getCampaign = async (id: string) => {
    return privateApi.get<ICampaign>(`/campaigns/${id}`)
  }

  const createCampaign = async (campaign: ICreateCampaign) => {
    return privateApi.post<ICampaign, ICreateCampaign>('/campaigns', campaign)
  }

  const updateCampaign = async (id: string, campaign: IUpdateCampaign) => {
    return privateApi.patch<IUpdateCampaign>(`/campaigns/${id}`, campaign)
  }

  const deleteCampaign = async (id: number) => {
    return privateApi.delete(`/campaigns/${id}`)
  }

  return {
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign
  }
}

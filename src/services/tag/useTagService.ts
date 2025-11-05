import { useApiClient } from '@/composables/useApiClient'

import type { ICreateTag, ITag, ITagWithCounts, IUpdateTag } from './interfaces'

export const useTagService = () => {
  const privateApi = useApiClient(true)

  const listTags = async (): Promise<ITag[]> => {
    return privateApi.get<ITag[]>('/tags')
  }

  const listTagsWithCounts = async (): Promise<ITagWithCounts[]> => {
    return privateApi.get<ITagWithCounts[]>('/tags/with-counts')
  }

  const getTag = async (id: string): Promise<ITag> => {
    return privateApi.get<ITag>(`/tags/${id}`)
  }

  const createTag = async (tag: ICreateTag): Promise<ITag> => {
    return privateApi.post<ITag, ICreateTag>('/tags', tag)
  }

  const updateTag = async (id: string, tag: IUpdateTag): Promise<ITag> => {
    return privateApi.patch<ITag, IUpdateTag>(`/tags/${id}`, tag)
  }

  const deleteTag = async (id: string): Promise<{ message: string; id: string }> => {
    return privateApi.delete<{ message: string; id: string }>(`/tags/${id}`)
  }

  return {
    listTags,
    listTagsWithCounts,
    getTag,
    createTag,
    updateTag,
    deleteTag,
  }
}

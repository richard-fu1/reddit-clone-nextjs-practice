import { atom } from 'recoil'

export interface Community {
  id: string
  creatorId: string
  numberOfMembers: number
  privacyType: 'public' | 'restricted' | 'private'
  createdAt?: Date
  imageURL?: string
}

export interface CommunitySnippet {
  communityId: string
  isModerator?: boolean
  imageURL?: string
}

interface CommunityState {
  mySnippets: CommunitySnippet[]
  currentCommunity?: Community
  publicCommunities: CommunitySnippet[]
  snippetsFetched: boolean
}

const defaultCommunityState: CommunityState = {
  mySnippets: [],
  publicCommunities: [],
  snippetsFetched: false,
}

export const communityState = atom<CommunityState>({
  key: 'communitiesState',
  default: defaultCommunityState,
})

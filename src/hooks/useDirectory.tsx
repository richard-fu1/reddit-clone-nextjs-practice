import { communityState } from '@/atoms/communitiesAtom'
import {
  DirectoryMenuItem,
  defaultMenuItem,
  directoryMenuState,
} from '@/atoms/directoryMenuAtom'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { AccountCircleSharp } from '@mui/icons-material'
import { useRecoilState, useRecoilValue } from 'recoil'

const useDirectory = () => {
  const [directoryState, setDirectoryState] = useRecoilState(directoryMenuState)
  const router = useRouter()
  const communityStateValue = useRecoilValue(communityState)

  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }))
    router.push(menuItem.link)
    if (directoryState.isOpen) toggleMenuOpen()
  }

  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({ ...prev, isOpen: !prev.isOpen }))
  }

  useEffect(() => {
    const { currentCommunity } = communityStateValue
    if (currentCommunity) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: `r/${currentCommunity.id}`,
          link: `/r/${currentCommunity.id}`,
          imageURL: currentCommunity.imageURL,
          icon: AccountCircleSharp,
          iconColor: 'blue.500',
        },
      }))
    } else {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: defaultMenuItem,
      }))
    }
  }, [communityStateValue.currentCommunity])

  return { directoryState, toggleMenuOpen, onSelectMenuItem }
}
export default useDirectory

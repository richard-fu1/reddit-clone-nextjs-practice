import { Flex, Image, Spinner } from '@chakra-ui/react'
import React, { useState } from 'react'
import SearchInput from './SearchInput'
import RightContent from './RightContent/RightContent'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase/clientApp'
import Directory from './Directory/Directory'
import useDirectory from '@/hooks/useDirectory'
import { defaultMenuItem } from '@/atoms/directoryMenuAtom'
import { useSetRecoilState } from 'recoil'
import { communityState } from '@/atoms/communitiesAtom'

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth)
  const { onSelectMenuItem } = useDirectory()
  const setCommunityStateValue = useSetRecoilState(communityState)
  return (
    <Flex bg='white' height='44px' padding='6px 12px' justify={'space-between'}>
      <Flex
        align='center'
        width={{ base: '40px', md: 'auto' }}
        mr={{ base: 0, md: 2 }}
        cursor='pointer'
        onClick={async () => {
          onSelectMenuItem(defaultMenuItem)
          // setCommunityStateValue((prev) => ({
          //   ...prev,
          //   currentCommunity: undefined,
          // }))
        }}
      >
        <Image src='/images/redditFace.svg' height='30px' />
        <Image
          src='/images/redditText.svg'
          height='46px'
          display={{ base: 'none', md: 'unset' }}
        />
      </Flex>
      {user && <Directory />}
      <SearchInput user={user} />
      <RightContent user={user} />
    </Flex>
  )
}
export default Navbar

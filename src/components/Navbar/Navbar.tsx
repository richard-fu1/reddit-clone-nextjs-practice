import { Flex, Image } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SearchInput from './SearchInput'
import RightContent from './RightContent/RightContent'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase/clientApp'
import Directory from './Directory/Directory'
import useDirectory from '@/hooks/useDirectory'
import { defaultMenuItem } from '@/atoms/directoryMenuAtom'

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth)
  const [userLoading, setUserLoading] = useState(false)
  const { onSelectMenuItem } = useDirectory()
  useEffect(() => {
    setUserLoading(!loading)
  }, [setUserLoading, loading])
  return (
    userLoading && (
      <Flex
        bg='white'
        height='44px'
        padding='6px 12px'
        justify={'space-between'}
      >
        <Flex
          align='center'
          width={{ base: '40px', md: 'auto' }}
          mr={{ base: 0, md: 2 }}
          cursor='pointer'
          onClick={async () => {
            onSelectMenuItem(defaultMenuItem)
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
  )
}
export default Navbar

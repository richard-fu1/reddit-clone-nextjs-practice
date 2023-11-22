import { IAuthModalState, authModalState } from '@/atoms/authModalAtom'
import { Flex } from '@chakra-ui/react'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Login from './Login'
import SignUp from './SignUp'

type AuthInputsProps = {}

const AuthInputs: React.FC<AuthInputsProps> = () => {
  const modalState = useRecoilValue(authModalState)
  const showComponent = (val: IAuthModalState['view']) => {
    switch (val) {
      case 'login':
        return <Login />
      case 'signup':
        return <SignUp />
      default:
        return <></>
    }
  }
  return (
    <Flex direction='column' align='center' width='100%' mt={4}>
      {showComponent(modalState.view)}
    </Flex>
  )
}
export default AuthInputs

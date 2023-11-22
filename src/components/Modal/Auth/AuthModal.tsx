import { IAuthModalState, authModalState } from '@/atoms/authModalAtom'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Flex,
  Text,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import AuthInputs from './AuthInputs'
import OAuthButtons from './OAuthButtons'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase/clientApp'
import ResetPassword from './ResetPassword'

const AuthModal: React.FC = () => {
  // const { isOpen, onOpen, onClose } = useDisclosure()
  const [modalState, setModalState] = useRecoilState(authModalState)
  const [user, loading, error] = useAuthState(auth)

  const handleClose = () => {
    setModalState((prev) => {
      return { ...prev, open: false }
    })
  }
  const showTitle = (val: IAuthModalState['view']) => {
    switch (val) {
      case 'login':
        return 'Login'
      case 'signup':
        return 'Sign Up'
      case 'resetPassword':
        return 'Reset Password'
    }
  }

  useEffect(() => {
    if (user) handleClose()
  }, [user])

  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign='center'>
            {showTitle(modalState.view)}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
          >
            <Flex
              direction='column'
              align='center'
              justify='center'
              width='70%'
            >
              {modalState.view === 'login' || modalState.view === 'signup' ? (
                <>
                  <OAuthButtons />
                  <Text color='gray.500' fontWeight={700}>
                    OR
                  </Text>
                  <AuthInputs />
                </>
              ) : (
                <ResetPassword />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AuthModal

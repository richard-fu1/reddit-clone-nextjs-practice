import { Button, Flex, Image, Text } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { auth, firestore } from '@/firebase/clientApp'
import { doc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'

const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth)

  // Alternate method instead of using Firebase functions, will not work because of Database permissions (i.e. user must be signed in to update db)
  // const createUserDocument = async (user: User) => {
  //   const userDocRef = doc(firestore, 'users', user.uid)
  //   await setDoc(userDocRef, JSON.parse(JSON.stringify(user)))
  // }

  // useEffect(() => {
  //   if (user) {
  //     createUserDocument(user.user)
  //   }
  // }, [user])

  return (
    <Flex direction='column' width='100%' mb={4}>
      <Button
        variant='oauth'
        mb={2}
        isLoading={loading}
        onClick={() => signInWithGoogle()}
      >
        <Image src='/images/googlelogo.png' height='20px' mr={4} />
        Continue With Google
      </Button>
      <Button variant='oauth' mb={2}>
        Some Other Provider
      </Button>
      {error && (
        <Text textAlign='center' color='red' fontSize='10pt'>
          {error.message}
        </Text>
      )}
    </Flex>
  )
}
export default OAuthButtons

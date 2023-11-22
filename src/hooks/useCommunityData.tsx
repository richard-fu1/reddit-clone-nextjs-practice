import { authModalState } from '@/atoms/authModalAtom'
import {
  Community,
  CommunitySnippet,
  communityState,
} from '@/atoms/communitiesAtom'
import { auth, firestore } from '@/firebase/clientApp'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useSetRecoilState } from 'recoil'

const useCommunityData = () => {
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)
  const setAuthModalState = useSetRecoilState(authModalState)
  const [user] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    if (!user) {
      setAuthModalState({ open: true, view: 'login' })
      return
    }
    setLoading(true)
    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }
    joinCommunity(communityData)
  }

  const getMySnippets = async () => {
    setLoading(true)

    try {
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      )

      const snippets = snippetDocs.docs.map((doc) => ({
        ...doc.data(),
      }))
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetsFetched: true,
      }))
    } catch (e: any) {
      console.log('getMySnippets error', e)
      setError(e.message)
    }
    setLoading(false)
  }
  const joinCommunity = async (communityData: Community) => {
    setLoading(true)
    try {
      const batch = writeBatch(firestore)

      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || '',
        isModerator: user?.uid === communityData.creatorId,
      }

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      )
      batch.update(doc(firestore, 'communities', communityData.id), {
        numberOfMembers: increment(1),
      })
      await batch.commit()

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }))
    } catch (e: any) {
      console.log('joinCommunity error', e)
      setError(e.message)
    }
    setLoading(false)
  }

  const leaveCommunity = async (communityId: string) => {
    setLoading(true)
    try {
      const batch = writeBatch(firestore)

      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      )

      batch.update(doc(firestore, 'communities', communityId), {
        numberOfMembers: increment(-1),
      })

      await batch.commit()

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }))
    } catch (e: any) {
      console.log('leaveCommunity error', e)
      setError(e.message)
    }
    setLoading(false)
  }

  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(firestore, 'communities', communityId)
      const communityDoc = await getDoc(communityDocRef)
      const communityDocData = communityDoc.data()
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDocData,
          createdAt: communityDocData?.createdAt.toDate(),
        } as Community,
      }))
    } catch (e: any) {
      console.log('getCommunityData error', e)
    }
  }

  const getPublicCommunities = async () => {
    try {
      const postQuery = query(
        collection(firestore, 'communities'),
        where('privacyType', '==', 'public')
      )
      const postDoc = await getDocs(postQuery)
      setCommunityStateValue((prev) => ({
        ...prev,
        publicCommunities: postDoc.docs.map((doc) => ({ communityId: doc.id })),
      }))
    } catch (e: any) {
      console.log('getPublicCommunities error', e)
    }
  }

  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
        snippetsFetched: false,
      }))
      return
    }
    getMySnippets()
  }, [user])

  useEffect(() => {
    const { communityId } = router.query

    if (communityId && !communityStateValue.currentCommunity?.id) {
      getCommunityData(communityId as string)
    }
  }, [router.query, communityStateValue.currentCommunity])

  return {
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
    getPublicCommunities,
  }
}
export default useCommunityData

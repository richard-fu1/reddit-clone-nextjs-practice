import { authModalState } from '@/atoms/authModalAtom'
import { communityState } from '@/atoms/communitiesAtom'
import { Post, PostVote, postState } from '@/atoms/postAtom'
import { auth, firestore, storage } from '@/firebase/clientApp'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

const usePosts = () => {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [postStateValue, setPostStateValue] = useRecoilState(postState)
  const currentCommunity = useRecoilValue(communityState).currentCommunity
  const setAuthModalState = useSetRecoilState(authModalState)

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation()
    if (!user?.uid) {
      setAuthModalState({ open: true, view: 'login' })
      return
    }
    try {
      const { voteStatus } = post
      const existingVote = postStateValue.postVotes.find(
        (item) => item.postId === post.id
      )
      const batch = writeBatch(firestore)
      const updatedPost = { ...post }
      const updatedPosts = [...postStateValue.posts]
      let updatedPostVotes = [...postStateValue.postVotes]
      let voteChange = vote

      // new vote
      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, 'users', `${user?.uid}/postVotes`)
        )

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id,
          communityId,
          voteValue: vote,
        }
        batch.set(postVoteRef, newVote)
        updatedPostVotes = [...updatedPostVotes, newVote]
      } else {
        const postVoteRef = doc(
          firestore,
          'users',
          `${user?.uid}/postVotes/${existingVote.id}`
        )
        if (existingVote.voteValue === vote) {
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          )
          batch.delete(postVoteRef)
          voteChange *= -1
        } else {
          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          )
          updatedPostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          }

          batch.update(postVoteRef, {
            voteValue: vote,
          })

          voteChange = 2 * vote
        }
      }
      updatedPost.voteStatus = voteStatus + voteChange

      const postRef = doc(firestore, 'posts', post.id)
      batch.update(postRef, { voteStatus: voteStatus + voteChange })
      await batch.commit()

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      )

      updatedPosts[postIdx] = updatedPost
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      }))

      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatedPost,
        }))
      }
    } catch (e: any) {
      console.log('onVote error', e)
    }
  }

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }))
    router.push(`/r/${post.communityId}/comments/${post.id}`)
  }

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`)
        await deleteObject(imageRef)
      }

      const postDocRef = doc(firestore, 'posts', post.id!)
      await deleteDoc(postDocRef)
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }))

      return true
    } catch (e: any) {
      return false
    }
  }

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, 'users', `${user?.uid}/postVotes`),
      where('communityId', '==', communityId)
    )

    const postVoteDocs = await getDocs(postVotesQuery)
    const postVotes = postVoteDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVotes as PostVote[],
    }))
  }

  useEffect(() => {
    if (!user || !currentCommunity?.id) {
      return
    }
    getCommunityPostVotes(currentCommunity?.id)
  }, [currentCommunity, user])

  useEffect(() => {
    if (!user) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }))
    }
  }, [user])

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  }
}
export default usePosts

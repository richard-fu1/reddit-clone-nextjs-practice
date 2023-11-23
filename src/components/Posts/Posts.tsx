import { Community } from '@/atoms/communitiesAtom'
import { Post } from '@/atoms/postAtom'
import { auth, firestore } from '@/firebase/clientApp'
import usePosts from '@/hooks/usePosts'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import PostItem from './PostItem'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Stack } from '@chakra-ui/react'
import PostLoader from './PostLoader'

type PostsProps = {
  communityData: Community
}

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [loading, setLoading] = useState(false)
  const [user] = useAuthState(auth)
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onDeletePost,
    onSelectPost,
  } = usePosts()
  const getPosts = async () => {
    setLoading(true)
    try {
      const postsQuery = query(
        collection(firestore, 'posts'),
        where('communityId', '==', communityData.id),
        orderBy('createdAt', 'desc')
      )
      const postDocs = await getDocs(postsQuery)
      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }))
    } catch (e: any) {
      console.log('getPosts error', e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getPosts()
  }, [communityData])

  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack>
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.uid == item.creatorId}
              userVoteValue={
                postStateValue.postVotes.find((vote) => vote.postId === item.id)
                  ?.voteValue
              }
              onVote={onVote}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
            />
          ))}
        </Stack>
      )}
    </>
  )
}
export default Posts

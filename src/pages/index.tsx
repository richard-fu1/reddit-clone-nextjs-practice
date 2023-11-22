import { communityState } from '@/atoms/communitiesAtom'
import { Post, PostVote } from '@/atoms/postAtom'
import CreatePostLink from '@/components/Community/CreatePostLink'
import PersonalHome from '@/components/Community/PersonalHome'
import Premium from '@/components/Community/Premium'
import Recommendations from '@/components/Community/Recommendations'
import PageContent from '@/components/Layout/PageContent'
import PostItem from '@/components/Posts/PostItem'
import PostLoader from '@/components/Posts/PostLoader'
import { auth, firestore } from '@/firebase/clientApp'
import useCommunityData from '@/hooks/useCommunityData'
import usePosts from '@/hooks/usePosts'
import { Stack } from '@chakra-ui/react'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useRecoilValue } from 'recoil'

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)
  const { getPublicCommunities } = useCommunityData()
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts()

  const buildUserHomeFeed = async () => {
    setLoading(true)
    try {
      if (communityStateValue.mySnippets.length) {
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        )

        const postQuery = query(
          collection(firestore, 'posts'),
          where('communityId', 'in', myCommunityIds),
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        const postDocs = await getDocs(postQuery)
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }))
      } else {
        buildNoUserHomeFeed()
      }
    } catch (e: any) {
      console.log('buildUserHomeFeed error', e)
    }
    setLoading(false)
  }

  const buildNoUserHomeFeed = async () => {
    setLoading(true)
    try {
      const postQuery = query(
        collection(firestore, 'posts'),
        where(
          'communityId',
          'in',
          // ['test12321']
          communityStateValue.publicCommunities.map(
            (community) => community.communityId
          )
        ),
        orderBy('voteStatus', 'desc'),
        limit(10)
      )
      const postDocs = await getDocs(postQuery)
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPostStateValue((prev) => ({ ...prev, posts: posts as Post[] }))
    } catch (e: any) {
      console.log('buildNoUserHomeFeed error', e)
    }
    setLoading(false)
  }

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id)
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where('postId', 'in', postIds)
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
    } catch (e: any) {
      console.log('getUserPostVotes error', e)
    }
  }

  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: undefined,
    }))
  }, [])
  useEffect(() => {
    getPublicCommunities()
  }, [])

  useEffect(() => {
    if (communityStateValue.snippetsFetched) {
      buildUserHomeFeed()
    }
  }, [communityStateValue.snippetsFetched])

  useEffect(() => {
    if (
      !user &&
      !loadingUser &&
      communityStateValue.publicCommunities.length > 0
    ) {
      buildNoUserHomeFeed()
    }
  }, [user, loadingUser, communityStateValue.publicCommunities])

  useEffect(() => {
    if (user && postStateValue.posts.length) {
      getUserPostVotes()
    }

    return () => {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }))
    }
  }, [user, postStateValue.posts])

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map((post) => (
              // <></>
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                homePage
              />
            ))}
          </Stack>
        )}
      </>
      <Stack spacing={5}>
        <Recommendations />
        <Premium />
        <PersonalHome />
      </Stack>
    </PageContent>
  )
}

export default Home

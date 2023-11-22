import { Community, communityState } from '@/atoms/communitiesAtom'
import { GetServerSidePropsContext } from 'next'
import React, { useEffect } from 'react'
import safeJsonStringify from 'safe-json-stringify'
import { firestore, verifyUser } from '@/firebase/firebaseAdmin'
// import nookies from 'nookies'
import CommunityNotFound from '@/components/Community/CommunityNotFound'
import Header from '@/components/Community/Header'
import PageContent from '@/components/Layout/PageContent'
import CreatePostLink from '@/components/Community/CreatePostLink'
import Posts from '@/components/Posts/Posts'
import { useSetRecoilState } from 'recoil'
import About from '@/components/Community/About'
import { Timestamp } from 'firebase/firestore'

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState)

  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: communityData,
    }))
  }, [communityData, setCommunityStateValue])

  if (!communityData) {
    return <CommunityNotFound />
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    // await verifyUser(nookies.get(context).token)
    const communityDoc = await firestore
      .collection('communities')
      .doc(context.query.communityId as string)
      .get()

    const data = communityDoc.exists ? communityDoc.data() : null
    return {
      props: {
        communityData: data
          ? JSON.parse(
              safeJsonStringify({
                id: communityDoc.id,
                ...data,
                createdAt: data.createdAt
                  ? (data.createdAt as Timestamp).toDate()
                  : undefined,
              })
            )
          : null,
      },
    }
  } catch (error) {
    console.log('getServerSideProps error', error)
  }
}

export default CommunityPage

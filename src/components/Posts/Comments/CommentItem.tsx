import { Box, Flex, Icon, Spinner, Stack, Text } from '@chakra-ui/react'
import moment from 'moment'
import React from 'react'
import { AccountCircleSharp } from '@mui/icons-material'
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from 'react-icons/io5'

export type Comment = {
  id: string
  creatorId: string
  creatorDisplayText: string
  communityId: string
  postId: string
  postTitle: string
  text: string
  createdAt: Date
}

type CommentItemProps = {
  comment: Comment
  onDeleteComment: (comment: Comment) => void
  loadingDelete: boolean
  userId: string
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDeleteComment,
  loadingDelete,
  userId,
}) => {
  return (
    <Flex>
      <Box mr={2}>
        <Icon as={AccountCircleSharp} fontSize={30} color='gray.300' />
      </Box>
      <Stack spacing={1}>
        <Stack direction='row' align='center' spacing={2} fontSize='8pt'>
          <Text
            fontWeight={700}
            _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {comment.creatorDisplayText}
          </Text>
          <Text
            color='gray.600'
            _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {moment(comment.createdAt).fromNow()}
          </Text>
          {loadingDelete && <Spinner size='sm' />}
        </Stack>
        <Text fontSize='10pt'>{comment.text}</Text>
        <Stack
          direction='row'
          align='center'
          cursor='pointer'
          color='gray.500'
          fontWeight={600}
        >
          <Icon as={IoArrowUpCircleOutline} />
          <Icon as={IoArrowDownCircleOutline} />
          {userId === comment.creatorId && (
            <>
              <Text fontSize='9pt' _hover={{ color: 'blue.500' }}>
                Edit
              </Text>
              <Text
                fontSize='9pt'
                _hover={{ color: 'blue.500' }}
                onClick={() => onDeleteComment(comment)}
              >
                Delete
              </Text>
            </>
          )}
        </Stack>
      </Stack>
    </Flex>
  )
}
export default CommentItem

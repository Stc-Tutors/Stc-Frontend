'use client';

import { Box, Text, Heading, Link, Image } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { use } from 'react';

export default function TutoringCard({ data }: {
  data: {
    category: string,
    title: string,
    description: string,
    svg: any
  }
}) {

  const route = useRouter();

  return (
    <Box
      className='tutorCard'
      bg="white"
      p={6}
      mb="20px"
      borderRadius="lg"
      boxShadow="md"
      border="1px solid #E2E8F0"
    >
      <Text fontSize="sm" color="orange.400" fontWeight="bold" mb={2}>
        {data.title}
      </Text>
      <Box
        bg="gray.100"
        p={4}
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
      >
        {data.svg}
      </Box>
      <Heading size="md" mb={2}>
        {data.category}
      </Heading>
      <Text
        fontSize="sm"
        h="84px"
        color="gray.600"
        display="-webkit-box"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="normal"
        css={{
          WebkitLineClamp: 4, // Adjust based on how many lines you want to show
          WebkitBoxOrient: 'vertical'
        }}
      >
        {data.description}
      </Text>
      <Box onClick={()=>route.push("single_service")} color="blue.500" fontWeight="bold" mt={3} display="inline-block">
        Learn More →
      </Box>
    </Box>
  );
}

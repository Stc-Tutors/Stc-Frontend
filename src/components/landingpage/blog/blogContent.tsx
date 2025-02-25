'use client';

import { COLORS } from '@/components/utils/theme';
import { Box, Text, Heading, Link, Image, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function BlogContent({ data, number }: {
  data: {
    title: string,
    category: string,
    description: string,
    image: string
  }, number: number
}) {

 const router = useRouter()

  return (
    <Box
      w={ "full"}
      borderRadius="lg"
      overflow="hidden"
      mb="20px"
      className={number > 0.1? 'tutorCard':""}
      bg="white"
      boxShadow="md"
    >
      <Image
        src="/image/blog/image.png" // Replace with actual image path
        alt="Student Studying"
        width="100%"
        height="auto"
      />

      <Box p={6}>
        <Text fontSize="sm" fontWeight="bold" color={COLORS.yellow}>
          {data.title}
        </Text>

        <Heading size="lg" mt={2}>
          {data.category}
        </Heading>

        <Text fontSize="md" color="gray.600" mt={2}>
          {data.description}
        </Text>

        <Box cursor="pointer" onClick={()=>router.push("/single_blog")} color="blue.500" fontWeight="bold" mt={3} display="inline-block">
          Read More →
        </Box>
      </Box>
    </Box>
  );
}

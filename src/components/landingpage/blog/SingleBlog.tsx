'use client';

import { COLORS } from '@/components/utils/theme';
import { Box, Image, Text, Heading, VStack, Center } from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function SingleBlog() {

    const router = useRouter();

    return (
        <Box maxW="container.md" mx="auto" bg="white" borderRadius="lg" overflow="hidden" boxShadow="md">
            {/* Feature Image */}
            <Box pos="relative">
                <Image
                    src="/image/blog/image.png" // Replace with actual image path
                    alt="Grandfather and Grandson Playing Chess"
                    width="100%"
                    height="auto"
                />
                <Center onClick={()=>router.back()} bg={COLORS.blue} w="40px" h="40px" borderRadius={"40px"} pos="absolute" top="20px" left="20px">
                    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5H15M1 5L5 9M1 5L5 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </Center>
            </Box>
            {/* Content */}
            <Box p={6}>
                <Text fontSize="sm" fontWeight="bold" color={COLORS.yellow}>
                    The Game That Sharpens Your Mind
                </Text>

                <Heading size="lg" mt={2}>
                    50 Mental Benefits For Playing Chess Games
                </Heading>

                <Text fontSize="md" color="gray.600" mt={3} lineHeight="1.6">
                    Chess isn't just a game; it's a mental workout. It stimulates the brain and strengthens logical
                    reasoning, pattern recognition, and problem-solving skills. Studies show that people who play
                    chess regularly experience enhanced cognitive functions, improved concentration, and better memory retention.
                    <br />
                    <br />
                    Research also highlights its impact on creativity, strategic thinking, and decision-making. The game
                    encourages planning and foresight, which can be applied to real-life scenarios. Moreover, playing chess
                    from a young age can contribute to academic excellence, particularly in subjects that require analytical skills.
                    <br />
                    <br />
                    In addition, chess fosters patience and emotional resilience. Learning to deal with setbacks and adapt
                    strategies mid-game builds perseverance and critical thinking. Whether played recreationally or competitively,
                    chess offers lifelong cognitive and psychological benefits.
                </Text>
            </Box>
        </Box>
    );
}

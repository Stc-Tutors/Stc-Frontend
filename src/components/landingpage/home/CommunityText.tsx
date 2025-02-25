'use client';

import { COLORS } from '@/components/utils/theme';
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react';

const CommunityText = () => {
    return (
        <Center
            mt="40px"
            flexDir="column"
            pl={["20px", "20px", "20px", "120px"]}
            pr={["20px", "20px", "20px", "80px"]}
            alignItems={"flex-start"}
        >
            <Box>
                <Text fontSize={["16px", "16px", "16px", "24px"]} color={COLORS.blue} fontWeight="600">
                    Be part of a dynamic learning community
                </Text>
                <Text lineHeight={["30px", "30px", "30px", "60px"]} fontSize={["24px", "24px", "24px", "48px"]} fontWeight="700" color={COLORS.black} mt={2}>
                    Join our community of 8000+ learners
                </Text>
                <Text lineHeight={["18px", "18px", "18px", "29.05px"]} fontSize={["16px", "16px", "16px", "24px"]} color={COLORS.gray} fontWeight="700" mt={3}>
                    Our vibrant network of over 8,000 learners, expert instructors, and
                    industry professionals creates an enriching environment for growth and
                    collaboration
                </Text>
                <Button colorScheme="blue" w={["full","full","full","171px"]} height="46px" mt={["32px","32px","32px","64px"]} fontSize={["14px","14px","14px","18px"]} bg={COLORS.blue}>
                    Start Learning
                </Button>
            </Box>
        </Center>
    );
};

export default CommunityText;

'use client';

import { COLORS } from '@/components/utils/theme';
import { Box, Button, Center, Text, VStack } from '@chakra-ui/react';

const ExpertText = () => {
    return (
        <Center
            mt="40px"
            flexDir="column"
            pl={["20px", "20px", "20px", "0px"]}
            pr={["20px", "20px", "20px", "120px"]}
            alignItems={"flex-start"}
        >
            <Box>
                <Text fontSize={["16px", "16px", "16px", "24px"]} color={COLORS.blue} fontWeight="600">
                Over 1200+ vetted and carefully picked tutors
                </Text>
                <Text lineHeight={["30px", "30px", "30px", "60px"]} fontSize={["24px", "24px", "24px", "48px"]} fontWeight="700" color={COLORS.black} mt={2}>
                Get expert tutoring from qualified educators
                </Text>
                <Text lineHeight={["18px", "18px", "18px", "29.05px"]} fontSize={["16px", "16px", "16px", "24px"]} color={COLORS.gray} fontWeight="700" mt={3}>
                Learn with confidence from our carefully selected tutors who meet the highest standards of expertise and quality
                </Text>
                <Button colorScheme="blue" w={["full","full","full","136px"]} height="46px" mt={["32px","32px","32px","64px"]} fontSize={["14px","14px","14px","18px"]} bg={COLORS.blue}>
                Find Tutor
                </Button>
            </Box>
        </Center>
    );
};

export default ExpertText;

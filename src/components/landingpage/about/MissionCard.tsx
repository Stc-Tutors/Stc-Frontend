// components/MissionCard.tsx
import { COLORS } from "@/components/utils/theme";
import { Box, Heading, Text, Highlight } from "@chakra-ui/react";

const MissionCard = () => {
    return (
        <Box
            bg={COLORS.white}
            p={"20px"}
            borderRadius="lg"
            boxShadow="md"
            w={["full", "500px"]}
            h="-webkit-fit-content"
        >
            <Text fontSize="sm" fontWeight="bold" color={COLORS.yellow}>
                Our Mission
            </Text>
            <Heading size="36px" lineHeight="45.36px" mt={2}>
                We bridge the gap between students and educators
            </Heading>
            <Text mt={1} fontSize="sm" color={COLORS.gray}>
                STC Edu. Consult connects students with qualified tutors and provides
                comprehensive educational services that promote academic excellence,
                personal growth, and lifelong learning in a secure and supportive
                virtual learning environment.
            </Text>
        </Box>
    );
};

export default MissionCard;

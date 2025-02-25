// components/MissionCard.tsx
import { COLORS } from "@/components/utils/theme";
import { Box, Heading, Text, Highlight } from "@chakra-ui/react";

const MissionCard2 = () => {
    return (
        <Box
            bg={COLORS.white}
            p={"20px"}
            mt={["20px", "20px", "20px", "0px"]}
            borderRadius="lg"
            boxShadow="md"
            w={["full", "500px"]}
            h="-webkit-fit-content"
        >
            <Text fontSize="sm" fontWeight="bold" color={COLORS.yellow}>
                Our Vision
            </Text>
            <Heading size="36px" lineHeight="45.36px" mt={2}>
                We make quality tutoring accessible to everyone
            </Heading>
            <Text mt={1} fontSize="sm" color={COLORS.gray}>
                Our vision is to be a global leader in online education, empowering individuals of all ages to achieve their academic and personal potential through innovative and accessible learning solutions.
            </Text>
            <Box h="20px" />
        </Box>
    );
};

export default MissionCard2;

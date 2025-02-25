import { COLORS } from "@/components/utils/theme";
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function BannerHero() {
    return (
        <Box
            mt="100px"
            pl={["20px", "20px", "20px", "190px"]}
            pr={["20px", "20px", "20px", "120px"]}
            bg="white"
        >
            <Heading fontSize={["20px", "20px", "20px", "40px"]} fontWeight="700">
            We are Your Complete <br /><Text as="span" color="blue.600">Learning Solution </Text> to Education, Skills & Development
            </Heading>
            <Text mt={["18px", "18px", "18px", "24px"]} fontSize={["18px", "18px", "18px", "24px"]} fontWeight="700" lineHeight={["20px", "20px", "20px", "29px"]} color={COLORS.black}>
                We offer comprehensive solutions including academic tutoring, professional development,
                technology training, skill acquisition, and personal counseling.
            </Text>
        </Box>
    );
}

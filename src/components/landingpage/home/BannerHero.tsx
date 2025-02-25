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
            <Heading fontSize={["40px", "40px", "40px", "72px"]} lineHeight={["40px", "40px", "40px", "70.27px"]} fontWeight="700">
                We Bring <br /><Text as="span" color="blue.600">Excellence</Text> to your Doorstep
            </Heading>
            <Text mt={["18px", "18px", "18px", "24px"]} fontSize={["18px", "18px", "18px", "24px"]} fontWeight="700" lineHeight={["20px", "20px", "20px", "29px"]} color={COLORS.black}>
                We offer comprehensive solutions including academic tutoring, professional development,
                technology training, skill acquisition, and personal counseling.
            </Text>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} mt={["24px","24px","24px","64px"]} justify="left">
                <Button
                    w={["full", "full", "full", "184px"]}
                    h="48px"
                    border={`1px solid ${COLORS.blue}`}
                    _hover={{ bg: "gray.100" }}
                >
                    <Box mr="24px" color={COLORS.light_blue}>Take a Tour</Box>
                    <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5V17.5L14 9.5L1 1.5Z" stroke={COLORS.light_blue} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </Button>
                <Button fontSize="18px" w={["full", "full", "full","148px"]} fontWeight="500" h="46px" colorScheme="blue" bg={COLORS.blue}>
                    Get Started
                </Button>
            </Stack>
        </Box>
    );
}

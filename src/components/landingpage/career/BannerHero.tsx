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
            <Box fontSize={"16px"} fontWeight="700" color={COLORS.yellow} mb="24px">
                Join our Dedicated Team
            </Box>
            <Heading fontSize={["30px", "30px", "30px", "48px"]} lineHeight={["44px", "44px", "44px", "60.48px"]} fontWeight="700">
                Become a Part of   <br />Our <Text as="span" color={COLORS.blue}>Team</Text>
            </Heading>
            <Text mt={["18px", "18px", "18px", "24px"]} fontSize={["14px", "14px", "14px", "18px"]} fontWeight="700" lineHeight={["24px", "24px", "24px", "28px"]} color={COLORS.black}>
                Elevate your learning with personalized tutoring. Unlock excellent A-level exam scores and secure a seat in the university of your choice
            </Text>
        </Box>
    );
}

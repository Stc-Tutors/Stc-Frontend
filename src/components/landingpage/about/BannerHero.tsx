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
                Let’s tell you about us
            </Box>
            <Heading fontSize={["30px", "30px", "30px", "48px"]} lineHeight={["44px", "44px", "44px", "60.48px"]} fontWeight="700">
                We Are Committed To   <br />Your <Text as="span" color={COLORS.blue}>Success</Text>
            </Heading>
            <Text mt={["18px", "18px", "18px", "24px"]} fontSize={["14px", "14px", "14px", "18px"]} fontWeight="400" lineHeight={["24px", "24px", "24px", "28px"]} color={COLORS.black}>
                STC Edu Consult, a subsidiary of Statcomm TC Limited, aims to transform the tutoring landscape by connecting students with qualified tutors through a robust online platform. Initially focusing on Nigeria, the UK, the USA, Canada, and several other countries, our mission is to provide accessible, high-quality education and exam preparation services for primary, secondary, and post-secondary students. We also offer adult education services, among others. In addition to academic tutoring, we provide language courses and specialized training in various skills. Our comprehensive approach includes monthly counseling sessions, career talks, and interactive support to ensure holistic student development.
            </Text>
        </Box>
    );
}

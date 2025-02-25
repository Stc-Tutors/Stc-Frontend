import { COLORS } from "@/components/utils/theme";
import { Box, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function CEOmessage() {
    return (
        <Box
            mt="20px"
            w="full"
            pl={["20px", "20px", "20px", "190px"]}
            pr={["20px", "20px", "20px", "120px"]}
        >
            <Box fontSize={"16px"} fontWeight="700" color={COLORS.yellow} mb="24px">
                Meet Our CEO
            </Box>
            <Heading fontSize={["30px", "30px", "30px", "48px"]} lineHeight={["44px", "44px", "44px", "60.48px"]} fontWeight="700">
                We Are Your Bridge to Educational Excellence
            </Heading>
            <Text mt={["18px", "18px", "18px", "24px"]} fontSize={["14px", "14px", "14px", "18px"]} fontWeight="400" lineHeight={["24px", "24px", "24px", "28px"]} color={COLORS.black}>
                As the founder of STC Edu. Consult, I am passionate about transforming the educational landscape by making high-quality tutoring accessible to everyone, regardless of their geographical location. Our mission is to empower both students and adults to reach their full potential through personalized learning experiences and dedicated support. Alongside our committed team, we aim to create an inclusive and innovative platform that not only educates but also inspires and motivates our learners to succeed.
            </Text>
        </Box>
    );
}

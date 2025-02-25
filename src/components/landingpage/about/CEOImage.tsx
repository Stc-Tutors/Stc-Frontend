import { COLORS } from "@/components/utils/theme";
import { Box, Image, Tag, VStack, Flex } from "@chakra-ui/react";

export default function CEOImage() {
    return (
        <Flex w={["full","full","full", "450px"]} align="center" justify="center" h={["auto","auto","auto","100vh"]} pl={["20px","20px","20px","120px"]} pr={["20px","20px","20px","0px"]}>
            <Box
                rounded="2xl"
                shadow="xl"
                position="relative"
                mt="20px"
                h={["auto","auto","auto","450px"]}
                mr={["0px","0px","0px","-125px"]}
                w={["full","full","full", "450px"]}
            >
                <Image
                    src="/image/about/ceo.png" // Replace with your image path
                    objectFit="cover"
                    w="100%"
                    h="auto"
                />

                <VStack position="absolute" bottom={4} right={"20px"} spacing={2}>
                    <Tag bg="rgba(255, 255, 255, 0.3)" mb="-5px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                    Oladayo Ayodeji
                    </Tag>
                    <Tag bg="rgba(255, 255, 255, 0.3)" mr="-20px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                    CEO/Founder
                    </Tag>
                </VStack>
            </Box>
        </Flex>
    );
}

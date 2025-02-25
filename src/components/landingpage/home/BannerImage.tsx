import { COLORS } from "@/components/utils/theme";
import { Box, Image, Tag, VStack, Flex } from "@chakra-ui/react";

export default function BannerImage() {
    return (
        <Flex w={["full","full","full", "450px"]} align="center" justify="center" h={["400px","400px","400px","100vh"]} bg={COLORS.blue} pl={["20px","20px","20px","120px"]} pr={["20px","20px","20px","0px"]}>
            <Box
                rounded="2xl"
                shadow="xl"
                position="relative"
                h={["320px","320px","320px","450px"]}
                mt="100px"
                mr={["0px","0px","0px","-125px"]}
                mb={["-100px","-100px","-100px", "0px"]}
                w={["320px","320px","320px", "450px"]}
            >
                <Image
                    src="/image/home/home_1.png" // Replace with your image path
                    objectFit="cover"
                    w="100%"
                    h="auto"
                />

                <VStack position="absolute" top={4} right={"-30px"} spacing={2}>
                    <Tag bg="rgba(255, 255, 255, 0.3)" mb="-5px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                        Onlines
                    </Tag>
                    <Tag bg="rgba(255, 255, 255, 0.3)" mr="-20px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                        Offline
                    </Tag>
                </VStack>

                <VStack position="absolute" bottom={4} left={"-30px"} spacing={2}>
                    <Tag bg="rgba(255, 255, 255, 0.3)" mb="-6px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                        One-on-one
                    </Tag>
                    <Tag bg="rgba(255, 255, 255, 0.3)" ml="-20px" fontSize="18px" h="48px" w="160px" justifyContent="center" alignItems="center" shadow="md">
                        Group
                    </Tag>
                </VStack>
            </Box>
        </Flex>
    );
}

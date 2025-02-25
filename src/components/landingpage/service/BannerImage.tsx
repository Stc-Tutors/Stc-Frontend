import { COLORS } from "@/components/utils/theme";
import { Box, Image, Tag, VStack, Flex } from "@chakra-ui/react";

export default function BannerImage() {
    return (
        <Flex w={["full", "full", "full", "450px"]} align="center" justify="center" h={["400px", "400px", "400px", "100vh"]} bg={COLORS.blue} pl={["20px", "20px", "20px", "120px"]} pr={["20px", "20px", "20px", "0px"]}>
            <Box
                rounded="2xl"
                shadow="xl"
                position="relative"
                h={["320px", "320px", "320px", "450px"]}
                mt="100px"
                mr={["0px", "0px", "0px", "-125px"]}
                mb={["-100px", "-100px", "-100px", "0px"]}
                w={["320px", "320px", "320px", "450px"]}
            >
                <Image
                    src="/image/service/banner.png" // Replace with your image path
                    objectFit="cover"
                    w="100%"
                    h="auto"
                />
            </Box>
        </Flex>
    );
}

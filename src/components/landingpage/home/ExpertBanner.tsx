import { COLORS } from "@/components/utils/theme";
import { Box, Center, Image, Img } from "@chakra-ui/react";
import React from "react";

export default function ExpertBanner() {

    return (
        <Center w={["full", "full", "full", "full"]} h={["320px", "320px", "320px", "100vh"]} pr={["20px", "20px", "20px", "80px"]} pl={["20px", "20px", "20px", "120px"]}>
            <Box
                position="relative"
                h={["auto", "auto", "320px", "584px"]}
                w={["full", "full", "320px", "584px"]}
                display={"flex"}
                borderRadius={["38px","38px","38px", "64px"]}
                bg={COLORS.light_gray}
                padding={["20px","20px","20px","30px"]}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <Box h="full" w="full" p="16px" borderRadius={["16px","16px","16px", "20px"]} border={`1px dashed ${COLORS.blue}`}>
                    <Image
                        src="/image/home/expert.png" // Replace with your image path
                        objectFit="cover"
                        w="100%"
                        h="100%"
                    />
                </Box>
            </Box>
        </Center>
    )
}
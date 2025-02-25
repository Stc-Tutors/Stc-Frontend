import { Box, Center, Image, Img } from "@chakra-ui/react";
import React from "react";

export default function CommunityBanner() {

    return (
        <Center w={["full", "full", "full", "full"]} h={["320px", "320px", "320px", "100vh"]} pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "0px"]}>
            <Box
                position="relative"
                h={["auto", "auto", "320px", "450px"]}
                w={["full", "full", "320px", "450px"]}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <Image
                    src="/image/home/communtiy.png" // Replace with your image path
                    objectFit="cover"
                    w="100%"
                    h="auto"
                />
            </Box>
        </Center>
    )
}
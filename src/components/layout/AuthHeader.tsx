import { Box, Button, Center, Flex, Img } from "@chakra-ui/react";
import React from "react";
import { COLORS } from "../utils/theme";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AuthHeader() {

    const router = useRouter()

    return (
        <Center pos="fixed" bg={COLORS.white} h="100px" top="0px" zIndex={15} as="header" w="full" pl={["20px", "20px", "20px", "120px"]} pr={["20px", "20px", "20px", "120px"]}>
            <Flex w="full" alignItems="center" justifyContent="space-between">
                {/* Logo */}
                <Link href="/">
                    <Img src='/image/Logo.png' />
                </Link>
            </Flex>

            <Button onClick={()=>router.back()} bg="transparent">
                <Center>
                    <Box fontSize="20px" fontWeight="400" color={COLORS.blue} mr="5">
                        Back
                    </Box>
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 7H15M15 7L9 13M15 7L9 1" stroke="#1A237E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </Center>
            </Button>
        </Center>
    )
}
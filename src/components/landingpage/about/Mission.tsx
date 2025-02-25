import React from "react";
import { Center, Flex } from "@chakra-ui/react";
import { COLORS } from "@/components/utils/theme";
import MissionCard from "./MissionCard";
import MissionCard2 from "./MisssionCard2";
export default function Mission() {
    return (
        <Center  w={["full", "full", "full", "full"]} bg={COLORS.whitesmoke} h={["auto", "auto", "auto", "100vh"]} p={["30px"]} pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "120px"]} >
            <Flex w="full" flexDir={["column", "column", "column", "row"]} justifyContent={["center", "center", "center", "space-between"]}>
                <MissionCard />
                <MissionCard2 />
            </Flex>
        </Center>
    )
}
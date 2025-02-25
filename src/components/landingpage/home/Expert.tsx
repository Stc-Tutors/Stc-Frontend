import React from "react";
import { Flex } from "@chakra-ui/react";
import { COLORS } from "@/components/utils/theme";
import ExpertText from "./ExpertText";
import ExpertBanner from "./ExpertBanner";

export default function Expert() {
    return (
        <Flex bg={COLORS.white} flexDir={["column", "column", "column", "row"]}>
            <ExpertBanner />
            <ExpertText />
        </Flex>
    )
}
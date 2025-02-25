import React from "react";
import { Flex } from "@chakra-ui/react";
import CommunityText from "./CommunityText";
import CommunityBanner from "./CommunityBanner";
import { COLORS } from "@/components/utils/theme";

export default function Community() {
    return (
        <Flex bg={COLORS.whitesmoke} flexDir={["column-reverse", "column-reverse", "column-reverse", "row"]}>
            <CommunityText />
            <CommunityBanner />
        </Flex>
    )
}
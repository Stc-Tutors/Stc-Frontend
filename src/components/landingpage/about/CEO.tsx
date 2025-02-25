import React from "react";
import { Center, Flex } from "@chakra-ui/react";
import CEOImage from "./CEOImage";
import CEOmessage from "./CEOmessage";

export default function CEO() {
    return (
        <Center flexDir={["column","column","column","row"]}>
            <CEOImage />
            <CEOmessage />
        </Center>
    )
}
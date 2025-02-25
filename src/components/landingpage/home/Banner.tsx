import React from "react";
import BannerImage from "./BannerImage";
import { Center } from "@chakra-ui/react";
import BannerHero from "./BannerHero";

export default function Banner() {
    return (
        <Center flexDir={["column","column","column","row"]}>
            <BannerImage />
            <BannerHero />
        </Center>
    )
}
import React from "react";
import { Flex } from "@chakra-ui/react";
import { COLORS } from "@/components/utils/theme";
import ContactBanner from "./ContactBanner";
import ContactForm from "@/components/auth/ContactForm";
export default function ContactUs() {
    return (
        <Flex flexDir={["column", "column", "column", "row"]} w={["full", "full", "full", "full"]} h={["auto", "auto", "auto", "100vh"]} p={["30px"]} pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "120px"]} bg={COLORS.white}>
            <ContactBanner />
            <ContactForm />
        </Flex>
    )
}
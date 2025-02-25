// components/MissionCard.tsx
import { COLORS } from "@/components/utils/theme";
import { Box, Heading, Text, Highlight, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";

const JobCard = ({ header, title, body, single }: { header: string, title: string, body: string, single?: boolean }) => {

   const route = useRouter();
   
    return (
        <Box
            bg={COLORS.white}
            p={"20px"}
            borderRadius="lg"
            mb="20px"
            boxShadow="md"
            w={single ? "full" : ["full", "500px"]}
            h="-webkit-fit-content"
        >
            <Text fontSize="sm" fontWeight="bold" color={COLORS.yellow}>
                {header}
            </Text>
            <Heading size="36px" lineHeight="45.36px" mt={2}>
                {title}
            </Heading>
            <Text mt={1} fontSize="sm" color={COLORS.gray}>
                {body}
            </Text>
            <Center  cursor="pointer" onClick={()=>route.push("single_career")} mt="20px" justifyContent={"start"}>
                <Box color={COLORS.blue} mr="5px">Learn More</Box>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 7H15M15 7L9 13M15 7L9 1" stroke="#1A237E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </Center>
        </Box>
    );
};

export default JobCard;

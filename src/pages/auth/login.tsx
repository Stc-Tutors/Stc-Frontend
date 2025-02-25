'use client';

import LoginForm from '@/components/auth/LoginForm';
import AuthHeader from '@/components/layout/AuthHeader';
import { COLORS } from '@/components/utils/theme';
import { Box, Text, VStack, HStack, Image, Center, Flex } from '@chakra-ui/react';

const SignUpCard = () => {
    return (
        <Center bg={COLORS.blue}overflow="hidden" pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "120px"]} h="100vh" pt="100px">
            <AuthHeader />
            <Box w={["full", "full", "500px", "546px"]} bg="white" p={["20px", "20px", "20px", "46px"]} borderRadius="lg" boxShadow="md" textAlign="center" border="2px solid blue">
                <Box w="full" textAlign={"start"}>
                    <Text fontSize="30px" fontWeight="600">Login</Text>
                    <Text fontSize="24px" mt="30px" fontWeight="600">Welcome back!</Text>
                </Box>
                <Flex justify="space-around" mt={["20px"]}>
                    <LoginForm />
                </Flex>
            </Box>
        </Center>
    );
};

export default SignUpCard;

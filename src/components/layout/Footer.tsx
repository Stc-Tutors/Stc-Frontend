'use client';

import { Box, Button, Container, Flex, HStack, Link, Stack, Text, IconButton, Image, Center } from '@chakra-ui/react';
import { FaFacebook, FaXTwitter, FaInstagram, FaLinkedin, FaPhone } from 'react-icons/fa6';
import { COLORS } from '../utils/theme';
import { useRouter } from 'next/router';

const Footer = () => {

   const router = useRouter()

    return (
        <>
            <Box h={["25px", "25px", "25px", "50px"]} />
            <Box as="footer" pos="relative" bg={COLORS.blue}
                pl={["20px", "20px", "20px", "120px"]}
                pr={["20px", "20px", "20px", "120px"]}
                color="white" >
                <Container maxW="container.xl">
                    <Stack spacing={6}>
                        {/* Social Icons and Login/Signup */}
                        <Box pos="absolute"
                            pl={["20px", "20px", "20px", "120px"]}
                            pr={["20px", "20px", "20px", "120px"]}
                            top={["-25px", "-25px", "-25px", "-50px"]} w="full" left="0px">
                            <Flex justify={["center", "center", "center", "space-between"]} h={["50px", "50px", "50px", "100px"]} align="center" bg={COLORS.white} border={`1px solid ${COLORS.blue}`} p={4} borderRadius="md">
                                <HStack spacing={4}>
                                    <Center w="40px" h="40px" borderRadius={"40px"} bg={COLORS.blue}>
                                        <IconButton as={Link} href="#" aria-label="Facebook" icon={<FaFacebook />} variant="ghost" color={COLORS.white} />
                                    </Center>
                                    <Center w="40px" h="40px" borderRadius={"40px"} bg={COLORS.blue}>
                                    <IconButton as={Link} href="#" aria-label="Twitter" icon={<FaXTwitter />} variant="ghost" color={COLORS.white} />
                                    </Center>
                                    <Center w="40px" h="40px" borderRadius={"40px"} bg={COLORS.blue}>
                                    <IconButton as={Link} href="#" aria-label="Instagram" icon={<FaInstagram />} variant="ghost" color={COLORS.white} />
                                    </Center>
                                    <Center w="40px" h="40px" borderRadius={"40px"} bg={COLORS.blue}>
                                    <IconButton as={Link} href="#" aria-label="LinkedIn" icon={<FaLinkedin />} variant="ghost" color={COLORS.white} />
                                    </Center>
                                    <Center w="40px" h="40px" borderRadius={"40px"} bg={COLORS.blue}>
                                    <IconButton as={Link} href="#" aria-label="Phone" icon={<FaPhone />} variant="ghost" color={COLORS.white} />
                                    </Center>
                                </HStack>
                                {/* Logo Placeholder */}
                                <Image display={["none", "none", "none", "flex"]} src="/image/home/logo_short.png" />
                                {/* Auth Buttons */}
                                <HStack display={["none", "none", "none", "flex"]}>
                                    <Button onClick={()=>router.push("/auth/login")} colorScheme="blue" border={`1px solid ${COLORS.blue}`} color={COLORS.blue} variant="outline">Login</Button>
                                    <Button onClick={()=>router.push("/auth/signup")} colorScheme="blue" bg={COLORS.blue}>Sign Up</Button>
                                </HStack>
                            </Flex>
                        </Box>
                        <Box h={["25px", "25px", "25px", "50px"]} />
                        {/* Footer Links */}
                        <Flex justify="space-between" w={["full", "full", "full", "598px"]} wrap="wrap">
                            <Stack spacing={2}>
                                <Text fontWeight="bold">Tutors</Text>
                                <Link href="/">Home</Link>
                                <Link href="/about">About</Link>
                                <Link href="/service">Services</Link>
                                <Link href="/contact">Contact</Link>
                            </Stack>
                            <Stack spacing={2}>
                                <Text fontWeight="bold">Company</Text>
                                <Link href="/about">About</Link>
                                <Link href="/career">Careers</Link>
                                <Link href="#">Safety</Link>
                                <Link href="#">Take a Tour</Link>
                            </Stack>
                            <Stack spacing={2}>
                                <Text fontWeight="bold">Service</Text>
                                <Link href="/service">Student</Link>
                                <Link href="/service">Teachers</Link>
                            </Stack>
                        </Flex>

                        {/* Copyright */}
                        <Text textAlign="center" fontSize="sm">&copy; 2024. All rights reserved.</Text>
                    </Stack>
                </Container>
            </Box>
        </>
    );
};

export default Footer;
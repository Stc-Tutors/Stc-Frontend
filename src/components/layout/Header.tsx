import { Box, Flex, Link, Button, Text, Img, Center, useDisclosure, Slide, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { COLORS } from '../utils/theme';
import { ArrowForwardIcon, HamburgerIcon, CloseIcon, ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from 'react';

export default function Header({ logo }: { logo: boolean }) {

    const router = useRouter();
    const { isOpen, onToggle } = useDisclosure(); // State to manage search bar visibility
    const [scrollY, setScrollY] = useState(0);

    const navData = [{
        nav: "about",
        title: "About"
    },
    {
        nav: "service",
        title: "Service"
    },
    {
        nav: "career",
        title: "Career"
    },
    {
        nav: "blog",
        title: "Blog"
    }]

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY); // Captures vertical scroll position
        };

        window.addEventListener("scroll", handleScroll);

        // Clean up event listener when the component unmounts
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    return (
        <>
            <Slide
                direction="right"
                in={isOpen}
                style={{ zIndex: 10 }}
            >
                <Flex justifyContent={"flex-end"}>
                    <Box
                        p="20px"
                        pt="40px"
                        color={COLORS.black}
                        mt="70px"
                        bg={COLORS.white}
                        w={"260px"}
                        h="100vh"
                    >
                        {navData.map((a: { nav: string, title: string }, b: number) => (
                            <Link href={`/${a.nav}`}>
                                <Box
                                    mb="5px"
                                    fontSize="16px"
                                    color={router.pathname === a.nav ? COLORS.blue : COLORS.black}
                                    fontWeight="700"
                                    cursor="pointer"
                                    onClick={onToggle}
                                >
                                    {a.title}
                                </Box>
                            </Link>
                        ))}
                        <Flex position="absolute" bottom="10px">
                            <>
                                <Button w="80px" mr="10px" onClick={() => {
                                    onToggle()
                                    router.push("/auth/login")
                                }} colorScheme="black" color={COLORS.blue} border={`1px solid ${COLORS.blue}`}>
                                    Log in
                                </Button>
                                <Button onClick={() => {
                                    onToggle()
                                    router.push("/auth/signup")
                                }} colorScheme="blackAlpha" bg={COLORS.blue}>
                                    Register
                                </Button>
                            </>
                        </Flex>
                    </Box>
                </Flex>
            </Slide>
            <Center pos="fixed" bg={scrollY > 20 ? COLORS.white:""} h="100px" zIndex={15} as="header" w="full" pl={["20px", "20px", "20px", "120px"]} pr={["20px", "20px", "20px", "120px"]}>
                <Flex w="full" alignItems="center" justifyContent="space-between">
                    {/* Logo */}
                    <NextLink href="/" passHref>
                        <Link>
                            {!logo && scrollY < 20 ? <Img src='/image/Logo_white.png' />: <Img src='/image/Logo.png' />}
                        </Link>
                    </NextLink>
                    {/* Navigation Links */}
                    <Flex gap="8" display={["none", "none", "flex", "flex"]} alignItems="center">
                        {navData.map((a: { nav: string, title: string }, b: number) => (
                            <NextLink href={`/${a.nav}`} passHref>
                                <Link
                                    textDecoration="none" // Removes the underline
                                    _hover={{ textDecoration: "none" }} // Ensures no underline appears on hover
                                    color={router.pathname === a.nav ? COLORS.blue : COLORS.black}
                                    textTransform="none" fontSize="20px" fontWeight="500" >{a.title}</Link>
                            </NextLink>
                        ))}
                    </Flex>

                    {/* Action Buttons */}
                    <Flex gap="4" display={["none", "none", "flex", "flex"]}>
                        <Button 
                        onClick={()=>{
                            router.push("/auth/login")}}
                        variant="outline" color={COLORS.blue} borderColor={COLORS.blue} colorScheme="blue">
                            Login
                        </Button>

                        <Button onClick={()=>{
                            router.push("/auth/signup")}}
                        colorScheme="blue" bg={COLORS.blue}>
                            Sign Up
                        </Button>
                    </Flex>
                    <Button
                        onClick={() => {
                            console.log("user")
                            onToggle()
                        }}
                        h="50px"
                        w="50px"
                        style={{ background: COLORS.blue }}
                        borderRadius="50px"
                        display={{ md: "none", base: "inherit" }}
                    >
                        <Center>
                            {!isOpen ? (
                                <HamburgerIcon w="30px" h="30px" color="#fff" transition="1s" />
                            ) : (
                                <CloseIcon w="30px" h="30px" color="#fff" transition="1s" />
                            )}
                        </Center>
                    </Button>
                </Flex>
            </Center>

        </>
    );
}
import {
    FormLabel,
    Button,
    Box,
    Flex,
    Text,
    Link as ChakraLink,
    VStack,
    Heading,
    useToast,
    Center,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";
import CustomInput from "@/contants/form/CustomInput";
import { COLORS } from "../utils/theme";

function ContactForm() {
    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Kindly provide a valid email address")
            .required("Email address is required"),
        password: Yup.string().required("Password is required"),
    });
    const initiateLogin = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
            setSubmitting(true);
            // const data = await loginDriver({ email: values.email, password: values.password });

            // const access_token = data?.data?.access_token
            // const expires_in = data?.data?.expires_in
            // const user = data?.data?.user
            // // login function for the user

            // loginUser({
            // 	token: access_token,
            // 	expires_in,
            // 	remember_me: rememberMe,
            // 	user,
            // }); 
            toast({
                position: "top-right",
                description: "Welcome back",
                status: "success",
                isClosable: true,
            });
            // const { redirect: redirectUrl = "/dashboard/driver/summary" } =
            // 	router.query;
            // router.push(redirectUrl);
            // resetForm();

        } catch (error) {

            // toast({
            // 	position: "top-right",
            // 	title: "Login failed",
            // 	description: error?.response?.data?.message,
            // 	status: "error",
            // 	isClosable: true,
            // });
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <Center pl={["0px", "0px", "0px", "150px"]} flexDir="column" w="full">
            <Box w="full">
                <Formik
                    initialValues={{ email: "", password: "" }}
                    onSubmit={initiateLogin}
                    validationSchema={validationSchema}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Box w="full">
                                <CustomInput
                                    label="Email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    fieldProps={{ type: "email" }}
                                />
                            </Box>
                            <Box w="full">
                                <CustomInput
                                    label="Message"
                                    name="message"
                                    placeholder="Enter your message"
                                    type="textarea"
                                    fieldProps={{ type: "password" }}
                                />
                            </Box>
                            <Center>
                                <Button
                                    isDisabled={isSubmitting}
                                    isLoading={isSubmitting}
                                    type="submit"
                                    w={["full", "full", "full", "175px"]}
                                    mt="4"
                                    h="50px"
                                    colorScheme="blue"
                                    bg={COLORS.blue}
                                    textTransform="capitalize"
                                >
                                    Send Message
                                </Button>
                            </Center>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Center>
    );
}

export default ContactForm;
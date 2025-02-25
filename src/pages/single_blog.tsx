import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Box } from "@chakra-ui/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/landingpage/career/Banner";
import Job from "@/components/landingpage/career/Job";
import VideoPlayer from "@/components/landingpage/service/VideoDisplay";
import SingleBlog from "@/components/landingpage/blog/SingleBlog";

export default function career() {
    return (
        <>
            <Head>
                <title>STC TUTORING</title>
                <meta name="description" content="Learning with STC" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box>
                <Header logo={true} />
                <Box p={["20px", "20px", "20px", "120px"]} pt="200px" >
                <SingleBlog />
                </Box>
                <Footer />
            </Box>
        </>
    );
}

import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Box } from "@chakra-ui/react";
import Header from "@/components/layout/Header";
import Community from "@/components/landingpage/home/Community";
import Expert from "@/components/landingpage/home/Expert";
import Result from "@/components/landingpage/home/Result";
import TestimonialCarousel from "@/components/landingpage/home/TestimonialCarousel";
import ContactUs from "@/components/landingpage/home/ContactUs";
import Footer from "@/components/layout/Footer";
import Banner from "@/components/landingpage/about/Banner";
import Mission from "@/components/landingpage/about/Mission";
import CEO from "@/components/landingpage/about/CEO";

export default function About() {
  return (
    <>
      <Head>
        <title>STC TUTORING</title>
        <meta name="description" content="Learning with STC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Header logo={false} />
        <Banner />
        <Mission />
        <CEO />
        <Footer />
      </Box>
    </>
  );
}

import { ChrakaLayout } from "@/components/layout/ChrakaLayout";
import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'], // Include character subsets
  variable: '--font-inter', // Optional: CSS variable for easier usage
});


export default function App({ Component, pageProps }: AppProps) {

  return (
    <div lang="en" className={inter.variable}>
      <ChrakaLayout>
        <Component {...pageProps} />
      </ChrakaLayout>
    </div>
  );
}

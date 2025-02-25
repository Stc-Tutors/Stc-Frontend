"use client";

import { COLORS } from "@/components/utils/theme";
import { Box, Text, Avatar, Flex, Icon, Container, Center, Heading } from "@chakra-ui/react";
import { FaQuoteLeft } from "react-icons/fa";
import Slider from "react-slick";

const testimonials = [
  {
    id: "1",
    name: "Aminat Ayobo",
    program: "LIMB|365",
    feedback:
      "After six months of tutoring, my grades jumped from D to B+ in Mathematics. The tutors here really know how to explain complex topics simply.",
    image: "https://via.placeholder.com/50", // Replace with actual image URL
  },
  {
    id: "2",
    name: "John Adams",
    program: "JUPEB|329",
    feedback:
      "The Project Management course changed my career path completely. Within three months, I secured a better position. Worth every penny.",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Oji Clara",
    program: "LIMB|365",
    feedback:
      "The career counseling gave me clear direction and a solid plan for my future. Now I'm confidently pursuing my goals.",
    image: "https://via.placeholder.com/50",
  },
];

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false,
};
const settings2 = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false,
};
const settings3 = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false,
};
const TestimonialCard = ({ feedback, name, program, image }) => (
  <Box
    bg={COLORS.white}
    boxShadow="md"
    borderRadius="lg"
    p={6}
    textAlign="center"
    w="316px"
    h="415px"
    mx="auto"
    paddingTop={"80px"}
    pos="relative"
    overflow={"hidden"}
  >
    <Center bg={COLORS.blue} borderRadius="80px" pos="absolute" top="-30px" left="-30px" paddingLeft="20px" paddingTop={"20px"} h="80px" w="80px" >
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.6668 10.3333H19.0002C19.3538 10.3333 19.6929 10.4738 19.943 10.7239C20.193 10.9739 20.3335 11.313 20.3335 11.6667V15.6667C20.3335 16.0203 20.193 16.3594 19.943 16.6095C19.6929 16.8595 19.3538 17 19.0002 17H15.0002C14.6465 17 14.3074 16.8595 14.0574 16.6095C13.8073 16.3594 13.6668 16.0203 13.6668 15.6667V7.66667C13.6668 4.11067 15.4442 1.88933 19.0002 1M1.66683 10.3333H7.00016C7.35379 10.3333 7.69292 10.4738 7.94297 10.7239C8.19302 10.9739 8.3335 11.313 8.3335 11.6667V15.6667C8.3335 16.0203 8.19302 16.3594 7.94297 16.6095C7.69292 16.8595 7.35379 17 7.00016 17H3.00016C2.64654 17 2.3074 16.8595 2.05735 16.6095C1.80731 16.3594 1.66683 16.0203 1.66683 15.6667V7.66667C1.66683 4.11067 3.44416 1.88933 7.00016 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </Center>
    <Box h="140px">
      <Text fontSize="md" textAlign="start" mt={3} color="gray.700">
        {feedback}
      </Text>
    </Box>
    <Flex align="center" flexDir="column" justify="center" mt={5}>
      <Avatar src={image} name={name} size="md" />
      <Center flexDir="column" mt="16px" textAlign="center">
        <Text fontWeight="400" fontSize="18px" color={COLORS.black} textAlign="start">{name}</Text>
        <Text fontWeight="400" fontSize="16px" color={COLORS.yellow} textAlign="start">
          {program}
        </Text>
      </Center>
    </Flex>
  </Box>
);

const TestimonialCarousel = () => {
  return (
    <Center bg={COLORS.whitesmoke} textAlign="center" flexDir={"column"} w={["full", "full", "full", "full"]} h={["auto", "auto", "auto", "auto"]} p={["30px", "30px", "30px", "50px"]} pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "120px"]}>
      <Center flexDir={"column"} p={["30px", "30px", "30px", "50px"]} h={["full"]} bg={COLORS.blue_white} borderRadius="32px" w={["full", "full", "700px", "1200px"]}>
        <Text color={COLORS.light_blue} fontSize="xl" fontWeight="bold">
          Testimonials
        </Text>
        <Heading fontSize="3xl" mb={["30px", "30px", "30px", "80px"]} mt={2}>
          What our customers say
        </Heading>
        <Box display={["none","none","none","block"]} w="full">
          <Slider {...settings}>
            {testimonials.map((testimony) => (
              <TestimonialCard key={testimony.id} {...testimony} />
            ))}
          </Slider>
        </Box>
        <Box display={["none","none","block","none"]} w="full">
          <Slider {...settings2}>
            {testimonials.map((testimony) => (
              <TestimonialCard key={testimony.id} {...testimony} />
            ))}
          </Slider>
        </Box>
        
        <Box display={["block","block","none","none"]} w="full">
          <Slider {...settings3}>
            {testimonials.map((testimony) => (
              <TestimonialCard key={testimony.id} {...testimony} />
            ))}
          </Slider>
        </Box>
      </Center>
    </Center>
  );
};

export default TestimonialCarousel;

import React from "react";
import { Center, Flex } from "@chakra-ui/react";
import { COLORS } from "@/components/utils/theme";
import BlogContent from "./blogContent";

export default function BlogContainer() {

    const blogData = [
        {
            title: "10 Proven Study Techniques for A+ Exam Success",
            category: "How to Create an Effective Study Schedule That Works",
            description:
                "Achieving academic excellence requires more than just hard work – it demands smart study strategies. Our research and experience with thousands of successful students have shown that effective study techniques can dramatically improve your exam performance.",
            image: "/images/study-techniques.jpg",
            link: "#",
        },
        {
            title: "30 Mental Benefits of Playing Chess Games",
            category: "Unlock Your Brain’s Full Potential",
            description:
                "Chess is more than just a game; it enhances cognitive skills, improves memory, and sharpens problem-solving abilities. Studies have shown that regular chess players develop better strategic thinking and planning capabilities.",
            image: "/images/chess-game.jpg",
            link: "#",
        },
        {
            title: "Balancing Studies and Life",
            category: "Achieve Academic and Personal Success",
            description:
                "Maintaining a balance between studies and personal life is crucial for overall well-being. Learn practical techniques to manage your time effectively and reduce stress while excelling in academics.",
            image: "/images/study-life-balance.jpg",
            link: "#",
        },
        {
            title: "Understanding Different Learning Styles",
            category: "Find What Works Best for You",
            description:
                "Everyone learns differently. Some prefer visual aids, while others absorb information through listening or hands-on experience. Discover the learning style that best suits you and maximize your educational success.",
            image: "/images/learning-styles.jpg",
            link: "#",
        },
    ];

    return (
        <>
            <Center w={["full", "full", "full", "full"]} justifyContent={["space-between"]} flexWrap="wrap" bg={COLORS.whitesmoke} h={["auto", "auto", "auto", "auto"]} p={["20px", "20px", "20px", "120px"]} >
                {blogData.map((a, b) => (
                    <BlogContent key={b} number={b} data={a} />))}
            </Center>
        </>
    )
}
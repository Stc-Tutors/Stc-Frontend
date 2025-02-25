import React from "react";
import { Center, Flex } from "@chakra-ui/react";
import { COLORS } from "@/components/utils/theme";
import JobCard from "./JobCard";
export default function Job() {
    const jobView = [
        {
            "title": "Register to Become a Tutor",
            "description": "Share your knowledge and transform lives while earning extra income. Tutor in math, science, languages, music, and more.",
            "header": "Register to Become a Tutor"
        },
        {
            "title": "Become a Counselor",
            "description": "Guide others to success with our counseling team and make a meaningful impact on students' academic journey.",
            "header": "Guide Others to Success"
        }]
    const job = [{
        "title": "Academy Coordinator",
        "location": "Lagos",
        "work_mode": "Hybrid",
        "job_description": "Develop and manage training schedules and curricula in alignment with organizational goals.",
        "link": "Learn More"
    },
    {
        "title": "Logistics Manager",
        "work_mode": "Hybrid",
        "job_description": "Develop and manage training schedules and curricula in alignment with organizational goals.",
        "link": "Learn More"
    },
    {
        "title": "Adult Educator",
        "location": "Lagos",
        "work_mode": "Hybrid",
        "job_description": "Develop and manage training schedules and curricula in alignment with organizational goals.",
        "link": "Learn More"
    }]
    return (
        <>
            <Center w={["full", "full", "full", "full"]} flexDir={"column"} bg={COLORS.whitesmoke} h={["auto", "auto", "auto", "auto"]} p={["20px", "20px", "20px", "120px"]} >
                <Flex w="full" flexDir={["column", "column", "column", "row"]} justifyContent={["center", "center", "center", "space-between"]}>
                    {jobView.map((a: { title: string, description: string, header: string }, b: number) => (
                        <JobCard key={b} header={a.header} body={a.description} title={a.title} />
                    ))
                    }
                </Flex>
                {job.map((a: any, b: number) => (
                    <JobCard key={b} single={true} header={a.title} body={a.job_description} title={a.location} />
                ))
                }
            </Center>
        </>
    )
}
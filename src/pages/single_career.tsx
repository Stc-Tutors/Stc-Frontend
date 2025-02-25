import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { COLORS } from '@/components/utils/theme';
import { Box, Heading, Text, UnorderedList, ListItem, VStack, Center } from '@chakra-ui/react';
import Head from 'next/head';


function SingleCareer() {
    return (
        <>
            <Head>
                <title>STC TUTORING</title>
                <meta name="description" content="Learning with STC" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header logo={true} />
            <Center pb="40px" bg={COLORS.whitesmoke} pr={["20px", "20px", "20px", "120px"]} pl={["20px", "20px", "20px", "120px"]}>
                <Box w="full" p={["20px", "20px", "20px", "40px"]} borderRadius="10px" mt="100px" bg={COLORS.white} mx="auto">
                    <VStack spacing={4} align="start">
                        {/* Vacancy Notice */}
                        <Text fontSize="sm" color="gray.500">Vacancy Notice</Text>
                        {/* Resume Header */}
                        <Heading size="lg">Academic Tutoring</Heading>
                        <Text fontSize="md" color="gray.600">Location: Remote/Online</Text>
                        {/* Job Description */}
                        <Heading size="md">Job Description</Heading>
                        <UnorderedList spacing={2}>
                            <ListItem>Develop and manage tutoring schedules and calendars with relevant organizational goals.</ListItem>
                            <ListItem>Design program workflows by gathering feedback, and updating materials when necessary.</ListItem>
                            <ListItem>Collaborate with teachers, developers, and other team members to ensure program delivery.</ListItem>
                            <ListItem>Maintain strong relationships with student communities to foster engagement.</ListItem>
                            <ListItem>Manage training events, including resources, timelines, and program execution.</ListItem>
                            <ListItem>Deliver training through various methods like online, in-person, or blended learning.</ListItem>
                            <ListItem>Implement a detailed review process to evaluate technology to improve project outcomes.</ListItem>
                            <ListItem>Measure tutoring effectiveness and report to leadership.</ListItem>
                            <ListItem>Assist in the preparation of proposals, grant submissions, and feedback.</ListItem>
                        </UnorderedList>

                        {/* Qualifications and Requirements */}
                        <Heading size="md">Qualifications and Requirements</Heading>
                        <UnorderedList spacing={2}>
                            <ListItem>Bachelor's degree in Business Management, or a related field.</ListItem>
                            <ListItem>3+ years of experience in program facilitation/training.</ListItem>
                            <ListItem>Strong verbal and written communication skills.</ListItem>
                            <ListItem>Ability to work independently and in a team environment.</ListItem>
                            <ListItem>Proficiency in Microsoft Office Suite.</ListItem>
                            <ListItem>Knowledge of AI technology-related fields is an added advantage.</ListItem>
                        </UnorderedList>

                        {/* Key Competencies */}
                        <Heading size="md">Key Competencies</Heading>
                        <UnorderedList spacing={2}>
                            <ListItem>Leadership and team management</ListItem>
                            <ListItem>Attention to detail</ListItem>
                            <ListItem>Problem-solving and analytical skills</ListItem>
                            <ListItem>Excellent communication skills</ListItem>
                            <ListItem>Ability to work under pressure</ListItem>
                        </UnorderedList>

                        {/* How to Apply */}
                        <Heading size="md">How to Apply</Heading>
                        <Text>Click Here to Apply</Text>
                    </VStack>
                </Box>
            </Center>
            <Footer />
        </>
    );
}

export default SingleCareer;
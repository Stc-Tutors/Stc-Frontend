'use client';

import { useRef, useState } from 'react';
import { Box, IconButton, HStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Center } from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaExpand } from 'react-icons/fa';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(50);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration * value) / 100;
      setProgress(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
      setVolume(value);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Box pos="relative" p={["20px", "20px", "20px", "120px"]} pt="200px" h="auto" w="full">
      <Center w="full">
        <video
          ref={videoRef}
          width="100%"
          onTimeUpdate={handleTimeUpdate}
          src="/video/math.mp4"
          style={{ borderRadius: '10px' }}
        />
      </Center>
      <HStack mt={2} pos="absolute" pl={["20px", "20px", "20px", "120px"]}  pr={["20px", "20px", "20px", "120px"]}  left="0px" bottom={"150px"} w="full" spacing={4} alignItems="center">
        <IconButton
          icon={isPlaying ? <FaPause /> : <FaPlay />}
          onClick={togglePlay}
          aria-label="Play/Pause"
        />
        <Slider flex="1" value={progress} onChange={handleSeek}>
          <SliderTrack>
            <SliderFilledTrack bg="blue.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
        <IconButton icon={<FaVolumeUp />} aria-label="Volume" />
        <Slider w="80px" value={volume} onChange={handleVolumeChange}>
          <SliderTrack>
            <SliderFilledTrack bg="gray.500" />
          </SliderTrack>
          <SliderThumb boxSize={3} />
        </Slider>
        <IconButton icon={<FaExpand />} onClick={handleFullscreen} aria-label="Fullscreen" />
      </HStack>
    </Box>
  );
}

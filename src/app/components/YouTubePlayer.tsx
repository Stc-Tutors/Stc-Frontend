"use client";

import React from 'react';
import YouTube, {YouTubeProps} from 'react-youtube';

const YouTubePlayer = ({videoId}: {videoId: string}) => {
    // const opts:YouTubeProps["opts"] = {
    //     height: "390",
    //     width: "640",
    //     playerVars: {
    //         autoplay: 1,
    //     },
    // };

    // const onReady: YouTubeProps["onReady"] = (event) => {
    //     event.target.pauseVideo();
    // };

//   return <YouTube videoId={videoId} opts={opts} onReady={onReady} />;

return (
    <iframe
    width="100%"
    height="100%"
    src={"https://www.youtube.com/embed/DPKCjJViqo"}
    title='YouTube video player'
    frameBorder="0"
    allow='accelerator; autoplay; clipboard-write; encrypted-media gyroscope; picture-in-picture' allowFullScreen>
    </iframe>
    
)
}

export default YouTubePlayer
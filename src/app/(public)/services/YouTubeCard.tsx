import YouTubePlayer from "../components/YouTubePlayer";

const YouTubeCard = ({ title, description, videoId}: {
    title: string;
    description: string;
    videoId: string;
}) => (
    <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p>{description}</p>
        <YouTubePlayer videoId={"DPKCjJViqo"} />
    </div>
);

export default YouTubeCard;
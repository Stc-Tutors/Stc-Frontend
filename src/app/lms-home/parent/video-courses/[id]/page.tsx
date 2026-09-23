import VideoCourseWatchView from "@/components/video-courses/VideoCourseWatchView";

export default async function ParentVideoCourseWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VideoCourseWatchView id={id} />;
}

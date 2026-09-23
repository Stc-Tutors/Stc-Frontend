// Mirrors stcbe's standalone Video Course entity (see IVideoCourse) - a
// pre-recorded video content product, entirely decoupled from the Service
// Catalog/curriculum tree. attachedTaxonomyNodeId/attachedServiceId are
// optional cross-sell metadata an admin can set from the Super Admin
// "Manage Video Courses" screen. The public catalog
// (GET /public/video-courses, PUBLISHED only) never includes the video
// link - a signed-in student/parent gets it from GET /video-courses/:id/watch
// once they've unlocked the course (or if it is free).
export enum VideoCourseStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface IVideoCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  currency: string;
  // Only present on the watch response, never on a catalog listing.
  videoUrl?: string;
  thumbnailUrl?: string;
  status: VideoCourseStatus;
  attachedServiceId?: string;
  attachedTaxonomyNodeId?: string;
}

export interface VideoCourseLesson {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  order: number;
  releaseDate?: string;
  // A drip-fed episode before its release date: no link, `locked` true.
  videoUrl?: string;
  locked: boolean;
}

export interface WatchableVideoCourse extends IVideoCourse {
  lessons: VideoCourseLesson[];
}

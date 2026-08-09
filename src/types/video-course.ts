// Mirrors stcbe's standalone Video Course entity (see IVideoCourse) - a
// pre-recorded video content product, entirely decoupled from the Service
// Catalog/curriculum tree. attachedTaxonomyNodeId/attachedServiceId are
// optional cross-sell metadata an admin can set from the Super Admin
// "Manage Video Courses" screen; this frontend only ever reads
// PUBLISHED ones via GET /public/video-courses.
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
  videoUrl: string;
  thumbnailUrl?: string;
  status: VideoCourseStatus;
  attachedServiceId?: string;
  attachedTaxonomyNodeId?: string;
}

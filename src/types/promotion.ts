export type PromotionAudience = "ALL" | "STUDENTS" | "PARENTS";

export interface Promotion {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  ctaLabel?: string;
  link?: string;
  audience: PromotionAudience;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export type PromotionPayload = Partial<Omit<Promotion, "id" | "createdAt">>;

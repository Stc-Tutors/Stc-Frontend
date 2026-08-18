"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { BlogPost, FeaturedTutor, PageSection, ServicePage, TeamMember, Testimonial } from "@/types/content";

// All public, unauthenticated - safe to call before the T&C gate, same as
// GetSiteContentAction/GetHomepageSlidesAction.
export async function GetPageSectionsAction(): Promise<[ApiResponse<PageSection[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/page-sections",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PageSection[]>) : null;
  return [resData, error];
}

export async function GetTestimonialsAction(): Promise<[ApiResponse<Testimonial[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/testimonials",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Testimonial[]>) : null;
  return [resData, error];
}

export async function GetBlogPostsAction(): Promise<[ApiResponse<BlogPost[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/blog-posts",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<BlogPost[]>) : null;
  return [resData, error];
}

export async function GetBlogPostBySlugAction(
  slug: string
): Promise<[ApiResponse<BlogPost> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/blog-posts/${slug}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<BlogPost>) : null;
  return [resData, error];
}

export async function GetTeamMembersAction(): Promise<[ApiResponse<TeamMember[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/team-members",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<TeamMember[]>) : null;
  return [resData, error];
}

export async function GetServicePageBySlugAction(
  slug: string
): Promise<[ApiResponse<ServicePage> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/service-pages/${slug}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ServicePage>) : null;
  return [resData, error];
}

export async function GetFeaturedTutorsAction(): Promise<[ApiResponse<FeaturedTutor[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/public/featured-tutors",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<FeaturedTutor[]>) : null;
  return [resData, error];
}

"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CurriculumNode, CurriculumNodeType, CurriculumServiceType, ExamCourseCombination } from "@/types/curriculum";

// Powers the Subjects & Schedule step's Country -> Curriculum -> Grade Level
// -> Class/Year -> Subject drill-down, plus the admin taxonomy/pricing/tutor
// pickers. Public/unauthenticated on the backend. Omit `parent` for root
// COUNTRY nodes.
export async function GetCurriculumChildrenAction(
  parent: string | null,
  serviceType?: CurriculumServiceType
): Promise<[ApiResponse<CurriculumNode[]> | null, string | null]> {
  const params = new URLSearchParams();
  if (parent) params.set("parent", parent);
  if (serviceType) params.set("serviceType", serviceType);
  const qs = params.toString();

  const [res, error] = await fetchAPI({
    url: `/public/curriculum-nodes${qs ? `?${qs}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CurriculumNode[]>) : null;
  return [resData, error];
}

// Single-node lookup - used once an EXAM node is selected to surface its
// fullName/description/grades/requiredSubjects/courseCombinations, which
// GetCurriculumChildrenAction doesn't return (it only returns children).
export async function GetCurriculumNodeAction(id: string): Promise<[ApiResponse<CurriculumNode> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/curriculum-nodes/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CurriculumNode>) : null;
  return [resData, error];
}

interface CurriculumNodeMutationFields {
  fullName?: string;
  description?: string;
  grades?: string[];
  requiredSubjects?: string[];
  courseCombinations?: ExamCourseCombination[];
}

// Mutations require ADMIN (with the MANAGE_PRICING permission) or SUPER_ADMIN
// on the backend - see CurriculumNodeService.assertCanManageCurriculum.
export async function CreateCurriculumNodeAction(
  data: {
    serviceType: CurriculumServiceType;
    parent?: string;
    type: CurriculumNodeType;
    name: string;
    order?: number;
  } & CurriculumNodeMutationFields
): Promise<[ApiResponse<CurriculumNode> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/curriculum-nodes",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CurriculumNode>) : null;
  return [resData, error];
}

export async function UpdateCurriculumNodeAction(
  id: string,
  data: Partial<{ name: string; order: number } & CurriculumNodeMutationFields>
): Promise<[ApiResponse<CurriculumNode> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/curriculum-nodes/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CurriculumNode>) : null;
  return [resData, error];
}

export async function DeleteCurriculumNodeAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/curriculum-nodes/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

// Deep-copies sourceId's descendant subtree (e.g. WAEC's Category/Subject
// nodes) to become descendants of targetId (e.g. a newly-created NECO node) -
// see CurriculumNodeService.cloneInto.
export async function CloneCurriculumNodeAction(
  sourceId: string,
  targetId: string
): Promise<[ApiResponse<CurriculumNode[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/curriculum-nodes/${sourceId}/clone-into/${targetId}`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<CurriculumNode[]>) : null;
  return [resData, error];
}

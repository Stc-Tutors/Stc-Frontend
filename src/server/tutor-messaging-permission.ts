"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { GrantTutorMessagingPermissionDto, ITutorMessagingPermission } from "@/types/tutor-messaging-permission";

// Gated on AdminPermission.MANAGE_MESSAGING_PERMISSIONS (HOD not eligible -
// this is an ADMIN_ROLES/SUPER_ADMIN/ALMIGHTY_ADMIN-only capability) - see
// stcbe's tutor-messaging-permission.routes.ts.
export async function GetTutorMessagingPermissionsAction(): Promise<
  [ApiResponse<ITutorMessagingPermission[]> | null, string | null]
> {
  const [res, error] = await fetchAPI({
    url: "/admin/tutor-messaging-permissions",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITutorMessagingPermission[]>) : null;
  return [resData, error];
}

export async function GrantTutorMessagingPermissionAction(
  data: GrantTutorMessagingPermissionDto
): Promise<[ApiResponse<ITutorMessagingPermission> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/tutor-messaging-permissions",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITutorMessagingPermission>) : null;
  return [resData, error];
}

export async function RevokeTutorMessagingPermissionAction(
  id: string
): Promise<[ApiResponse<ITutorMessagingPermission> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/tutor-messaging-permissions/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITutorMessagingPermission>) : null;
  return [resData, error];
}

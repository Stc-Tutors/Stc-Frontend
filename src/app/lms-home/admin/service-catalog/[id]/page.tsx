"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GetServiceByIdAction, UpdateServiceAction } from "@/server/service-catalog";
import { GetCoursesAction } from "@/server/course";
import { ArchitecturalPath, IService, IServiceFlowRequirements, ServiceCatalogStatus, UpdateServiceDto } from "@/types/service-catalog";
import { Course } from "@/types/course";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ServiceFlowRequirementsFieldset } from "@/components/service-flow-requirements-fieldset";
import { TaxonomyStageEditor } from "@/components/taxonomy-stage-editor";
import CurriculumCoursesPanel from "@/components/curriculum-courses-panel";
import VideoLessonsPanel from "@/components/video-lessons-panel";
import { ClassGroupManager } from "@/components/class-group-manager";
import { CustomFormFieldManager } from "@/components/custom-form-field-manager";

function statusBadgeClass(status: ServiceCatalogStatus): string {
  if (status === ServiceCatalogStatus.ACTIVE) return "bg-green-100 text-green-700";
  if (status === ServiceCatalogStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

const selectClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm";

// Per-service workspace - the "click a service, land on everything about
// it" screen: one place to edit its metadata/flow-requirements/curriculum
// tree shape, then manage its Curriculum & Courses/Video Lessons/Class
// Groups/Custom Questions without hunting across five disconnected screens.
// Mirrors Stc-SuperAdmin's page of the same name so an ADMIN with
// MANAGE_TAXONOMY (not just SUPER_ADMIN) gets the identical workspace here.
//
// A "course" IS the content unit attached to a leaf of this service's
// curriculum tree, so browsing the tree and managing courses live together
// in one tab (Curriculum & Courses) instead of two disconnected ones. Video
// lesson authoring is its own tab, decoupled from course creation/analytics.
// `courses` is fetched once here and threaded down to both tabs so neither
// re-fetches on every switch - combined with `forceMount` below, this is
// what fixes the tab-switching lag (Radix was fully unmounting/remounting
// each tab, forcing every previously-visited tab to re-fetch from scratch).
export default function ServiceWorkspacePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
      <ServiceWorkspacePageInner />
    </Suspense>
  );
}

function ServiceWorkspacePageInner() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [service, setService] = useState<IService | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");
  const initialCourseId = searchParams.get("course") || undefined;

  const [form, setForm] = useState<UpdateServiceDto>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res, error] = await GetServiceByIdAction(id as string);
    if (error || !res?.data) {
      setLoadError(error || "Service not found");
      setIsLoading(false);
      return;
    }
    setLoadError(null);
    setService(res.data);
    setForm({
      serviceName: res.data.serviceName,
      targetAudience: res.data.targetAudience ?? "",
      architecturalPath: res.data.architecturalPath,
      flowRequirements: { ...res.data.flowRequirements },
      taxonomyStages: res.data.taxonomyStages ? [...res.data.taxonomyStages] : [],
      description: res.data.description ?? "",
      status: res.data.status,
    });

    const [coursesRes] = await GetCoursesAction({ serviceType: res.data.slug });
    setCourses(coursesRes?.data ?? []);

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFlow = (key: keyof IServiceFlowRequirements) => {
    setForm((prev) => ({
      ...prev,
      flowRequirements: { ...prev.flowRequirements, [key]: !prev.flowRequirements?.[key] },
    }));
  };

  const handleSave = async () => {
    if (!service) return;
    if (!form.serviceName?.trim()) {
      setMessage("Service name is required.");
      return;
    }
    setIsSaving(true);
    const [, err] = await UpdateServiceAction(service.id, {
      ...form,
      serviceName: form.serviceName.trim(),
      targetAudience: form.targetAudience?.trim() || undefined,
      description: form.description?.trim() || undefined,
      // Full replace on the backend - always send the complete re-ordered
      // array, never a partial diff (unlike flowRequirements, which merges).
      taxonomyStages: form.taxonomyStages ?? [],
    });
    setIsSaving(false);
    if (err) {
      setMessage(err);
      return;
    }
    setMessage("Service updated.");
    load();
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!service) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/lms-home/admin/service-catalog" className="flex items-center text-gray-600 text-sm hover:text-gray-900 w-fit">
          <ArrowLeft className="size-4 mr-2" />
          Back to Service Catalog
        </Link>
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/lms-home/admin/service-catalog" className="flex items-center text-gray-600 text-sm hover:text-gray-900 w-fit">
        <ArrowLeft className="size-4 mr-2" />
        Back to Service Catalog
      </Link>

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900">{service.serviceName}</h1>
          <span className={`text-xs rounded-full px-2 py-0.5 ${statusBadgeClass(service.status)}`}>{service.status}</span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          <span className="font-mono text-xs">{service.slug}</span> · {service.architecturalPath}
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Curriculum & Courses</TabsTrigger>
          <TabsTrigger value="courses">Video Lessons</TabsTrigger>
          <TabsTrigger value="class-groups">Class Groups</TabsTrigger>
          <TabsTrigger value="custom-questions">Custom Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4" forceMount>
          <div className="max-w-3xl space-y-6">
            {message && <p className="text-sm text-blue-600">{message}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Service ID</Label>
                <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 font-mono">
                  {service.serviceId}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Slug</Label>
                <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 font-mono">
                  {service.slug}
                </div>
                <p className="text-xs text-gray-400">
                  Locked after creation - pricing, courses, and the curriculum tree already reference this value.
                </p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs text-gray-500">Service name</Label>
                <Input
                  value={form.serviceName ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, serviceName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Target audience</Label>
                <Input
                  value={form.targetAudience ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Architectural path</Label>
                <select
                  className={selectClass}
                  value={form.architecturalPath}
                  onChange={(e) => setForm((p) => ({ ...p, architecturalPath: e.target.value as ArchitecturalPath }))}
                >
                  {Object.values(ArchitecturalPath).map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Status</Label>
                <select
                  className={selectClass}
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ServiceCatalogStatus }))}
                >
                  {Object.values(ServiceCatalogStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-xs text-gray-500">Description</Label>
                <Textarea
                  rows={2}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>

            <ServiceFlowRequirementsFieldset value={form.flowRequirements} onToggle={toggleFlow} />

            <TaxonomyStageEditor
              value={form.taxonomyStages ?? []}
              onChange={(stages) => setForm((p) => ({ ...p, taxonomyStages: stages }))}
            />

            <div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="pt-4" forceMount>
          <CurriculumCoursesPanel
            serviceType={service.slug}
            serviceId={service.id}
            stages={service.taxonomyStages}
            courses={courses}
          />
        </TabsContent>

        <TabsContent value="courses" className="pt-4" forceMount>
          <VideoLessonsPanel serviceType={service.slug} courses={courses} initialCourseId={initialCourseId} />
        </TabsContent>

        <TabsContent value="class-groups" className="pt-4" forceMount>
          <ClassGroupManager serviceType={service.slug} hideHeading />
        </TabsContent>

        <TabsContent value="custom-questions" className="pt-4" forceMount>
          <CustomFormFieldManager serviceType={service.slug} hideHeading />
        </TabsContent>
      </Tabs>
    </div>
  );
}

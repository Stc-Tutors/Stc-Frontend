"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CurriculumDrilldown from "@/components/curriculum-drilldown";
import { CurriculumNode } from "@/types/curriculum";
import { GetServicesAction } from "@/server/service-catalog";
import { GetCurriculumChildrenAction } from "@/server/curriculum";
import { CreateCourseAction, GetCourseAction, PublishCourseAction, UpdateCourseAction } from "@/server/course";
import { CreateCoursePayload } from "@/types/course";
import { IService } from "@/types/service-catalog";

interface CourseFormProps {
  // Set by the admin flow once an instructor is chosen; omitted for a tutor
  // creating their own course (the backend defaults tutorId to the caller).
  tutorId?: string;
  // Rendered above the Service select - the admin page's instructor search,
  // absent for the tutor's own flow.
  instructorPicker?: ReactNode;
  // Blocks submit until satisfied on top of this form's own required fields
  // (the admin flow requires an instructor to be picked first).
  canSubmit?: boolean;
  onSuccess?: (courseId: string) => void;
  // Set by entry points that already know which service/taxonomy node the
  // new course belongs to (e.g. "+ New course under X" from the Curriculum &
  // Courses tab) - hides the free Service select entirely and pins the form
  // to this service instead.
  lockedServiceSlug?: string;
  // Prefills the taxonomy-node picker (flat Age Range select or the deep
  // CurriculumDrilldown's resolved value) - same entry point as above.
  initialTaxonomyNodeId?: string;
  // When set, this form edits the existing course with this id instead of
  // creating a new one - every field is loaded from it on mount and submit
  // calls UpdateCourseAction instead of CreateCourseAction.
  courseId?: string;
  // When set, navigate here on successful create/update instead of calling
  // onSuccess - used by entry points that need to return the admin to
  // exactly where they started (e.g. back to the service workspace).
  returnTo?: string;
}

// The one course-creation form every entry point uses - a tutor creating
// their own course and an admin creating one on a tutor's behalf render the
// exact same fields (instructorPicker is the only addition for the latter),
// instead of two divergent implementations that drift out of sync with each
// other and with the Service Catalog. Not a locked multi-step wizard -
// every field stays editable at once, matching every other rebuilt taxonomy
// screen (Service Catalog's workspace, the SuperAdmin course-wizard).
//
// A course always belongs to exactly one service (picked here, never free
// text) and, when that service has a curriculum tree (IService.
// taxonomyStages non-empty), attaches to one leaf node of it via
// taxonomyNodeId - never the old free-text ageLevel/gradeLevel/curriculum
// fields.
export function CourseForm({
  tutorId,
  instructorPicker,
  canSubmit: canSubmitExtra = true,
  onSuccess,
  lockedServiceSlug,
  initialTaxonomyNodeId,
  courseId,
  returnTo,
}: CourseFormProps) {
  const router = useRouter();
  const isEditMode = !!courseId;

  const [services, setServices] = useState<IService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceSlug, setServiceSlug] = useState("");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [price, setPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // Taxonomy attachment - which of the two shapes applies depends on the
  // selected service's terminal stage type (see selectedService below).
  const [taxonomyNodeId, setTaxonomyNodeId] = useState(initialTaxonomyNodeId ?? "");
  const [ageRangeNodes, setAgeRangeNodes] = useState<CurriculumNode[]>([]);
  // Deep-tree services: CurriculumDrilldown resolves the Subject leaves for
  // whatever branch is currently drilled into - a course attaches to exactly
  // one, picked from this list once it resolves.
  const [resolvedSubjects, setResolvedSubjects] = useState<CurriculumNode[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // Edit mode sets serviceSlug programmatically once the course loads (see
  // below) - this flags that upcoming serviceSlug change so the reset effect
  // doesn't clobber the taxonomyNodeId the same load just set. Set to `true`
  // synchronously the moment the course fetch kicks off, consumed (and reset
  // to `false`) by the very next serviceSlug-change the reset effect sees.
  const isEditLoadRef = useRef(false);

  useEffect(() => {
    GetServicesAction().then(([res]) => {
      setServices(res?.data ?? []);
      setIsLoadingServices(false);
    });
  }, []);

  // Locked entry point (e.g. "+ New course under X") - pin the service
  // immediately rather than waiting for the admin to pick one.
  useEffect(() => {
    if (lockedServiceSlug) setServiceSlug(lockedServiceSlug);
  }, [lockedServiceSlug]);

  // Resets the taxonomy picker whenever the service actually changes (the
  // admin picking a different one from the dropdown) - skipped for the one
  // programmatic serviceSlug change caused by loading an existing course in
  // edit mode below, which already sets the correct taxonomyNodeId itself.
  useEffect(() => {
    if (isEditLoadRef.current) {
      isEditLoadRef.current = false;
      return;
    }
    setTaxonomyNodeId(initialTaxonomyNodeId ?? "");
    setResolvedSubjects([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug]);

  const selectedService = services.find((s) => s.slug === serviceSlug);
  const stages = selectedService?.taxonomyStages ?? [];
  const hasTree = stages.length > 0;
  // A flat, single-depth tree (e.g. tech-bootcamp's [AGE_RANGE]) is picked
  // directly from its root nodes; a deeper tree (academic-tutoring/exam-
  // preparation-shaped) is picked by drilling down to a Subject leaf, same
  // as everywhere else in the app (CurriculumDrilldown).
  const isFlatTree = hasTree && stages.length === 1;

  // Fetches the flat-tree root options independent of the reset effect above
  // (and keyed on the resolved service, not just its slug) so this still
  // fires correctly if `services` finishes loading after serviceSlug is
  // already set (e.g. the edit-mode load racing the services fetch).
  useEffect(() => {
    setAgeRangeNodes([]);
    if (!selectedService || !isFlatTree) return;
    GetCurriculumChildrenAction(null, selectedService.slug).then(([res]) => setAgeRangeNodes(res?.data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService?.slug, isFlatTree]);

  // Edit mode - load the existing course once and prefill every field.
  // Declared after the reset effect above so, on mount, that effect's first
  // (harmless, serviceSlug still "") pass runs before this sets the ref.
  useEffect(() => {
    if (!courseId) return;
    setIsLoadingCourse(true);
    isEditLoadRef.current = true;
    GetCourseAction(courseId).then(([res, err]) => {
      if (err || !res?.data) {
        setError(err || "Could not load course");
        setIsLoadingCourse(false);
        return;
      }
      const c = res.data;
      setServiceSlug(c.serviceType);
      setTitle(c.title);
      setSubtitle(c.subtitle ?? "");
      setDescription(c.description);
      setCategory(c.category);
      setLanguage(c.language);
      setPrice(String(c.price ?? ""));
      setCapacity(c.capacity ? String(c.capacity) : "");
      setCoverImageUrl(c.coverImageUrl ?? "");
      setTaxonomyNodeId(c.taxonomyNodeId ?? "");
      setIsLoadingCourse(false);
    });
  }, [courseId]);

  const canSubmit =
    canSubmitExtra &&
    !isLoadingCourse &&
    !!serviceSlug &&
    !!title.trim() &&
    !!description.trim() &&
    !!category.trim() &&
    !!language.trim() &&
    !!price.trim() &&
    (!hasTree || !!taxonomyNodeId);

  const afterSuccess = (id: string) => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    if (onSuccess) {
      onSuccess(id);
      return;
    }
    router.push(`/lms-home/admin/courses/${id}`);
  };

  const handleSubmit = async (publish: boolean) => {
    if (!canSubmit || !selectedService) return;
    setIsSubmitting(true);
    setError(null);

    const payload: CreateCoursePayload = {
      tutorId,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim(),
      category: category.trim(),
      language: language.trim(),
      serviceType: selectedService.slug,
      taxonomyNodeId: hasTree ? taxonomyNodeId : undefined,
      price: Number(price) || 0,
      capacity: capacity ? Number(capacity) : undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
    };

    const [resultRes, resultError] = isEditMode
      ? await UpdateCourseAction(courseId as string, payload)
      : await CreateCourseAction(payload);
    if (!resultRes?.data || resultError) {
      setError(resultError || `Failed to ${isEditMode ? "update" : "create"} course`);
      setIsSubmitting(false);
      return;
    }

    if (publish) {
      const [, publishError] = await PublishCourseAction(resultRes.data.id);
      if (publishError) {
        setError(publishError);
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(false);
    afterSuccess(resultRes.data.id);
  };

  if (isLoadingCourse) {
    return <p className="text-sm text-gray-500">Loading course...</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-4">
        {instructorPicker}

        {!lockedServiceSlug && (
          <div className="space-y-1">
            <Label>Service *</Label>
            <Select value={serviceSlug} onValueChange={setServiceSlug} disabled={isLoadingServices}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingServices ? "Loading..." : "Select a service"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.serviceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Input placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Subtitle (optional)" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>

        {selectedService && isFlatTree && (
          <div className="space-y-1">
            <Label>{stages[0].label} *</Label>
            <Select value={taxonomyNodeId} onValueChange={setTaxonomyNodeId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${stages[0].label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {ageRangeNodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedService && hasTree && !isFlatTree && (
          <div className="space-y-1">
            <Label>Attach to a subject *</Label>
            <CurriculumDrilldown
              key={selectedService.slug}
              serviceType={selectedService.slug}
              onSubjectsResolved={(subjects: CurriculumNode[]) => {
                setResolvedSubjects(subjects);
                setTaxonomyNodeId("");
              }}
            />
            {resolvedSubjects.length > 0 && (
              <Select value={taxonomyNodeId} onValueChange={setTaxonomyNodeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {resolvedSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input type="number" min={0} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input type="number" min={1} placeholder="Capacity (optional)" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        </div>
        <Input placeholder="Cover Image URL (optional)" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!canSubmit || isSubmitting} onClick={() => handleSubmit(false)}>
          Save as Draft
        </Button>
        <Button disabled={!canSubmit || isSubmitting} onClick={() => handleSubmit(true)}>
          {isSubmitting ? "Saving..." : isEditMode ? "Save & Publish" : "Submit for Review"}
        </Button>
      </div>
    </div>
  );
}

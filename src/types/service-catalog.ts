// Frontend mirror of stcbe's Service Taxonomy Standardization contract
// (core/interfaces/service.ts, taxonomy-option.ts, custom-form-field.ts,
// class-group.ts) - the DB-backed catalog that replaced the old hardcoded
// SERVICE_TOPICS/CURRICULA/INSTRUCTION_LANGUAGES lists in
// src/constants/taxonomy.ts for the enrollment flow.

import { CurriculumNodeType } from "./curriculum";

export enum ArchitecturalPath {
  ACADEMIC_TUTORING_TAXONOMY = "Academic Tutoring Taxonomy", // Path A
  EXAM_PREP_TAXONOMY = "Exam Prep Taxonomy", // Path B
  COURSE_MODULE = "Course Module", // Path C
  // No enrollment flow built for this yet - a service on this path should
  // not be selectable/completable in the student wizard.
  TENANT_DEPLOYMENT = "Tenant Deployment",
}

export enum ServiceCatalogStatus {
  ACTIVE = "Active",
  PLANNED = "Planned",
  ARCHIVED = "Archived",
}

export interface IServiceFlowRequirements {
  requires_country?: boolean;
  requires_curriculum?: boolean;
  requires_grade_level?: boolean;
  requires_class_year?: boolean;
  requires_subject?: boolean;
  requires_education_level?: boolean;
  requires_exam?: boolean;
  requires_category?: boolean;
  requires_age_range?: boolean;
  requires_cohort?: boolean;
  requires_course_selection?: boolean;
  requires_language_selection?: boolean;
  requires_tenant_setup?: boolean;
  requires_domain_mapping?: boolean;
}

// Which curriculum-tree depths this service has, in order - [] means the
// service has no tree at all and courses attach to it directly (no
// taxonomyNodeId). Drives both the depth labels shown in CurriculumDrilldown/
// TaxonomyTreePicker and which node TYPE an admin can create at a given
// depth in the curriculum-taxonomy tree editor. `alsoAllow` marks a stage
// whose terminal depth also accepts a second type (only ever set on
// exam-preparation's last stage today, where a branch can skip Category and
// go straight to Subject).
export interface ITaxonomyStage {
  type: CurriculumNodeType;
  label: string;
  order: number;
  alsoAllow?: CurriculumNodeType;
}

export interface IService {
  id: string;
  serviceId: string;
  slug: string;
  serviceName: string;
  targetAudience?: string;
  architecturalPath: ArchitecturalPath;
  flowRequirements: IServiceFlowRequirements;
  // [] for most services - only academic-tutoring, exam-preparation, and
  // tech-bootcamp are seeded with a non-empty sequence today, but any Active
  // service can be given one via the admin Service workspace.
  taxonomyStages: ITaxonomyStage[];
  description?: string;
  status: ServiceCatalogStatus;
  createdAt: string;
  updatedAt: string;
}

export enum TaxonomyOptionKind {
  COUNTRY = "COUNTRY",
  LANGUAGE = "LANGUAGE",
  AGE_RANGE = "AGE_RANGE",
  SPECIAL_COURSE_CATEGORY = "SPECIAL_COURSE_CATEGORY",
  TECH_CATEGORY = "TECH_CATEGORY",
  DIGITAL_SKILLS_BUNDLE = "DIGITAL_SKILLS_BUNDLE",
  MUSIC_INSTRUMENT = "MUSIC_INSTRUMENT",
  SOFT_SKILLS_TOPIC = "SOFT_SKILLS_TOPIC",
  CAREER_COACHING_TOPIC = "CAREER_COACHING_TOPIC",
  SELF_DEV_TOPIC = "SELF_DEV_TOPIC",
  ADULT_ED_FOCUS_AREA = "ADULT_ED_FOCUS_AREA",
  ACADEMIC_SUBJECT = "ACADEMIC_SUBJECT",
  EXAM_BOARD = "EXAM_BOARD",
  CURRICULUM_SYSTEM = "CURRICULUM_SYSTEM",
  // Professional Experience (Step 2)/Technical Readiness (Step 5) fields -
  // were fixed enums, moved to admin-editable taxonomy (v3.6).
  EDUCATION_QUALIFICATION = "EDUCATION_QUALIFICATION",
  TEACHING_CERTIFICATION = "TEACHING_CERTIFICATION",
  TUTOR_DEVICE_TYPE = "TUTOR_DEVICE_TYPE",
  TOOL_PROFICIENCY = "TOOL_PROFICIENCY",
}

export interface ITaxonomyOption {
  id: string;
  kind: TaxonomyOptionKind;
  value: string;
  label: string;
  order: number;
  isActive: boolean;
}

export enum ClassGroupStatus {
  OPEN = "OPEN",
  FULL = "FULL",
  CLOSED = "CLOSED",
}

export interface IClassGroup {
  id: string;
  serviceType: string;
  course?: string;
  subject?: string;
  ageRange?: string;
  label: string;
  capacity: number;
  confirmedCount: number;
  waitlistCount: number;
  startDate?: string;
  status: ClassGroupStatus;
}

export enum CustomFormFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  DROPDOWN = "DROPDOWN",
  CHECKBOX = "CHECKBOX",
  DATE = "DATE",
  NUMBER = "NUMBER",
}

// Mirrors stcbe's CUSTOM_FORM_STAGES (core/interfaces/custom-form-field.ts) -
// kept as a plain string union rather than importing from the backend, but
// literal-for-literal identical so `stage` query params match exactly.
export type CustomFormStage =
  | "student-registration:service-selection"
  | "student-registration:child-info"
  | "student-registration:subjects-schedule"
  | "student-registration:review"
  | "tutor-onboarding:personal-information"
  | "tutor-onboarding:professional-experience"
  | "tutor-onboarding:final-evaluation"
  | "tenant-inquiry:demo-request";

export interface ICustomFormField {
  id: string;
  stage: CustomFormStage;
  serviceType?: string;
  label: string;
  fieldType: CustomFormFieldType;
  options?: string[];
  required: boolean;
  order: number;
  // Public GetCustomFormFieldsAction is active-only server-side, so this was
  // never needed there; the admin builder needs it to show/toggle inactive
  // fields.
  isActive: boolean;
}

// Answers keyed by ICustomFormField.id - see CreateStudentDto.customFieldResponses.
export type CustomFieldResponses = Record<string, string | string[] | number | boolean>;

// ---------------------------------------------------------------------------
// Everything below powers the admin management screens for this same
// contract (lms-home/admin/{service-catalog,taxonomy-options,class-groups,
// custom-form-fields}) - the "Service Taxonomy Standardization" tooling that
// lets an STC_ADMIN/TUTOR_ADMIN (MANAGE_TAXONOMY permission) grow this
// catalog instead of only reading it. Kept in this same file rather than
// split into service-catalog/taxonomy-options/class-groups/custom-form-field
// type files since the four resources already share IService/ITaxonomyOption/
// IClassGroup/ICustomFormField above and the backend treats them as one
// module (stcbe's Service Taxonomy Standardization work).

// Exact key names matter - the student/tutor-facing registration forms (see
// service-selection.tsx et al above) read these booleans verbatim to decide
// which taxonomy dropdowns/steps to render. Turning a flag OFF means "select
// None, hide this field downstream" for those forms - the admin edit UI says
// so explicitly rather than rendering a bare checkbox.
export const FLOW_REQUIREMENT_LABELS: Record<keyof IServiceFlowRequirements, string> = {
  requires_country: "Country",
  requires_curriculum: "Curriculum",
  requires_grade_level: "Grade Level",
  requires_class_year: "Class/Year",
  requires_subject: "Subject",
  requires_education_level: "Education Level",
  requires_exam: "Exam",
  requires_category: "Category",
  requires_age_range: "Age Range",
  requires_cohort: "Cohort",
  requires_course_selection: "Course Selection",
  requires_language_selection: "Language Selection",
  requires_tenant_setup: "Tenant Setup",
  requires_domain_mapping: "Domain Mapping",
};

export const FLOW_REQUIREMENT_KEYS = Object.keys(FLOW_REQUIREMENT_LABELS) as (keyof IServiceFlowRequirements)[];

export interface CreateServiceDto {
  serviceId: string;
  // Lowercase-kebab-case only - backend @Matches validator. This is the
  // machine key ServicePricing/Course/the curriculum tree/the public
  // frontends match a service by - never the display name.
  slug: string;
  serviceName: string;
  targetAudience?: string;
  architecturalPath: ArchitecturalPath;
  flowRequirements: IServiceFlowRequirements;
  // Omit/[] to leave this service without a curriculum tree - courses then
  // attach directly to the service with no taxonomyNodeId.
  taxonomyStages?: ITaxonomyStage[];
  description?: string;
  status?: ServiceCatalogStatus;
}

// flowRequirements is a partial merge server-side - toggling one key off in
// an update does not clear the others.
export type UpdateServiceDto = Partial<CreateServiceDto>;

export const TAXONOMY_OPTION_KIND_LABELS: Record<TaxonomyOptionKind, string> = {
  [TaxonomyOptionKind.COUNTRY]: "Country",
  [TaxonomyOptionKind.LANGUAGE]: "Language",
  [TaxonomyOptionKind.AGE_RANGE]: "Age Range",
  [TaxonomyOptionKind.SPECIAL_COURSE_CATEGORY]: "Special Course Category",
  [TaxonomyOptionKind.TECH_CATEGORY]: "Tech Skill Area",
  [TaxonomyOptionKind.DIGITAL_SKILLS_BUNDLE]: "Digital Skills Bundle",
  [TaxonomyOptionKind.MUSIC_INSTRUMENT]: "Music Instrument",
  [TaxonomyOptionKind.SOFT_SKILLS_TOPIC]: "Soft Skills Topic",
  [TaxonomyOptionKind.CAREER_COACHING_TOPIC]: "Career Coaching Topic",
  [TaxonomyOptionKind.SELF_DEV_TOPIC]: "Self-Development Topic",
  [TaxonomyOptionKind.ADULT_ED_FOCUS_AREA]: "Adult Education Focus Area",
  [TaxonomyOptionKind.ACADEMIC_SUBJECT]: "Academic Subject",
  [TaxonomyOptionKind.EXAM_BOARD]: "Exam Board",
  [TaxonomyOptionKind.CURRICULUM_SYSTEM]: "Curriculum System",
  [TaxonomyOptionKind.EDUCATION_QUALIFICATION]: "Education Qualification",
  [TaxonomyOptionKind.TEACHING_CERTIFICATION]: "Teaching Certification",
  [TaxonomyOptionKind.TUTOR_DEVICE_TYPE]: "Tutor Device Type",
  [TaxonomyOptionKind.TOOL_PROFICIENCY]: "Tool Proficiency",
};

export interface CreateTaxonomyOptionDto {
  kind: TaxonomyOptionKind;
  value: string;
  label: string;
  order?: number;
}

export interface UpdateTaxonomyOptionDto {
  label?: string;
  order?: number;
  isActive?: boolean;
}

export interface BatchTaxonomyOption {
  value: string;
  label: string;
  order?: number;
}

export const CLASS_GROUP_STATUS_LABELS: Record<ClassGroupStatus, string> = {
  [ClassGroupStatus.OPEN]: "Open",
  [ClassGroupStatus.FULL]: "Full",
  [ClassGroupStatus.CLOSED]: "Closed",
};

export interface CreateClassGroupDto {
  serviceType: string;
  course?: string;
  subject?: string;
  ageRange?: string;
  label: string;
  capacity: number;
  startDate?: string;
}

export interface UpdateClassGroupDto {
  label?: string;
  capacity?: number;
  startDate?: string;
}

export const CUSTOM_FORM_FIELD_TYPE_LABELS: Record<CustomFormFieldType, string> = {
  [CustomFormFieldType.TEXT]: "Text",
  [CustomFormFieldType.TEXTAREA]: "Text area",
  [CustomFormFieldType.DROPDOWN]: "Dropdown",
  [CustomFormFieldType.CHECKBOX]: "Checkbox",
  [CustomFormFieldType.DATE]: "Date",
  [CustomFormFieldType.NUMBER]: "Number",
};

// Field types that need an options editor - backend 400s if options is
// missing/empty for these.
export const FIELD_TYPES_WITH_OPTIONS: CustomFormFieldType[] = [
  CustomFormFieldType.DROPDOWN,
  CustomFormFieldType.CHECKBOX,
];

// Mirrors stcbe's CUSTOM_FORM_STAGES - the admin builder groups fields by
// stage and offers one "Add field" per stage, in this order.
export const CUSTOM_FORM_STAGES: CustomFormStage[] = [
  "student-registration:service-selection",
  "student-registration:child-info",
  "student-registration:subjects-schedule",
  "student-registration:review",
  "tutor-onboarding:personal-information",
  "tutor-onboarding:professional-experience",
  "tutor-onboarding:final-evaluation",
  "tenant-inquiry:demo-request",
];

export const CUSTOM_FORM_STAGE_LABELS: Record<CustomFormStage, string> = {
  "student-registration:service-selection": "Student Registration — Service Selection",
  "student-registration:child-info": "Student Registration — Child Info",
  "student-registration:subjects-schedule": "Student Registration — Subjects & Schedule",
  "student-registration:review": "Student Registration — Review",
  "tutor-onboarding:personal-information": "Tutor Onboarding — Personal Information",
  "tutor-onboarding:professional-experience": "Tutor Onboarding — Professional Experience",
  "tutor-onboarding:final-evaluation": "Tutor Onboarding — Final Evaluation",
  "tenant-inquiry:demo-request": "Tenant Inquiry — Demo Request",
};

export interface CreateCustomFormFieldDto {
  stage: CustomFormStage;
  serviceType?: string;
  label: string;
  fieldType: CustomFormFieldType;
  options?: string[];
  required?: boolean;
  order?: number;
}

export interface UpdateCustomFormFieldDto {
  label?: string;
  options?: string[];
  required?: boolean;
  order?: number;
  isActive?: boolean;
}

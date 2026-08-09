"use client";

import { useEffect, useState } from "react";
import {
  CloneCurriculumNodeAction,
  CreateCurriculumNodeAction,
  DeleteCurriculumNodeAction,
  GetCurriculumChildrenAction,
  UpdateCurriculumNodeAction,
} from "@/server/curriculum";
import { CurriculumNode, CurriculumNodeType, ExamCourseCombination } from "@/types/curriculum";
import { ITaxonomyStage } from "@/types/service-catalog";

const TYPE_LABELS: Record<CurriculumNodeType, string> = {
  [CurriculumNodeType.COUNTRY]: "Country",
  [CurriculumNodeType.CURRICULUM]: "Curriculum",
  [CurriculumNodeType.LEVEL]: "Education Level / Grade Level",
  [CurriculumNodeType.CLASS]: "Class / Year",
  [CurriculumNodeType.SUBJECT]: "Subject",
  [CurriculumNodeType.EXAM]: "Exam",
  [CurriculumNodeType.CATEGORY]: "Category",
  [CurriculumNodeType.AGE_RANGE]: "Age Range",
};

// What a new/editable node at the current depth is allowed to be, driven
// entirely by the owning service's own `taxonomyStages` - no hardcoded
// per-shape switch. `alsoAllow` is only ever set on a service's terminal
// stage, for trees where some branches skip straight to a different
// terminal type (e.g. exam-prep's Category stage also allows Subject
// directly, for exams with no category tier). Depths beyond the declared
// sequence clamp to the last stage rather than erroring.
function typeOptionsForDepth(depth: number, stages: ITaxonomyStage[]): CurriculumNodeType[] {
  const stage = stages[depth] ?? stages[stages.length - 1];
  if (!stage) return [CurriculumNodeType.COUNTRY];
  return stage.alsoAllow ? [stage.type, stage.alsoAllow] : [stage.type];
}

const parseList = (value: string): string[] =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// The one tree browser/editor every consumer goes through - the per-service
// workspace's Subjects tab, the standalone Curriculum Taxonomy page, and (in
// `selectable` mode) course creation and service pricing, which need to pick
// a single node rather than manage the tree. Breadcrumb-driven, so any depth
// can be jumped to and edited directly - never a locked linear wizard.
// Mirrors Stc-SuperAdmin's component of the same name.
//
// `serviceType` (the Service Catalog slug this tree actually belongs to) and
// `stages` (that service's own tree shape) are both fixed for the lifetime
// of this component instance - callers that let the admin switch between
// services (the standalone Curriculum Taxonomy page) should remount this
// component (e.g. via a `key`) rather than expect it to react to the props
// changing mid-session, since a mid-tree switch would leave `path` pointing
// at nodes from the other tree.
export default function CurriculumTreeBrowser({
  serviceType,
  stages,
  selectable = false,
  selectedId,
  onSelect,
  onPositionChange,
}: {
  serviceType: string;
  stages: ITaxonomyStage[];
  selectable?: boolean;
  selectedId?: string;
  onSelect?: (node: CurriculumNode, path: CurriculumNode[]) => void;
  // Fired whenever the browsed position (current parent/breadcrumb path)
  // changes - lets a host panel (e.g. CurriculumCoursesPanel) show
  // courses scoped to whatever node is currently being browsed, without
  // this component needing to know anything about courses itself.
  onPositionChange?: (parent: CurriculumNode | null, path: CurriculumNode[]) => void;
}) {
  const [path, setPath] = useState<CurriculumNode[]>([]);
  const [children, setChildren] = useState<CurriculumNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [newType, setNewType] = useState<CurriculumNodeType>(CurriculumNodeType.COUNTRY);
  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState("0");
  const [newFullName, setNewFullName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newGrades, setNewGrades] = useState("");
  const [newRequiredSubjects, setNewRequiredSubjects] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("0");
  const [editFullName, setEditFullName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGrades, setEditGrades] = useState("");
  const [editRequiredSubjects, setEditRequiredSubjects] = useState("");
  const [editCombinations, setEditCombinations] = useState<ExamCourseCombination[]>([]);
  const [newComboCourse, setNewComboCourse] = useState("");
  const [newComboSubjects, setNewComboSubjects] = useState("");

  const [cloneSourceByNode, setCloneSourceByNode] = useState<Record<string, string>>({});
  const [isCloning, setIsCloning] = useState<string | null>(null);

  const currentParent = path.length > 0 ? path[path.length - 1] : null;
  const depth = path.length;
  const typeOptions = typeOptionsForDepth(depth, stages);

  const load = async (parentId: string | null) => {
    setIsLoading(true);
    const [res, error] = await GetCurriculumChildrenAction(parentId, serviceType);
    setIsLoading(false);
    if (error) {
      setMessage(error);
      return;
    }
    setChildren(res?.data ?? []);
  };

  useEffect(() => {
    load(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onPositionChange?.(currentParent, path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    setNewType(typeOptions[0]);
    setNewFullName("");
    setNewDescription("");
    setNewGrades("");
    setNewRequiredSubjects("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  const drillInto = (node: CurriculumNode) => {
    const nextPath = [...path, node];
    setPath(nextPath);
    load(node.id);
  };

  const goToDepth = (index: number) => {
    // index -1 = root
    const nextPath = index < 0 ? [] : path.slice(0, index + 1);
    setPath(nextPath);
    load(nextPath.length > 0 ? nextPath[nextPath.length - 1].id : null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setMessage("Enter a name before adding.");
      return;
    }
    const isExam = newType === CurriculumNodeType.EXAM;
    const [res, error] = await CreateCurriculumNodeAction({
      serviceType,
      parent: currentParent?.id,
      type: newType,
      name: newName.trim(),
      order: Number(newOrder) || 0,
      ...(isExam
        ? {
            fullName: newFullName.trim() || undefined,
            description: newDescription.trim() || undefined,
            grades: newGrades.trim() ? parseList(newGrades) : undefined,
            requiredSubjects: newRequiredSubjects.trim() ? parseList(newRequiredSubjects) : undefined,
          }
        : {}),
    });
    if (error || !res?.data) {
      setMessage(error || "Could not create node");
      return;
    }
    setNewName("");
    setNewOrder("0");
    setNewFullName("");
    setNewDescription("");
    setNewGrades("");
    setNewRequiredSubjects("");
    setMessage(null);
    load(currentParent?.id ?? null);
  };

  const startEdit = (node: CurriculumNode) => {
    setEditingId(node.id);
    setEditName(node.name);
    setEditOrder(String(node.order));
    setEditFullName(node.fullName ?? "");
    setEditDescription(node.description ?? "");
    setEditGrades((node.grades ?? []).join(", "));
    setEditRequiredSubjects((node.requiredSubjects ?? []).join(", "));
    setEditCombinations(node.courseCombinations ?? []);
    setNewComboCourse("");
    setNewComboSubjects("");
  };

  const addCombination = () => {
    if (!newComboCourse.trim() || !newComboSubjects.trim()) return;
    setEditCombinations((prev) => [...prev, { course: newComboCourse.trim(), subjects: parseList(newComboSubjects) }]);
    setNewComboCourse("");
    setNewComboSubjects("");
  };

  const removeCombination = (index: number) => {
    setEditCombinations((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEdit = async (id: string, isExam: boolean) => {
    const [, error] = await UpdateCurriculumNodeAction(id, {
      name: editName.trim(),
      order: Number(editOrder) || 0,
      ...(isExam
        ? {
            fullName: editFullName.trim() || undefined,
            description: editDescription.trim() || undefined,
            grades: editGrades.trim() ? parseList(editGrades) : undefined,
            requiredSubjects: editRequiredSubjects.trim() ? parseList(editRequiredSubjects) : undefined,
            courseCombinations: editCombinations.length > 0 ? editCombinations : undefined,
          }
        : {}),
    });
    if (error) {
      setMessage(error);
      return;
    }
    setEditingId(null);
    load(currentParent?.id ?? null);
  };

  const handleDelete = async (node: CurriculumNode) => {
    if (!confirm(`Delete "${node.name}"? This also deletes everything beneath it in the tree.`)) return;
    const [, error] = await DeleteCurriculumNodeAction(node.id);
    if (error) {
      setMessage(error);
      return;
    }
    load(currentParent?.id ?? null);
  };

  const handleClone = async (targetId: string) => {
    const sourceId = cloneSourceByNode[targetId];
    if (!sourceId) return;
    setIsCloning(targetId);
    const [, error] = await CloneCurriculumNodeAction(sourceId, targetId);
    setIsCloning(null);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("Cloned successfully.");
  };

  return (
    <div className="max-w-4xl space-y-6">
      {message && <p className="text-sm text-blue-600">{message}</p>}

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
        <button onClick={() => goToDepth(-1)} className={`hover:underline ${path.length === 0 ? "font-medium text-gray-900" : ""}`}>
          Root
        </button>
        {path.map((node, i) => (
          <span key={node.id} className="flex items-center gap-1">
            <span className="text-gray-300">/</span>
            <button
              onClick={() => goToDepth(i)}
              className={`hover:underline ${i === path.length - 1 ? "font-medium text-gray-900" : ""}`}
            >
              {node.name}
            </button>
          </span>
        ))}
      </div>

      {/* Children list */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">
          {currentParent ? `Children of "${currentParent.name}"` : "Root"}
        </h2>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : children.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing here yet - add one below.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {children.map((node) => {
              const isExam = node.type === CurriculumNodeType.EXAM;
              const cloneCandidates = children.filter((c) => c.type === CurriculumNodeType.EXAM && c.id !== node.id);
              return (
                <div key={node.id} className="py-2 space-y-2">
                  {editingId === node.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                        />
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm w-20"
                        />
                        <button onClick={() => saveEdit(node.id, isExam)} className="text-sm text-blue-600 hover:underline">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:underline">
                          Cancel
                        </button>
                      </div>
                      {isExam && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 rounded-md p-3">
                          <input
                            placeholder="Full name (e.g. West African Senior School Certificate Examination)"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm md:col-span-2"
                          />
                          <textarea
                            placeholder="Description (optional)"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm md:col-span-2"
                            rows={2}
                          />
                          <input
                            placeholder="Grades, comma-separated (e.g. SS1, SS2, SS3)"
                            value={editGrades}
                            onChange={(e) => setEditGrades(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                          <input
                            placeholder="Required subjects, comma-separated (e.g. Use of English)"
                            value={editRequiredSubjects}
                            onChange={(e) => setEditRequiredSubjects(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />

                          <div className="md:col-span-2 space-y-1">
                            <p className="text-xs font-medium text-gray-600">
                              Course combinations (e.g. JAMB&apos;s Medicine → Biology, Chemistry, Physics)
                            </p>
                            {editCombinations.length > 0 && (
                              <ul className="space-y-1">
                                {editCombinations.map((c, i) => (
                                  <li key={i} className="flex items-center justify-between text-xs bg-white border rounded-md px-2 py-1">
                                    <span>
                                      <span className="font-medium">{c.course}</span>: {c.subjects.join(", ")}
                                    </span>
                                    <button onClick={() => removeCombination(i)} className="text-red-600 hover:underline">
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="flex gap-1">
                              <input
                                placeholder="Course (e.g. Medicine)"
                                value={newComboCourse}
                                onChange={(e) => setNewComboCourse(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1 text-xs flex-1"
                              />
                              <input
                                placeholder="Subjects, comma-separated"
                                value={newComboSubjects}
                                onChange={(e) => setNewComboSubjects(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1 text-xs flex-1"
                              />
                              <button onClick={addCombination} className="text-xs text-blue-600 px-2 whitespace-nowrap">
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => (selectable ? onSelect?.(node, path) : drillInto(node))}
                        className={`text-sm text-left flex-1 ${
                          selectable && selectedId === node.id ? "text-blue-600 font-medium" : "text-gray-900 hover:text-blue-600"
                        }`}
                      >
                        {node.name}
                        <span className="ml-2 text-xs text-gray-400">{TYPE_LABELS[node.type]}</span>
                        {isExam && node.fullName && <span className="ml-2 text-xs text-gray-400">— {node.fullName}</span>}
                      </button>
                      {selectable && (
                        <button onClick={() => drillInto(node)} className="text-xs text-gray-500 hover:underline whitespace-nowrap">
                          Browse into
                        </button>
                      )}
                      {isExam && cloneCandidates.length > 0 && (
                        <div className="flex items-center gap-1">
                          <select
                            value={cloneSourceByNode[node.id] ?? ""}
                            onChange={(e) => setCloneSourceByNode((prev) => ({ ...prev, [node.id]: e.target.value }))}
                            className="border border-gray-300 rounded-md px-1 py-1 text-xs"
                          >
                            <option value="">Clone from...</option>
                            {cloneCandidates.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleClone(node.id)}
                            disabled={!cloneSourceByNode[node.id] || isCloning === node.id}
                            className="text-xs text-blue-600 hover:underline disabled:text-gray-300 whitespace-nowrap"
                          >
                            {isCloning === node.id ? "Cloning..." : "Clone"}
                          </button>
                        </div>
                      )}
                      <button onClick={() => startEdit(node)} className="text-xs text-gray-500 hover:underline whitespace-nowrap">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(node)} className="text-xs text-red-600 hover:underline whitespace-nowrap">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add child form */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Add {currentParent ? `to "${currentParent.name}"` : "at the root"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {typeOptions.length > 1 ? (
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as CurriculumNodeType)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          ) : (
            <div className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50">
              {TYPE_LABELS[typeOptions[0]]}
            </div>
          )}
          <input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm md:col-span-2"
          />
          <input
            type="number"
            placeholder="Order"
            value={newOrder}
            onChange={(e) => setNewOrder(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        {newType === CurriculumNodeType.EXAM && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 rounded-md p-3">
            <input
              placeholder="Full name (e.g. West African Senior School Certificate Examination)"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm md:col-span-2"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm md:col-span-2"
              rows={2}
            />
            <input
              placeholder="Grades, comma-separated (e.g. SS1, SS2, SS3)"
              value={newGrades}
              onChange={(e) => setNewGrades(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <input
              placeholder="Required subjects, comma-separated (e.g. Use of English)"
              value={newRequiredSubjects}
              onChange={(e) => setNewRequiredSubjects(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <p className="text-xs text-gray-400 md:col-span-2">
              Course combinations can be added after creating the exam, via Edit.
            </p>
          </div>
        )}

        <button onClick={handleCreate} className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm hover:bg-gray-800">
          Add
        </button>
      </div>
    </div>
  );
}

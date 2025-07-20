export function formatSubject(subject: string) {
  return subject
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// import { formatSubject } from "@/utils/formatSubject";

// const formatted = formatSubject(subject);

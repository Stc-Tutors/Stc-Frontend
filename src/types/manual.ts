export interface ManualSectionDto {
  id: string;
  title: string;
  summary: string;
  // True for the manual(s) that describe the signed-in person's own role; the rest are reference reading.
  primary: boolean;
  markdown: string;
}

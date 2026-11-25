/* Mohamed Zerouali (zrwlx) · Real Profile & Stack Data */

export const PROFILE_LINKS = {
  email: "mohamed.zeroualixxx@gmail.com",
  formEndpoint: "https://formsubmit.co/ajax/mohamed.zeroualixxx@gmail.com",
  github: "https://github.com/zeroualimohamed",
  linkedin: "https://www.linkedin.com/in/mohamed-zerouali-aa413b407/",
} as const;

export interface StackGroup {
  no: string;
  key: "databases" | "programming" | "systems" | "ai" | "visual";
  items: readonly string[];
}

export const STACK_GROUPS: readonly StackGroup[] = [
  {
    no: "01",
    key: "databases",
    items: ["Oracle", "MySQL", "PostgreSQL", "SQLite", "Relational Design", "Normalization", "Constraints"],
  },
  {
    no: "02",
    key: "programming",
    items: ["C", "C++", "Java", "PHP", "PL/SQL", "SQL", "NoSQL", "Algorithms"],
  },
  {
    no: "03",
    key: "systems",
    items: ["System Analysis", "Data Modeling", "Structured Design", "Cybersecurity (S2 Track)"],
  },
  {
    no: "04",
    key: "ai",
    items: ["Machine Learning", "Data Pipelines", "Model Training (Active Build)"],
  },
  {
    no: "05",
    key: "visual",
    items: ["Adobe Photoshop", "Blender 3D", "Arabic (Native)", "French (B1 - B2)", "English (B2 - C1)"],
  },
];

export const TICKER_ROW_1 = [
  "EMSI FÈS · 4IIRF",
  "CYBERSECURITY (S2)",
  "MACHINE LEARNING",
  "ORACLE / POSTGRESQL",
  "FACULTÉ POLYDISCIPLINAIRE DE TAZA",
  "PL/SQL & DATA MODELING",
  "BLENDER 3D · PHOTOSHOP",
] as const;

export const TICKER_ROW_2 = [
  "C / C++ / JAVA / PHP",
  "INFORMATION SYSTEMS",
  "RELATIONAL DATABASES",
  "ALGORITHMS & STRUCTURES",
  "HELIOS / ZRWLX ARCHIVE",
  "21 VISUAL COMPOSITIONS",
  "INTERNSHIP READY",
] as const;

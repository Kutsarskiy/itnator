// src/shared/types.ts

export type QuizQuestion = {
  id: number;
  textUk: string;
  weights: Record<string, number>;
  tags: string[];
};

export type CoreQuestion = {
  id: number;
  weights: Record<string, number>;
  tags?: string[];
};

export type DebugQuestion = Pick<QuizQuestion, "id" | "textUk">;

export type Specialty = {
  id: string;
  nameUk: string;
  shortUk: string;
  focusUk: string[];
  typicalRolesUk: string[];
  keyTraitsUk: string[];
  tags: string[];
};

import { z } from "zod";

export const examRequestSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  duration: z.number().int().positive().default(120),
  totalScore: z.number().int().positive().default(990),
  isActive: z.boolean().optional(),
});

export type ExamRequest = z.infer<typeof examRequestSchema>;

export const examResponseSchema = examRequestSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ExamResponse = z.infer<typeof examResponseSchema>;

export interface SectionResponse {
  id: string;
  exam_id: string;
  part: number;
  name: string;
  description?: string | null;
  order: number;
  groups?: GroupResponse[];
  questions?: QuestionResponse[];
}

export interface SectionRequest {
  part: number;
  name: string;
  description?: string | null;
  order: number;
}

export interface GroupResponse {
  id: string;
  section_id: string;
  transcript?: string | null;
  audioUrl?: string | null;
  order: number;
  questions?: QuestionResponse[];
}

export interface GroupRequest {
  transcript?: string | null;
  audioUrl?: string | null;
  order: number;
}

export interface QuestionResponse {
  id: string;
  section_id: string;
  group_id?: string | null;
  questionText?: string | null;
  options: any;
  correctAnswer: string;
  transcript?: string | null;
  order: number;
  explanation?: string | null;
}

export interface QuestionRequest {
  section_id: string;
  group_id?: string | null;
  questionText?: string | null;
  options: any;
  correctAnswer: string;
  transcript?: string | null;
  order: number;
  explanation?: string | null;
}



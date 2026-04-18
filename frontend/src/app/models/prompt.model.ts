// Prompt interface – matches backend JSON response exactly
export interface Prompt {
  id: number;
  title: string;
  content: string;
  complexity: number;
  created_at: string;
  tags: string[];
  author: string | null;
  view_count: number;
}

export interface CreatePromptDto {
  title: string;
  content: string;
  complexity: number;
  tags?: string[];
}

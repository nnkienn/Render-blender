export interface Project {
  id: number;
  title: string;
  description: string;
  poly_count: string;
  file_url: string;
  blender_script?: string | null;
  created_at: string;
}

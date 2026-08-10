export interface Comment {
  id: string;
  body: string;
  createdAt: number;
  author: { id: string; name: string };
}

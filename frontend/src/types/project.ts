export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: {
    id: string;
    email: string;
    name: string;
  }[];
} 
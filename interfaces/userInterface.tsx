export interface workspace {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  OwnerId: string | null;
  WorkspaceMember: {
    loggedInAt: string;
    createdAt: string;
    updatedAt: string;
    WorkspaceId: number;
    UserId: number;
  };
}
export interface user {
  id: number;
  nickname: string;
  email: string;
  Workspaces: Array<workspace>;
}

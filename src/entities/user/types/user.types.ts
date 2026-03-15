export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
};

export type CurrentUserResponse = {
  data: User;
};

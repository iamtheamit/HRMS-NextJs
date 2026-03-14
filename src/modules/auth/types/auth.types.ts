// auth.types.ts
// Declares TypeScript types for authentication-related data structures.

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
};


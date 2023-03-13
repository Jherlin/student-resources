// @types.user.tsx

export interface User {
  id: string,
  firstname: string,
  lastname: string,
  username: string,
  password: string
}

export type UserContextType = {
    user: User | {};
    setUser: React.Dispatch<React.SetStateAction<{}>>;
    fetchingUser: boolean;
};

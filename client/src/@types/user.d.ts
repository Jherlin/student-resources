export interface User {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: string
}

export type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  fetchingUser: boolean;
};

export interface UserStats {
  count: string,
  dateJoined: string
}

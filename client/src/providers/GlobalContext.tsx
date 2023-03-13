import { createContext } from "react";
import { UserContextType } from "../@types/user";

const GlobalContext = createContext<UserContextType | null>(null);

export default GlobalContext;

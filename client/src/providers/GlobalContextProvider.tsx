import React, { useState, useEffect, ReactNode } from "react";
import GlobalContext from "./GlobalContext";
import axios from "axios";
import { User } from "../@types/user";

interface Props {
  children?: ReactNode
}

const GlobalContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<User>({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: ""
    });
    const [fetchingUser, setFetchingUser] = useState(true);

    useEffect(() => {
      if (user.id) {
        return;
      };

      const fetchUser = async () => {
        console.log("fetching user...")
  
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fetch-user`, {
                  withCredentials: true,
                  headers: {
                      'Access-Control-Allow-Origin': '*',
                  },
              })
  
          if (response.status === 200) {
            setUser(response.data.user)
          }
        } 
        catch (error) {
          console.log(`No user exists with the current session... ${error}`)
        } finally {
          setFetchingUser(false);
        }
      };

      fetchUser();
    }, [user])

    return (
        <GlobalContext.Provider
            value={{
                user: user,
                setUser: setUser,
                fetchingUser: fetchingUser
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalContextProvider;

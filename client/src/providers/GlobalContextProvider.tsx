import React, { useState, useEffect, ReactNode } from "react";
import GlobalContext from "./GlobalContext";
import axios from "axios";

interface Props {
  children?: ReactNode
}

const GlobalContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState({});
    const [fetchingUser, setFetchingUser] = useState(true);
    
    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BASE_URL}/fetch-user`, {
                withCredentials: true,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            })
            .then((response) => {
                console.log(`Fetched session for user: ${response.data.user}`)
                setUser(response.data.user)
            })
            .catch((error) => {
                console.log(`No user exists with the current session... ${error}`)
            })
            .finally(() => {
                setFetchingUser(false)
            })
    }, [])

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

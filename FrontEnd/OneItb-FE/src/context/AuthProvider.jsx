import React, { createContext, useState, useEffect } from 'react';
import { useFetcher } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

   const [auth, setAuth] = useState({});

   useEffect(() => {
    authUser();
   }, []);

   const authUser = async() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if(!token || !user){
      return false;
    }

    const userObj = JSON.parse(user);
    //TODO comprobar user.id JWT
     
   }

  return (
    <AuthContext.Provider
        value={{
            auth,
            setAuth
        }}
    >
        {children}
    </AuthContext.Provider>
   
  )
}

export default AuthContext;
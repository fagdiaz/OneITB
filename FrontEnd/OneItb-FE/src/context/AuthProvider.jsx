import { useQuery } from '@apollo/client';
import React, { createContext, useState, useEffect } from 'react';
import { useFetcher } from 'react-router-dom';
import { GET_USER } from '../data/graphql/queries/getUser';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

   const [auth, setAuth] = useState({});   

   useEffect(() => {
    authUser();
   }, []);

   //const [authUserLocal, setauthUserLocal] = useState({});

  //  const {getUser} = useQuery(GET_USER, {
  //   fetchPolicy : 'network-only',
  //   variables:{
  //     id : authUserLocal?.id
  //   }
  //  });
   
   const authUser = async() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if(!token || !user){
      return false;
    }
      setAuth(user);    
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
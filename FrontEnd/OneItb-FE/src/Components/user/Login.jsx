import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { useMutation } from '@apollo/client'
import { AUTHENTICATE_USER } from '../../data/graphql/mutations/authenticateUser'
import { GraphQLProvider } from '../../data/graphql/GraphqlProvider'
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export const Login = () => {

  

  const {form , changed } = useForm({});
  const [saved, setSaved] = useState("not_sended");
  const {setAuth} = useAuth();
  const navigate = useNavigate();
 
  const loginUser = async(e) =>{
   
      e.preventDefault();
      try{
      const { data } = await authenticateUser();
      const { user, token } = data.authenticateUser;
      GraphQLProvider.setToken(token);
      GraphQLProvider.setUser(user);

      localStorage.setItem("token","token");
      localStorage.setItem("user", JSON.stringify(user));
      setSaved("login");//error
      setAuth(data.user);
      setTimeout(() => {
        window.location.reload();
      }, 1000)
      }
      catch(err){
        console.log(err);
        setSaved("error");
      }
  }

  const [authenticateUser, {loading}] = useMutation(AUTHENTICATE_USER,{
    variables:{
      email : form.email,
      password : form.password
    },
    fetchPolicy: 'network-only',
  });

  return (
    <>
        <header className="content__header content__header--public">
            <h1 className="content__title"> Login </h1>

        </header>
        
        <div className='content__posts'>

          {saved == "login" ? <strong className='alert alert-succes'>Usuario identificado</strong> : ''}
          {saved == "error" ? <strong className='alert alert-danger'>Usuario no identificado</strong> : ''}
              <form className='form-login' onSubmit={loginUser}>

                <div className='form-group'>
                  <label htmlFor='email'> Email</label>
                  <input type='email' name='email' onChange={changed}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='password'> Contraseña</label>
                  <input type='password' name='password' onChange={changed}/>
                </div>

                <input type="submit" value="Ingresar" className="btn btn-succes"/>

              </form>
        </div>
    </>
  )
}

import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { useMutation } from '@apollo/client'
import { AUTHENTICATE_USER } from '../../data/graphql/mutations/authenticateUser'
import { GraphQLProvider } from '../../data/graphql/GraphqlProvider'

export const Login = () => {

  

  const {form , changed } = useForm({});
  const [saved, setSaved] = useState("not_sended");

  const loginUser = async(e) =>{
   
      e.preventDefault();
      try{
      const { data } = await authenticateUser();
      const { user, token } = data.authenticateUser;
      GraphQLProvider.setToken(token);
      GraphQLProvider.setUser(user);

      //localStorage.setItem("token","token");
      //localStorage.setItem("user", user.email);
      setSaved("login");//error
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

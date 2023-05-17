import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'

export const Login = () => {

  const {form , changed } = useForm({})
  const [saved, setSaved] = useState("not_sended");

  const loginUser = async(e) =>{
      e.preventDefault();
      console.log(form)
      //todo add jwt auth

      localStorage.setItem("token","ASFSFASDASDASDASFASFASDASDASDFASD");
      localStorage.setItem("user", form.email);
      setSaved("login")//error
  }

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

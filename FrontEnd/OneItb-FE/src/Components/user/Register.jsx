import React from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { GET_USERS } from '../../data/graphql/queries/getUsers'
import { useForm } from '../../hooks/useForm';
import { ADD_USER } from '../../data/graphql/mutations/addUser'

export const Register = () => {

  const {loading, error, data} = useQuery(GET_USERS);
  const {form, changed} = useForm({});

  const saveUser = (e) => {
    e.preventDefault();
    let newUser = form;
    addUser();
    console.log(newUser)
  }

  const [addUser, {loading : addUserLoading}] = useMutation(ADD_USER, {
    variables:{
      fullName: form.name + form.surname,
      email: form.email,
      password: form.password,
      alias: form.alias
    }
  });
  
  return (
    <>
        <header className="content__header content__header--public">
            <h1 className="content__title"> Registro </h1>

        </header>
        
        <div className='content__posts'>
            <form className='register-form' onSubmit={saveUser}>

                <div className='form-group'>
                  <label htmlFor='name'>Nombre</label>
                  <input type="text" name = "name" onChange={changed}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='surname'>Apellidos</label>
                  <input type="text" name = "surname" onChange={changed}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='alias'>Alias</label>
                  <input type="text" name = "alias" onChange={changed}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='email'>Correo electronico</label>
                  <input type="email" name = "email" onChange={changed}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='password'>Contraseña</label>
                  <input type="password" name = "password" onChange={changed}/>
                </div>
               
                <input type='submit' value='Registrate' className='btn btn-success'></input>

            </form>
        </div>

        {loading ? <p> cargando.....</p> : <p>datos</p>}
    </>
  )
}

import React from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { GET_USERS } from '../../data/graphql/queries/getUsers'
import { useForm } from '../../hooks/useForm';
import { ADD_USER } from '../../data/graphql/mutations/addUser'

export const Register = () => {
 

  const {loading, error} = useQuery(GET_USERS);
  const {form, changed} = useForm({});
  const [saved, setSaved ] = useState("not_sended");
  const [errorMessage, setErrorMessage] = useState("");

  const saveUser = async (e) => {
    e.preventDefault();

    if (!form.name) {
      setErrorMessage("El campo Nombre es obligatorio.");
      setSaved("validation_error");
      return;
    }

    if (!form.surname) {
      setErrorMessage("El campo Apellidos es obligatorio.");
      setSaved("validation_error");
      return;
    }

    if (!form.alias) {
      setErrorMessage("El campo Alias es obligatorio.");
      setSaved("validation_error");
      return;
    }

    if (!form.email) {
      setErrorMessage("El campo Correo electrónico es obligatorio.");
      setSaved("validation_error");
      return;
    }

    if (!form.password) {
      setErrorMessage("El campo Contraseña es obligatorio.");
      setSaved("validation_error");
      return;
    }

    if (form.alias.length < 3) {
      setErrorMessage("El alias debe tener al menos 3 caracteres.");
      setSaved("validation_error");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9_\-\.]+@itbeltran\.com\.ar$/;
    if (!emailPattern.test(form.email)) {
      setErrorMessage("El correo electrónico debe pertenecer al dominio oficial @itbeltran.com.ar.");
      setSaved("validation_error");
      return;
    }

    if (form.password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      setSaved("validation_error");
      return;
    }

    const variables = {
      input: {
        username: form.alias,
        firstName: form.name,
        lastName: form.surname,
        email: form.email,
        password: form.password,
        enrolledCareers: []
      }
    };

    console.log("Datos a enviar a GraphQL:", variables);

    try{     
      const { data } = await addUser({ variables });
      setSaved("saved");
      console.log(data);
    }
    catch(error){
      console.log(error)
      setSaved("error");
      setErrorMessage(error.message);
    }
  }

  const [addUser, {loading : addUserLoading}] = useMutation(ADD_USER);
  
  return (
    <>
        <header className="content__header content__header--public">
            <h1 className="content__title"> Registro </h1>

        </header>
        
        {saved == "saved" ?
        <strong className='alert alert-succes'> Usuario registrado correctamente</strong>
        : <></>}

      {saved == "error" ?
        <strong className='alert alert-danger'> El usuario no se ha registrado: {errorMessage}</strong>
        : <></>}

      {saved == "validation_error" ?
        <strong className='alert alert-danger'> {errorMessage}</strong>
        : <></>}

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

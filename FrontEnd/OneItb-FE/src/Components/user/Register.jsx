import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_USERS } from '../../data/graphql/queries/getUsers'

export const Register = () => {

  const {loading, error, data} = useQuery(GET_USERS);
  return (
    <>
        <header className="content__header content__header--public">
            <h1 className="content__title"> Registro </h1>

        </header>
        
        <div className='content__posts'>

        </div>

        {loading ? <p> cargando.....</p> : <p>datos</p>}
    </>
  )
}
1524790709
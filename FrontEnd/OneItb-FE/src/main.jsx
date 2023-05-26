import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './assets/fonts/fontawesome-free-6.1.2-web/css/all.css'
import './assets/css/normalize.css'
import './assets/css/styles.css'
import './assets/css/responsive.css'
import { GraphQLProvider } from './data/graphql/GraphqlProvider'
import { ApolloProvider } from '@apollo/client'

ReactDOM.createRoot(document.getElementById('root')).render( 
    <ApolloProvider client={new GraphQLProvider().apolloInstance}>
        <App />  
    </ApolloProvider>
)

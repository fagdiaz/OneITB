import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './assets/fonts/fontawesome-free-6.1.2-web/css/all.css'
import './assets/css/normalize.css'
import './assets/css/styles.css'
import './assets/css/responsive.css'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
        uri: "https://localhost:44397/",
        cache : new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')).render( 
    <ApolloProvider client={client}>
        <App />  
    </ApolloProvider>
)

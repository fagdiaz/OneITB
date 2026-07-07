import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Global design system — sole CSS source of truth (036-theme-and-css-supremacy)
// Legacy files (styles.css, responsive.css, normalize.css) have been disconnected.
// FontAwesome is loaded via CDN in index.html.
import './index.css'

import { GraphQLProvider } from './data/graphql/GraphqlProvider'
import { ApolloProvider } from '@apollo/client'
import { ThemeProvider } from './context/ThemeContext'
import { GlobalErrorBoundary } from './Components/layout/GlobalErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render( 
    <ApolloProvider client={new GraphQLProvider().apolloInstance}>
        <ThemeProvider>
            <GlobalErrorBoundary>
                <App />
            </GlobalErrorBoundary>
        </ThemeProvider>
    </ApolloProvider>
)

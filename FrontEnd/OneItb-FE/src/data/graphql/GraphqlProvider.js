import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
        uri: "https://localhost:44397/graphql",
        cache : new InMemoryCache(),
});

export default client;
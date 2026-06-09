import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GeneralDataProvider } from '../GeneralDataProvider';

const httpLink = createHttpLink({
        uri: "https://localhost:44397/graphql",
});

const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('access_token');
        return {
                headers: {
                        ...headers,
                        authorization: token ? `Bearer ${token}` : "",
                }
        };
});

const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
});

//export default client;
export class GraphQLProvider extends GeneralDataProvider {
        constructor() {
                super();
                this.apolloInstance = new ApolloClient({
                        link: authLink.concat(httpLink),
                        cache: new InMemoryCache()
                });                
        }

        
}
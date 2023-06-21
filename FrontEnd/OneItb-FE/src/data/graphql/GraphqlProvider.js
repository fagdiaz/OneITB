import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { GeneralDataProvider } from '../GeneralDataProvider';

const client = new ApolloClient({
        uri: "https://localhost:44397/graphql",
        cache: new InMemoryCache(),
});

//export default client;
export class GraphQLProvider extends GeneralDataProvider {
        constructor() {
                super();
                this.apolloInstance = new ApolloClient({
                        uri: "https://localhost:44397/graphql",
                        cache: new InMemoryCache()
                });                
        }

        
}
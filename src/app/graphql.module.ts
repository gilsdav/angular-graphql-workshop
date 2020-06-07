import { NgModule } from '@angular/core';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink, Options } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { DefaultOptions } from 'apollo-client';
// For Subscriptions
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
    pollInterval: 5000 // 0 = uniq call (same as "query")
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};

const mainUri = environment.baseGraphQLUrl;
const mainUriWs = environment.baseGraphQLUrlWS;
const authUri = environment.authGraphQLUrl;

@NgModule({
  exports: [ApolloModule, HttpLinkModule]
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink
  ) {
    // Pizza
    const options1: Options = { uri: mainUri, withCredentials: true };
    const http = httpLink.create(options1);
    const ws = new WebSocketLink({
      uri: mainUriWs,
      options: {
        reconnect: true
      }
    });
    const link = split(({ query }) => {
      const { kind, operation }: any = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    }, ws, http);
    apollo.createDefault({
      link,
      cache: new InMemoryCache(),
      defaultOptions
    });

    // Auth
    const options2: Options = { uri: authUri, withCredentials: true };
    apollo.createNamed('auth', {
      link: httpLink.create(options2),
      cache: new InMemoryCache(),
      defaultOptions
    });
  }
}

import { NgModule } from '@angular/core';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink, Options } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../environments/environment';
import { DefaultOptions } from 'apollo-client';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
    pollInterval: 0
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  },
};

const mainUri = environment.baseGraphQLUrl;
const authUri = environment.authGraphQLUrl;
// export function createApollo(httpLink: HttpLink) {
//   return {
//     link: httpLink.create({uri}),
//     cache: new InMemoryCache(),
//   };
// }

@NgModule({
  exports: [ApolloModule, HttpLinkModule]
  // providers: [
  //   {
  //     provide: APOLLO_OPTIONS,
  //     useFactory: createApollo,
  //     deps: [HttpLink],
  //   },
  // ],
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink
  ) {
    const options1: Options = { uri: mainUri, withCredentials: true };
    apollo.createDefault({
      link: httpLink.create(options1),
      cache: new InMemoryCache(),
      defaultOptions
    });

    const options2: Options = { uri: authUri, withCredentials: true };
    apollo.createNamed('auth', {
      link: httpLink.create(options2),
      cache: new InMemoryCache(),
      defaultOptions
    });
  }
}

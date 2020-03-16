import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { mapTo } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {

  constructor(private apollo: Apollo) { }

  public login(user: string, password: string): Observable<any> {
    const mutation = gql`
      mutation Login($user: String!, $password: String!) {
        login(user: $user, password: $password)
      }
    `;
    return this.apollo.use('auth').mutate({
      mutation,
      variables: {
        user,
        password
      }
    }).pipe(mapTo(null));
  }

}

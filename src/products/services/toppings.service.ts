import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Topping } from '../models/topping.model';

@Injectable()
export class ToppingsService {
  constructor(private http: HttpClient, private apollo: Apollo) {}

  getToppings(): Observable<Topping[]> {
    const query = gql`
      query {
        toppings {
          id,
          name
        }
      }
    `;
    return this.apollo.query<{toppings: Topping[]}>({ query })
      .pipe(map(result => result.data.toppings));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map, filter, mapTo } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Pizza } from '../models/pizza.model';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Topping } from '../models/topping.model';

@Injectable()
export class PizzasService {
  constructor(private http: HttpClient, private apollo: Apollo) {}

  getPizzas(): Observable<Pizza[]> {
    const query = gql`
      query GetAllPizzas {
        pizzas {
          id,
          name,
          toppings {
            id,
            name
          }
        }
      }
    `;
    return this.apollo.watchQuery<{pizzas: Pizza[]}>({
      query
    }).valueChanges.pipe(
      filter(result => !!result.data),
      map(result => {
        const pizzas: Pizza[] = result.data.pizzas;
        return pizzas;
      })
    );
  }

  getPizza(id: number, fetchToppings = false): Observable<{pizza: Pizza, toppings: Topping[]}> {
    const toppingsSubQuery = `
      ,
      toppings {
        id,
        name
      }
    `;
    const query = gql`
      query GetPizza($id: Int!) {
        pizza (id: $id) {
          id,
          name,
          toppings {
            id,
            name
          }
        }${fetchToppings ? toppingsSubQuery : ''}
      }
    `;
    return this.apollo.query<{pizza: Pizza, toppings: Topping[]}>({
      query,
      variables: {
        id
      }
    }).pipe(map(result => result.data));
  }

  createPizza(payload: Pizza): Observable<Pizza> {
    const mutation = gql`
      mutation CreatePizza($name: String!, $toppings: [Int]!) {
        createPizza (pizza: {name: $name, toppings: $toppings }) {
          id,
          name,
          toppings {
            id,
            name
          }
        }
      }
    `;
    return this.apollo.mutate<{ createPizza: Pizza }>({
      mutation,
      variables: {
        name: payload.name,
        toppings: payload.toppings.map(top => top.id)
      }
    }).pipe(map(response => response.data.createPizza));
  }

  updatePizza(payload: Pizza): Observable<Pizza> {
    const mutation = gql`
      mutation UpdateePizza($id: Int!,$name: String!, $toppings: [Int]!) {
        updatePizza (pizza: {id: $id, name: $name, toppings: $toppings }) {
          id,
          name,
          toppings {
            id,
            name
          }
        }
      }
    `;
    return this.apollo.mutate<{ updatePizza: Pizza }>({
      mutation,
      variables: {
        id: payload.id,
        name: payload.name,
        toppings: payload.toppings.map(top => top.id)
      }
    }).pipe(map(response => response.data.updatePizza));
  }

  removePizza(payload: Pizza): Observable<void> {
    const mutation = gql`
      mutation DeletePizza($id: Int!) {
        deletePizza (id: $id)
      }
    `;
    return this.apollo.mutate<{ deletePizza: Pizza }>({
      mutation,
      variables: {
        id: payload.id
      }
    }).pipe(mapTo(null));
  }
}

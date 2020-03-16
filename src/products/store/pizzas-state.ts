import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { Navigate } from '@ngxs/router-plugin';
import { PizzasService, ToppingsService, AuthService } from '../services';
import { Pizza } from '../models/pizza.model';
import { PizzasAction } from './pizzas-actions';
import { Topping } from '../models/topping.model';

export interface PizzasStateModel {
  pizzas: Pizza[];
  pizzasLoading: boolean;
  selectedPizza: Pizza;
  toppings: Topping[];
}

@State<PizzasStateModel>({
  name: 'pizzas',
  defaults: { pizzas: [], selectedPizza: null, toppings: [], pizzasLoading: false }
})
@Injectable()
export class PizzasState implements NgxsOnInit {
  constructor(
    private pizzasService: PizzasService,
    private toppingsService: ToppingsService,
    private authService: AuthService) {
  }

  @Selector()
  static pizzas(state: PizzasStateModel) {
    return state.pizzas;
  }

  @Selector()
  static toppings(state: PizzasStateModel) {
    return state.toppings;
  }

  @Selector()
  static selectedPizza(state: PizzasStateModel) {
    return state.selectedPizza;
  }

  @Selector()
  static pizzasLoading(state: PizzasStateModel) {
    return state.pizzasLoading;
  }

  ngxsOnInit(ctx: StateContext<PizzasStateModel>) {
    this.authService.login('bob', 'dylan').subscribe();
  }

  @Action(PizzasAction.LoadList)
  loadPizzas(ctx: StateContext<PizzasStateModel>) {
    ctx.patchState({ pizzasLoading: true, pizzas: [] });
    return this.pizzasService.getPizzas().pipe(
      tap(pizzas => {
        ctx.patchState({ pizzas, pizzasLoading: false });
      })
    );
  }

  @Action(PizzasAction.GetById)
  getPizza(ctx: StateContext<PizzasStateModel>, action: PizzasAction.GetById) {
    const patchState = ctx.patchState;
    const currentState = ctx.getState();
    const loadToppings = !currentState.toppings || currentState.toppings.length === 0;
    if (action.id) {
      patchState({ pizzasLoading: true, selectedPizza: null });
      return this.pizzasService.getPizza(action.id, loadToppings).pipe(
        tap(({pizza, toppings}) => {
          const toPatch: Partial<PizzasStateModel> = {
            pizzasLoading: false,
            selectedPizza: pizza
          };
          if (toppings) {
            toPatch.toppings = toppings;
          }
          patchState(toPatch);
        })
      );
    } else {
      patchState({ selectedPizza: {} });
      if (loadToppings) {
        return this.loadToppings(ctx)
      } else {
        return of(null);
      }
    }
  }

  @Action(PizzasAction.LoadToppings)
  loadToppings({ patchState }) {
    return this.toppingsService.getToppings().pipe(
      tap(toppings => {
        patchState({ toppings });
      })
    );
  }

  @Action(PizzasAction.Add)
  addPizza(ctx: StateContext<PizzasStateModel>, action: PizzasAction.Add) {
    return this.pizzasService.createPizza(action.pizza).subscribe(pizza => {
      ctx.dispatch(new Navigate([`/products`]));
    });
  }

  @Action(PizzasAction.Update)
  updatePizza(ctx: StateContext<PizzasStateModel>, action: PizzasAction.Update) {
    ctx.setState(
      patch({
        pizzas: updateItem<Pizza>(pizza => pizza.id === action.pizza.id, action.pizza)
      })
    );
    return this.pizzasService.updatePizza(action.pizza).subscribe(() => {
      ctx.dispatch(new Navigate([`/products`]));
    });
  }

  @Action(PizzasAction.Delete)
  deletePizza(ctx: StateContext<PizzasStateModel>, action: PizzasAction.Delete) {
    const state = ctx.getState();
    const remove = window.confirm('Are you sure?');
    if (remove) {
      ctx.setState(
        patch({
          pizzas: state.pizzas.filter(pizza => pizza.id !== action.pizza.id)
        })
      );
      return this.pizzasService.removePizza(action.pizza).subscribe(() => {
        ctx.dispatch(new Navigate([`/products`]));
      });
    }
  }

  @Action(PizzasAction.Edit)
  editSelectedPizza({ patchState }, action: PizzasAction.Edit) {
    patchState({ selectedPizza: action.pizza });
  }
}

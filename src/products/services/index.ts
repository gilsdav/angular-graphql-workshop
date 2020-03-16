import { PizzasService } from './pizzas.service';
import { ToppingsService } from './toppings.service';
import { AuthService } from './auth.service';

export const services: any[] = [
  PizzasService,
  ToppingsService,
  AuthService
];

export * from './pizzas.service';
export * from './toppings.service';
export * from './auth.service';

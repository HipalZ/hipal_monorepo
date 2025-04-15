import { Hono } from 'hono';
import { fn } from './util';

export const couponRouter = new Hono();


// coupon /coupon
// 1. create
// 2. update
// 3. delete

couponRouter.post('/', fn) // [manager]
couponRouter.patch('/:id', fn) // [manager]
couponRouter.delete('/:id', fn) // [manager]
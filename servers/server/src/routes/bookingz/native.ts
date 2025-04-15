import { Hono } from 'hono';
import { fn } from './util';

export const bookingsNativeRouter = new Hono();


// bookings /native
// 1. create 
// 2. finalize payment 
// 3. cancel booking
// 4. check in 

bookingsNativeRouter.post('/', fn) // [customer, manager]
// bookingsNativeRouter.patch('/:id/finalize', fn) // [customer, manager]
bookingsNativeRouter.patch('/:id/cancel', fn) // [customer, manager]
bookingsNativeRouter.patch('/:id/checkin', fn) // [ manager]
import type { Context, Next } from 'hono';

export enum ClientRoles {
  OPERATOR = 'OPERATOR',
  HIPAL_ADMIN = 'HIPAL_ADMIN',
  HIPAL_CUSTOMER = 'HIPAL_CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  RESTAURANT_MANAGER = 'RESTAURANT_MANAGER',
  RESTAURANT_FLOOR_MANAGER = 'RESTAURANT_FLOOR_MANAGER',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
}

// ! Assumes we are going to call current Client before this middleware
export const requireAuthorization = (roles: ClientRoles[]) => {
  const checkAuthorization = async (c: Context, next: Next) => {
    // TODO: ADD A CHECK FOR LOCALHOST
    // if (c.req.header('host') !== 'localhost:4500') {
    //   return c.json({ message: 'Invalid Domain' }, 401);
    // }

    const currentUser = c.get('current_user');

    if (!currentUser) {
      return c.json({ message: 'Not Authorized' }, 401);
    }

    const exists = roles.includes(currentUser.role as ClientRoles);
    if (!exists) {
      return c.json({ message: 'Access Denied!' }, 401);
    }

    await next();
  };
  return checkAuthorization;
};

import type { Context, Next } from 'hono';

export enum ClientRoles {
  HIPAL_ADMIN = 'HIPAL_ADMIN',
  HIPAL_CUSTOMER = 'HIPAL_CUSTOMER',
  OWNER = 'OWNER',
  CO_OWNER = 'CO_OWNER',
  MANAGER = 'MANAGER',
  CAPTAIN = 'CAPTAIN',
  MARKETING_AGENT = 'MARKETING_AGENT',
}

// ! Assumes we are going to call tokenvalidator Client before this middleware

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

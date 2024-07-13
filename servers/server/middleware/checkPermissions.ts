import type { Context, Next } from 'hono';



// ! Assumes we are going to call tokenvalidator Client before this middleware
export const checkPermissions = (permissions: Permissions[]) => {
  const checkAuthorization = async (c: Context, next: Next) => {
    try {


      const currentUser = c.get('current_user');
      const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

      // Check if the user has any of the required permissions
      const hasPermission = permissionsArray.some(permission => currentUser.permissions.includes(permission));

      if (hasPermission) {
        next(); // User has at least one of the required permissions, proceed
      } else {
        return c.json({ message: 'Access Denied!' }, 403);
      }
    } catch (error) {

      return c.json({ message: 'Not Authorized' }, 401);

    }
  };
  return checkAuthorization;
};

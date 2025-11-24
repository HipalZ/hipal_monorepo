import type { UserSessionSchemaType } from "@hi/db-models/src/validators";

const checkOriginBillIsSplit = (original?: UserSessionSchemaType) => {
  return original?.isSplit || false;
};

export { checkOriginBillIsSplit };

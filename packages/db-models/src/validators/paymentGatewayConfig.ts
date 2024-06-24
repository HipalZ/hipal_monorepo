import * as z from 'zod';

export const PaymentGatewayCredentialsSchema = z.object({
  accessKey: z.string(),
  secretKey: z.string(),
  businessId: z.string(),
});

export type PaymentGatewayCredentialsSchemaType = z.infer<typeof PaymentGatewayCredentialsSchema>;

import mongoose from 'mongoose';

const paymentGatewayCredentialsSchema = new mongoose.Schema({
  accessKey: { type: String, required: true },
  secretKey: { type: String, required: true },
  businessId: { type: String, required: true },
});

const PaymentGatewayCredentials = mongoose.model('PaymentGatewayCredentials', paymentGatewayCredentialsSchema);

export default PaymentGatewayCredentials;

import Razorpay from "razorpay";

class RazorPayWrapper {
  private _client?: Razorpay;

  create(keyId: string, keySecret: string) {
    this._client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  get client() {
    if (!this._client) {
      throw new Error("Cannot access Razorpay client before creating it");
    }

    return this._client;
  }
}

export const razorpayWrapper = new RazorPayWrapper();

// Configuration for Petpooja POS credentials
const petpoojaPosConfig = Object.freeze({
  accessKey: "6jh08fc457wp2qkv1dntbrma3yeouxig",
  secretKey: "26669606e665e4a014ca1d426ff2d643551ed21a",
  authToken: "9aeec28f3aab55dd23033194beb39972d7ff6890",
});

// Base URL for the API
const posBaseUrl = "https://api.petpooja.com/V1/";

// API endpoint paths
const posApiPaths = Object.freeze({
  registerUser: `${posBaseUrl}captainorders/save_menu_qr_customer_information`,
  saveKot: `${posBaseUrl}captainorders/save_kot_qr_order`,
  getBill: `${posBaseUrl}captainorders/get_bill/`,
  requestBill: `${posBaseUrl}captainorders/request_bill/`,
  checkBill: `${posBaseUrl}captainorders/check_bill/`,
  fetchAreaAndTables:
    "https://onlineapipp.petpooja.com/thirdparty_fetch_dinein_menu",
  settleTable: `${posBaseUrl}captainorders/success_payment/`,
  fetchMenu: "https://onlineapipp.petpooja.com/thirdparty_fetch_dinein_menu/",
});

export { petpoojaPosConfig, posApiPaths, posBaseUrl };

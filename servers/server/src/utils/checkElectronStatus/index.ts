import axios from "axios";

/**
 * Calls the Electron status endpoint and returns its "active" value.
 * @returns {Promise<boolean>} true if active, false otherwise (or on error)
 */
export async function checkElectronJsStatus() {
  try {
    const { data } = await axios.get(
      "https://ws.test.hipalz.com/check_eletronjs_status",
    );
    // data = { event: string, active: boolean }
    return Boolean(data.active);
  } catch (err) {
    console.error("Error fetching ElectronJS status:", err);
    // fallback to false on network/error
    return false;
  }
}

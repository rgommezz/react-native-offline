/* @flow */

/** This is an internal store for component utilities (HoC and facc) **/

let isConnected = true;

export default {
  getConnection(): boolean {
    return isConnected;
  },
  setConnection(connection: boolean) {
    isConnected = connection;
  },
};

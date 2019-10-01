import { ConnectivityArgs } from "../types";
import {
  DEFAULT_TIMEOUT,
  DEFAULT_PING_SERVER_URL,
  DEFAULT_HTTP_METHOD
} from "./constants";

const DEFAULT_ARGS: ConnectivityArgs = {
  pingTimeout: DEFAULT_TIMEOUT,
  pingServerUrl: DEFAULT_PING_SERVER_URL,
  shouldPing: true,
  pingInterval: 0,
  pingOnlyIfOffline: false,
  pingInBackground: false,
  httpMethod: DEFAULT_HTTP_METHOD
};

export default DEFAULT_ARGS;

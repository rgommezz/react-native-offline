// @flow
export type EnqueuedAction =
  | {
      type: string,
      payload?: any,
      meta: {
        retry: boolean,
        dismiss?: Array<string>
      }
    }
  | Function;

export type FluxAction = {
  type: string,
  payload?: any,
  meta?: {
    retry: boolean,
    dismiss?: Array<string>
  }
};

export type NetworkState = {|
  isConnected: boolean,
  actionQueue: Array<FluxAction>
|};

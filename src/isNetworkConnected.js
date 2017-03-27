let hasInternetConnectivity = true;

export default function () {
  return hasInternetConnectivity;
}

export function setInternetConnectivity(connectivity) {
  hasInternetConnectivity = connectivity;
}

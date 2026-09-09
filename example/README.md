## Example app

This application showcases component utilities, Redux, sagas integration, and the offline queue with different configurations.

It targets **Expo SDK 54**, which matches the Expo Go build currently distributed on the Apple App Store (as of 2025–2026). Open it with Expo Go from the store, or install a matching build from [expo.dev/go](https://expo.dev/go).

### Running locally

```bash
cd example
npm install
npx expo start
```

Then scan the QR code with Expo Go (SDK 54) on your device, or press `i` / `a` for the iOS Simulator / Android emulator.

### What it demos

| Tab | Focus |
| --- | --- |
| **Components** | `NetworkProvider` / `NetworkConsumer` |
| **Redux** | `ReduxNetworkProvider` + offline action queue |
| **Sagas** | `networkSaga` (disconnect the device manually) |

### Notes

- Use the **Toggle Internet connection** button on the Components and Redux tabs to simulate offline mode via a fake ping URL.
- For the Sagas tab, turn off device networking manually so the saga-driven queue can be observed.

# HiPal Push MVP

Single-screen Expo app for validating staff push notifications on Android and iOS.

## Flow

1. Open the app on a real Android or iOS device.
2. Enter `API URL`, `businessId`, and staff `userId`.
3. Tap `Enable Notifications`.
4. Tap `Save Token`.
5. Tap `Send Push Test` or `Service Request Test`.

The backend stores this device as an Expo push token with `provider: "expo"` and can send to it through `/notifications/test`, `/notifications/service-request-test`, and the existing hotel alert creation flow.

## Builds

Use internal distribution so you can test without Play Store or App Store release:

```sh
bun install
cd clients/client-expo-push-test
npx expo start
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

For iOS, configure EAS and Apple signing first. After `eas init`, copy the generated project id into `app.json` under `extra.eas.projectId`.

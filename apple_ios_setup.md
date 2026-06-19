# Apple iOS Setup — HiTable

Last updated: 19 June 2026

This document records the iOS and push-notification work completed on the `test` branch, the reasoning behind each decision, and the remaining steps.

## 1. Goal and environment strategy

The existing React/Vite application is wrapped with Capacitor. We are reusing that application for iOS rather than rewriting it in Swift or React Native.

The existing Android identifiers will also be used for iOS so the environments stay consistent:

| Environment | App identifier |
| --- | --- |
| Test | `table.test.hipalz.com` |
| Production | `hiclient.hipalz.com` |

Firebase still requires separate Android and Apple app entries even when their identifier strings are the same.

The current work is only for the test environment. Production setup will be performed after the test app and notifications work correctly.

## 2. Xcode and Apple Developer account

Completed:

- Installed Xcode 26.5, build `17F42`.
- Installed the iPhone 17 Pro simulator/runtime.
- Signed into Xcode with the Apple account for **PALTRIBE SOLUTIONS PRIVATE LIMITED**.
- Confirmed the account has the **Admin** role and access to Certificates, Identifiers & Profiles.
- Selected the Paltribe development team in the App target.
- Confirmed the Apple Team ID is `8W8H449W92`.

Why the Team ID matters:

- The bundle ID identifies the app.
- The Team ID identifies the Apple Developer organization signing the app.
- Firebase uses the Team ID, APNs Key ID, and `.p8` private key to authenticate with Apple Push Notification service.

The project now contains:

```text
DEVELOPMENT_TEAM = 8W8H449W92
PRODUCT_BUNDLE_IDENTIFIER = table.test.hipalz.com
```

### Xcode command-line selection

The Mac initially pointed to `/Library/Developer/CommandLineTools` instead of the full Xcode installation. Xcode was successfully used with:

```bash
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
```

For a permanent system-wide selection, run locally if it has not already been done:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
xcodebuild -version
```

Expected version output should show Xcode 26.x.

## 3. Correct Xcode project to open

The repository folder itself was initially opened in Xcode, followed by `App.xcodeproj`.

After CocoaPods was installed, the correct file became:

```text
clients/client-hitable-react/ios/App/App.xcworkspace
```

Always open the workspace from now on because it contains the App project and its CocoaPods/Firebase dependencies:

```bash
open /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react/ios/App/App.xcworkspace
```

Do not build from `App.xcodeproj` after Pods have been installed.

## 4. Signing and provisioning status

Completed in Xcode under **TARGETS → App → Signing & Capabilities**:

- Enabled **Automatically manage signing**.
- Selected **PALTRIBE SOLUTIONS PRIVATE LIMITED**.
- Set the test bundle ID to `table.test.hipalz.com`.

Xcode currently displays a provisioning-profile warning because the Apple team has no registered physical iPhone. This warning does not prevent simulator builds.

Why a physical iPhone is still needed:

- A development provisioning profile requires a registered device.
- Real end-to-end Firebase/APNs delivery should be validated on a physical iPhone.
- Connecting an iPhone by USB, trusting the Mac, and selecting it in Xcode allows automatic signing to register it.

No manual certificate or provisioning-profile download is required while automatic signing is enabled.

## 5. Push Notifications capability

Completed:

- Added the **Push Notifications** capability to the App target.
- Xcode created `ios/App/App/App.entitlements`.
- The entitlement currently contains:

```text
aps-environment = development
```

Why this is required:

- It authorizes the signed app to register with Apple Push Notification service.
- Development/Xcode builds use the APNs sandbox environment.
- TestFlight and App Store builds will use the production APNs environment through their production provisioning profiles.

## 6. Firebase Apple app

Completed in the existing Firebase project `hipal-demo`:

- Created a separate Apple/iOS app.
- Apple bundle ID: `table.test.hipalz.com`.
- Added Apple Team ID: `8W8H449W92`.
- Downloaded `GoogleService-Info.plist`.
- Added the plist to the inner Xcode **App** group with **Copy items if needed** enabled.
- Confirmed the plist is included in the App target's Resources build phase.

Verified plist identity:

```text
BUNDLE_ID = table.test.hipalz.com
PROJECT_ID = hipal-demo
```

Why this file is required:

- It connects the native iOS Firebase SDK to the correct Firebase project and Apple app registration.
- Its bundle ID must exactly match the bundle ID used by Xcode.

## 7. CocoaPods and native Firebase SDK

Completed:

- Installed CocoaPods 1.16.2 using Homebrew.
- Installed the Capacitor 6-compatible `@capacitor-community/fcm@6.0.1` helper.
- Kept the existing `@capacitor/push-notifications` plugin.
- Ran Capacitor sync for iOS only.
- Generated `Podfile.lock` and the CocoaPods workspace.

Why the community FCM helper was selected:

- The existing Capacitor Push Notifications plugin returns an FCM token on Android but a raw APNs token on iOS.
- The current server sends through Firebase Admin and therefore expects FCM registration tokens.
- The helper is intended to be used with Capacitor Push Notifications and converts/accesses the iOS Firebase registration token.

Important Android safeguard:

- No Android native file was changed.
- The Android project was not synchronized.
- Android continues using its existing Capacitor Push Notifications and FCM implementation.
- Only use `cap sync ios` for this iOS setup. Do not run an unqualified `cap sync` or `cap sync android` unless Android changes are intentionally reviewed.

## 8. Application code changes

The following changes have been prepared on the test branch:

### Platform detection

`src/hooks/usePushNotifications.ts` now uses:

```ts
Capacitor.getPlatform()
```

Why:

- The old code detected only Android and treated every iPhone as `web`.
- Native iOS must use native notification APIs, not Firebase Web Messaging inside WKWebView.
- Android still follows the same existing native branch.

### iOS FCM token

`src/services/fcm/pushNotificationService.ts` keeps the existing Android registration behavior. On iOS only, after native APNs registration, it retrieves the Firebase FCM token using `@capacitor-community/fcm`.

Why:

- Android behavior remains unchanged.
- The iOS token stored by the backend becomes compatible with the existing Firebase Admin sender.

### Token metadata

`src/utils/apiService.ts` adds the following metadata only for iOS tokens:

```json
{
  "provider": "fcm",
  "platform": "ios",
  "app": "hitable"
}
```

Why:

- The server already supports these fields.
- They prevent iOS tokens from being mistaken for raw APNs, Android, or web tokens.
- Android API payload behavior remains unchanged.

### Native AppDelegate callbacks

`ios/App/App/AppDelegate.swift` now forwards successful and failed APNs registration events to Capacitor.

Why:

- Capacitor 6 requires these callbacks for its JavaScript registration listeners to receive the native result.

## 9. Build verification completed

The test web bundle was built successfully:

```bash
bun run --cwd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react build:test
```

The built web assets were copied into iOS:

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
  bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

The complete CocoaPods/Firebase iOS workspace built successfully for the iPhone 17 Pro simulator. Final result:

```text
** BUILD SUCCEEDED **
```

The simulator build used bundle ID `table.test.hipalz.com` and included Firebase Messaging, Capacitor Community FCM, and Capacitor Push Notifications.

## 10. APNs key creation

Completed in Apple Developer → Certificates, Identifiers & Profiles → Keys:

The key is named approximately:

```text
HiTable Firebase APNs
```

- Configured the key for the APNs sandbox/development environment.
- Restricted the key to the test app topic `table.test.hipalz.com`.
- Registered the APNs key.
- Recorded its Key ID outside the repository.
- Downloaded the one-time `.p8` private key.

Apple initially displayed:

```text
This service must have environment and type configured
```

This was not a failure. Apple's current key system requires the APNs environment and permission scope to be selected.

The selected configuration was:

```text
Environment: Sandbox
Key Type: Topic Specific
Topic/App: table.test.hipalz.com
```

Why:

- **Sandbox** matches the development-signed test app.
- **Topic Specific** limits the credential to the test app instead of every Paltribe app.
- Test and production credentials remain isolated.
- A separate Production key can later be created for `hiclient.hipalz.com`.

Security rules:

- Do not commit the `.p8` file.
- Do not attach it to chat.
- Do not email it without secure handling.
- Apple only allows it to be downloaded once, so store it in the organization's password manager or secure secret storage.
- Do not revoke another APNs key without confirming which apps use it.

## 11. Firebase APNs key upload

Completed in Firebase:

- Opened `hipal-demo` → **Project settings → Cloud Messaging**.
- Selected Apple app `table.test.hipalz.com`.
- Uploaded the `.p8` file through **APNs Authentication Key**.
- Supplied the recorded Key ID and Team ID `8W8H449W92`.
- Firebase accepted and saved the APNs authentication key.

Do not use either of these upload buttons for the `.p8` file:

- **Development APNs certificate**
- **Production APNs certificate**

Those certificate sections accept `.p12` files only. This project uses the newer token-based APNs authentication method, whose private key has the `.p8` extension.

Why:

- Firebase is the notification provider used by the existing server.
- Firebase uses the `.p8` key, Key ID, and Team ID to authenticate with APNs and deliver FCM messages to iPhones.
- The Apple key itself was created for the sandbox environment because the current Xcode-signed test app has `aps-environment = development`.
- Uploading this credential to Firebase affects the new Apple app configuration; it does not modify Android application code or Android tokens.

### Troubleshooting recorded

An upload was initially attempted through **Upload development APNs certificate**. Firebase correctly rejected the `.p8` file with:

```text
Unsupported file type. Uploader only supports P12
```

Resolution: close that dialog and use the **APNs Authentication Key → Upload** button instead. No conversion from `.p8` to `.p12` is needed.

## 11A. Ensure iOS runs the updated bundled web application

The shared Capacitor config normally loads:

```text
https://table.test.hipalz.com
```

That behavior remains the default for Android so its existing setup is not changed. The config detects the explicit Capacitor target argument: `copy ios` or `sync ios` omits `server.url` and bundles the local `dist`, while Android commands retain the remote test URL. No extra `.env` variable is required, and web builds do not consume this native configuration.

Use:

```bash
cd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react
bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

Why:

- The iOS target argument selects bundled assets so the native app uses the code just built into `dist`.
- Android target commands retain the existing remote test URL.

Completed after the Firebase APNs key was saved:

- Rebuilt the React test bundle successfully.
- Copied the bundle using the explicit `ios` Capacitor target.
- Verified the generated iOS Capacitor configuration does not contain `server.url`.
- Verified the generated iOS configuration still uses `table.test.hipalz.com`.
- Verified there is still no Android native diff.
- Rebuilt the complete Xcode workspace successfully with the plist, entitlement, Firebase SDK, and bundled notification code.

## 12. Current stopping point: run on a physical iPhone

The next checkpoint is installing the development build on a physical iPhone:

1. Connect an iPhone to the Mac with USB.
2. Unlock the iPhone and select **Trust This Computer** if prompted.
3. If requested, enable **Settings → Privacy & Security → Developer Mode** on the iPhone, restart it, and confirm Developer Mode.
4. In Xcode, keep `App.xcworkspace` open.
5. Change the run destination from **iPhone 17 Pro** simulator to the connected physical iPhone.
6. Return to **TARGETS → App → Signing & Capabilities** and allow automatic signing to register the device/create the development provisioning profile.
7. Click the Run button.
8. When the app requests notification permission, choose **Allow**.

Why:

- Registering the device resolves the current provisioning-profile warning.
- Developer Mode permits development-signed apps to run on the iPhone.
- A real device provides the APNs sandbox registration used by Firebase to create the iOS FCM token.
- Simulator testing remains useful for UI behavior but is not sufficient as the final proof of real APNs/FCM delivery.

### Physical-device registration status

Completed:

- Connected and registered a physical iPhone with Xcode.
- Xcode created an Xcode-managed provisioning profile.
- Xcode selected an Apple Development signing certificate.
- The previous “No profiles found” signing error is resolved.
- Push Notifications remains enabled for the target.

Current Xcode status:

```text
Copying shared cache symbols from iPhone
```

This is a normal, usually one-time debugger preparation step. Keep the iPhone connected and unlocked until it finishes. Xcode copies system symbol information so it can debug crashes and native code from that iPhone.

After it finishes:

1. Confirm the connected physical iPhone remains selected as the run destination.
2. Click the triangular Run button or press `Command-R`.
3. Keep the iPhone unlocked while Xcode builds, installs, and launches the app.
4. If iOS asks for Developer Mode, enable it under **Settings → Privacy & Security → Developer Mode**, restart, confirm, and run again.
5. On the iOS notification permission dialog, tap **Allow**.
6. Do not choose **Don't Allow**, because iOS will not show the initial permission dialog again automatically; it would then need to be enabled manually in Settings.

Why permission must be allowed:

- Permission controls whether iOS may display alerts, play sounds, and show badges.
- After permission is granted, the app registers with APNs and then retrieves its Firebase FCM registration token.

### macOS codesign Keychain prompt

On the first physical-device build, macOS displayed:

```text
codesign wants to access key “Apple Development: ...” in your keychain.
To allow this, enter the “login” keychain password.
```

Enter the Mac user account/login password, not the Apple Account password and not the iPhone passcode.

After entering the password, select **Always Allow** for the trusted Apple `codesign` tool. This allows Xcode to use the locally stored Apple Development private key for subsequent builds without prompting every time.

Why:

- Every app installed on an iPhone must be cryptographically signed.
- The signing private key is protected by the Mac's login Keychain.
- `codesign` needs permission to use that key to sign the development build.
- **Always Allow** applies to this trusted local signing operation; it does not reveal or upload the Mac password.

### First physical-device launch: white-screen diagnosis

The app installed and opened on the physical iPhone, but displayed a white screen. Xcode showed this startup exception:

```text
TypeError: undefined is not an object
(evaluating 'navigator.serviceWorker.addEventListener')
```

Cause:

- `usePushNotifications.ts` statically imported Firebase Web Messaging.
- Static imports execute during application startup, including inside the native iOS WebView.
- Firebase Web Messaging expects the browser Service Worker API.
- Capacitor's native iOS WebView does not expose `navigator.serviceWorker`, so startup crashed before React rendered.

Resolution:

- Removed the static `firebase/messaging` and web Firebase client imports from native startup.
- Changed them to dynamic imports inside the `platform === "web"` branch only.
- Native iOS continues using Capacitor Push Notifications plus the iOS FCM helper.
- Browser/PWA notification behavior remains available when running on the web.
- Android continues through its existing native branch and its native project remains unchanged.

After this fix, rebuild the test bundle, copy it into iOS, and press `Command-R` again:

```bash
bun run --cwd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react build:test

cd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react
bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

### First login attempt: origin/CORS diagnosis

After the white-screen fix, the app opened and requested notification permission successfully. Login then displayed “Failed to login. Please check your credentials.”

The message did not prove that the credentials were invalid because the client used the same catch block for every network, CORS, and authentication exception.

Findings:

- The bundled native app initially used origin `capacitor://localhost`.
- The test server CORS and CSRF allowlist already allows `https://localhost`, but not `capacitor://localhost`.
- The iOS test bundle is compiled with `VITE_API_URL=https://api.test.hipalz.com`.
- Starting the backend locally does not redirect this installed build to the local server.
- The “Network Information API not supported” WebView log is informational and is not the login failure.

Resolution:

- For bundled iOS builds, configure `server.iosScheme = "https"`.
- The resulting iOS app origin becomes `https://localhost`, matching the backend's existing CORS/CSRF allowlist.
- Keep the default remote-server configuration unchanged for existing Android behavior.
- Add console logging for the real login exception so future network errors are distinguishable from invalid credentials.

Why this approach was chosen instead of adding `capacitor://localhost` to the server:

- `https://localhost` is already deliberately trusted by the server.
- The secure scheme is a better match for browser security and cookie behavior.
- No server deployment is required merely to test the existing remote test API.
- No Android native file or Android request origin is changed.

## 13. Remaining work after the first physical-device run

The following work is not yet complete:

1. Connect a physical iPhone and let Xcode register it for development.
2. Resolve the provisioning-profile warning through automatic signing.
3. Build and install the app on the physical iPhone.
4. Accept the iOS notification permission prompt.
5. Confirm an iOS FCM token is generated and saved to the backend with `platform: ios`.
6. Add an Apple `apns` payload to backend Firebase messages for iOS sound/badge behavior without changing Android payload behavior.
7. Send a Firebase Console test notification to the exact iOS FCM token.
8. Test foreground, background, notification tap, denied permission, reinstall/token refresh, and sound behavior.
9. Test notifications sent by the real HiTable backend.
10. Review token storage for users who work across multiple businesses.
11. Rotate Firebase server service-account credentials currently tracked in the repository and move them to deployment secrets.
12. Commit the reviewed test-branch changes.
13. Repeat the verified setup for production using `hiclient.hipalz.com` and production-specific Apple/Firebase credentials.
14. Test through TestFlight before an App Store release.

## 14. Day-to-day iOS commands

After web/React changes:

```bash
bun run --cwd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react build:test
```

Then copy the latest web bundle into iOS:

```bash
cd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react
bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

After installing or changing an iOS Capacitor plugin:

```bash
cd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react
bun ../../node_modules/@capacitor/cli/bin/capacitor sync ios
```

Then open:

```bash
open /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react/ios/App/App.xcworkspace
```

Never place Apple `.p8` private keys or Firebase server service-account private keys inside the client application.

## 15. Applied login-origin fix and next retry

The test web bundle was rebuilt and copied into the iOS project with:

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer \
  bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

The generated iOS configuration was verified to contain:

```json
{
  "appId": "table.test.hipalz.com",
  "server": {
    "iosScheme": "https"
  }
}
```

It deliberately has no `server.url`, so the iPhone loads the bundled React application rather than depending on the website being available. API requests still use the test build value `https://api.test.hipalz.com`.

The Android directory was checked with `git diff -- clients/client-hitable-react/android` and had no changes.

Next physical-device retry:

1. In Xcode, press the Stop button if the old app process is running.
2. Keep the physical iPhone selected, unlocked, and connected.
3. Press `Command + R` to rebuild and reinstall the updated bundle.
4. Open the app and try the same login again.
5. If login still fails, inspect the Xcode console for `Login request failed:` and record the complete error immediately after it.

The message `Network Information API not supported` can be ignored. It only means iOS WebView does not implement the browser Network Information API; it is not an authentication or connectivity failure.

## 16. Inspect the iPhone app with Safari Web Inspector

Safari on the Mac can inspect the Capacitor `WKWebView` running inside the physical iPhone app.

1. On the iPhone, open **Settings → Apps → Safari → Advanced** and enable **Web Inspector**.
2. Keep the iPhone unlocked and connected to the Mac by cable.
3. On the Mac, open Safari.
4. Open **Safari → Settings → Advanced** and enable **Show features for web developers** or **Show Develop menu in menu bar**. The exact label depends on the Safari version.
5. Run the test app from Xcode and leave it open on the login screen.
6. In Safari 26, choose **Develop → Inspect Apps and Devices**. In the inspector window, select the connected iPhone, then select `hitable-test`, `localhost`, `https://localhost`, or the title of the app page. Older Safari versions may instead show **Develop → [iPhone name] → page name** directly.
7. In the inspector window, open **Network** and enable **Preserve Log**.
8. Clear the existing requests, attempt login once, and select the failed login request to inspect its URL, status, request payload, response, cookies, and headers.
9. Also inspect **Console** for the message beginning `Login request failed:`.

Interpret the Network result as follows:

- No login request appears: JavaScript failed before sending the request; inspect Console.
- Red request with no HTTP status: connection, TLS, DNS, CORS, or WebView policy problem.
- `401` or `403`: authentication, account access, cookie, CSRF, or authorization problem.
- `404`: the app is using the wrong API route.
- `422`: submitted fields or payload shape are invalid.
- `500` or later: backend failure; inspect the server logs.
- `200` but the app still reports failure: inspect the JSON response and client-side success handling.

Do not share passwords, access tokens, cookies, or full authorization headers when reporting the result. The useful information is the request URL, HTTP method, status code, response message, and the safe field names in the request payload.

### Safari shows “No inspectable contents”

The iPhone being visible in Safari confirms that device pairing is working. If the selected iPhone says **No inspectable contents**, reinstall a Debug build from Xcode. Capacitor enables inspectable content for development builds, and this project also applies a Swift `#if DEBUG` fallback after the bridge loads. Release builds and Android are unaffected.

If iOS 26 still does not honor that configuration, set `bridgedWebView.isInspectable = true` from `applicationDidBecomeActive` inside a Swift `#if DEBUG` block. This is a development-only fallback applied after the storyboard has loaded the Capacitor bridge. It is compiled out of Release builds and has no Android effect. After changing native Swift code, use **Product → Clean Build Folder**, delete the existing test app from the iPhone, and run it again from Xcode.

## 17. Login failure diagnostics

Safari device inspection remained unavailable even for a page opened directly in iPhone Safari, so login diagnosis continued from the source and backend contract instead.

Source inspection found an HTML `hidden` attribute on the main password input. It was removed so the source unambiguously exposes the field, but the user confirmed that the password was already visible and editable in the running mobile version. Therefore this was not accepted as the confirmed cause of that specific failure.

Resolution:

- Make the password field visible.
- Validate the 10-digit phone number and four-character password before sending.
- Read non-success JSON responses and display the backend message with its HTTP status.
- Display the actual JavaScript/network error when no HTTP response is received.
- Reset the loading state in `finally` for every result.

This changes shared React login diagnostics but does not modify the Android native directory or an already-installed Android APK. The form satisfies the existing backend contract on both platforms.

An external preflight check was made against `https://api.test.hipalz.com/users/test/stafflogin` using origin `https://localhost`. The deployed API returned HTTP `204` with `access-control-allow-origin: https://localhost`, credentials enabled, POST allowed, and all requested headers allowed. This rules out the deployed CORS preflight configuration for the intended iOS origin.

The rebuilt app now reports either:

- the backend response message plus its HTTP status, or
- `Login request failed:` plus the underlying JavaScript network exception.

Reinstall the copied bundle from Xcode and report that exact on-screen message. This avoids depending on Safari device inspection.

## 18. Confirmed CORS error and physical-iPhone local API testing

Safari Web Inspector eventually connected and showed the exact failure:

```text
Origin capacitor://localhost is not allowed by Access-Control-Allow-Origin
Fetch API cannot load https://api.test.hipalz.com/users/:id/stafflogin
TypeError: Load failed
```

`capacitor://localhost` is normal. Capacitor serves the bundled React files through a custom local URL scheme inside `WKWebView`; it does not mean that the app is making an API request to a Capacitor server. The attempted API URL was `https://api.test.hipalz.com`, not production `https://api.hipalz.com`.

The backend CORS/CSRF allowlist must include the exact native origin `capacitor://localhost`. This is safe and specific to installed Capacitor apps; Android's existing native project is unchanged.

For a physical iPhone, `http://localhost:4500` points to the iPhone itself, not the Mac. Both devices must use the same Wi-Fi network, and the test build must use the Mac's current LAN address. At this checkpoint it was:

```text
http://192.168.1.7:4500
```

The address can change when reconnecting to Wi-Fi. Check it using `ifconfig en0 | rg 'inet '` before rebuilding. The local backend must listen on port `4500`, macOS may ask permission for incoming connections, and iOS requires a local-network usage description. `NSAllowsLocalNetworking` was added rather than allowing arbitrary insecure traffic globally.

At this checkpoint the test bundle was rebuilt and copied into iOS with the LAN API URL. A `bun` process was already listening on port `4500`; attempting to start another server produced `EADDRINUSE`. Stop/restart the existing server once so it loads the updated CORS allowlist. If startup reports MongoDB SRV DNS errors, resolve the Mac's network/DNS access before testing login.

Before opening Xcode, verify from iPhone Safari that `http://192.168.1.7:4500/` returns the backend environment JSON. If it does not, confirm both devices use the same Wi-Fi and allow incoming network connections for Terminal/Bun in macOS firewall settings. Once reachable, reinstall with `Command + R`; the console `baseUrl` must show `http://192.168.1.7:4500`.

## 19. iOS hotel-alert custom notification sound

Hotel notifications appeared on iOS but were silent because their Firebase messages only contained Android sound configuration. APNs requires an explicit `aps.sound` entry, and a custom sound file must exist in the native app bundle.

The existing Android sound remains `order` on channel `custom_channel_id`. For iOS:

- The provided `order.caf` was verified as a 4.68-second Core Audio file using supported linear PCM audio.
- It was copied into `ios/App/App/order.caf` and added to the App target's **Copy Bundle Resources** phase.
- Shared Firebase notifications and direct hotel alert/room payloads now include `apns.payload.aps.sound = "order.caf"`.
- Capacitor already has foreground `presentationOptions` containing `sound`, so the APNs sound may play while the app is open as well as in the background.

Apple requires custom notification sounds to be bundled in the app, use a supported format such as CAF/WAV/AIFF, and be under 30 seconds. The React `public/order.mp3` alone cannot serve as an iOS system notification sound. After native-resource changes, reinstall the app from Xcode before testing.

### Sound diagnostics after a silent delivery

A YouTube playback test checks media volume, not iOS notification/ringer volume. Notification sounds also depend on Silent Mode, Focus, the app-specific Sounds switch, and the separate **Ringtone and Alerts** volume.

Debug logging was added at both ends:

- Xcode prints `[ios:notification-settings] authorization=… sound=… alert=…` when the app becomes active. For `UNNotificationSetting`, raw value `2` means enabled and `1` means disabled.
- Hotel push senders print `iosSound: order.caf` before submitting the message to Firebase.

If both logs confirm sound is enabled and `order.caf` is sent, test once with the app in the background and the screen locked. Foreground and background presentation are separate iOS paths. Also raise **Settings → Sounds & Haptics → Ringtone and Alerts**; raising only Control Center/media volume is insufficient.

A one-time Debug-only local notification named **HiTable sound test** was added to isolate the native asset from Firebase. It schedules five seconds after the first eligible app activation and uses `order.caf` directly. If this notification plays the custom sound, the iOS bundle and device policy are correct and investigation should stay on the running backend/APNs payload. If it is silent, inspect the Xcode settings log and the iPhone's notification/ringer settings. The diagnostic is compiled out of Release builds and should be removed after testing.

Before preparing the test-branch push, the one-time local sound diagnostic and notification-settings logging were removed. They were temporary investigation code and are not required for real APNs delivery. The Debug-only Safari WebView inspection fallback remains useful for test troubleshooting.

The sound mapping was cross-checked: Android intentionally sends `sound: "order"`, which resolves its existing `res/raw/order.mp3`; iOS separately sends `apns.payload.aps.sound: "order.caf"`. No APNs hotel payload requests `order.mp3`, and `order.caf` was confirmed inside both the simulator and physical-device Debug `.app` products.

### Runtime log finding

The local backend log contained only repeated `GET /hotel/alert/fetch_room_alerts` polling requests. It did not contain the alert-creation request, `[hotelAlert:push:send]`, `[push:fcm:send]`, or `iosSound: order.caf`. Therefore the local backend was not the process sending the visible notification. The alert-triggering client was using another backend, most likely deployed `api.test.hipalz.com`, while the iPhone merely observed the shared alert data through its local polling API.

The APNs sound changes must be deployed/restarted on the backend that actually creates the alert and sends FCM. Alternatively, the alert-triggering client must also be pointed at `http://192.168.1.7:4500` for an entirely local test. A successful test should show the creation POST followed by a push-send log containing `iosSound: order.caf` in the same server terminal.

Running `cap sync ios` again is not the missing sound fix. Sync is required after installing/changing Capacitor plugins; `order.caf` was added directly to the Xcode target and is already verified inside the built physical-device `.app`. A clean Xcode reinstall is sufficient for that native resource. Web rebuilding/copying is needed only for React bundle changes, while APNs payload changes must run on the backend process that actually sends Firebase notifications.

## 20. Preparing the test branch for remote end-to-end testing

The test client environment was restored from the temporary Mac LAN server to `https://api.test.hipalz.com`, and the local-network-only Info.plist allowances were removed. The APNs sound fix will take effect only after the updated server code is deployed/restarted on that test API—not merely after pushing the branch.

Git ignore rules were added for Apple `.p8`, `.p12`, `.mobileprovision`, and `.cer` files, local Xcode state, the downloaded iOS `GoogleService-Info.plist`, and future server service-account JSON files. The local iOS Firebase plist remains on this Mac for direct builds but should not be committed. It must be downloaded again from Firebase after a fresh clone.

Existing Android Firebase configuration was not changed. A server Firebase service-account JSON was already tracked before this work; `.gitignore` cannot remove historical copies. Move that credential to deployment secrets and rotate it as a separate security task before production.

## 21. iOS equivalents of an Android debug APK

iOS does not use APK files:

- A Debug `.app` is the closest artifact for installing from Xcode on a connected/registered iPhone.
- A signed `.ipa` can be exported for Development or Ad Hoc distribution to registered devices.
- TestFlight is preferred when distributing beta builds to multiple testers without manually sharing build files.

Before any iOS build containing new React code:

```bash
bun run --cwd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react build:test
cd /Users/hurshank/Desktop/hipal_monorepo/clients/client-hitable-react
bun ../../node_modules/@capacitor/cli/bin/capacitor copy ios
```

The explicit `ios` target makes Capacitor bundle `dist`; Android retains its existing remote server configuration. Open `ios/App/App.xcworkspace`, not the project file.

For the connected development iPhone, choose the iPhone as the run destination and press `Command + R`. Xcode signs, installs, and launches the Debug `.app` directly.

To export an `.ipa`:

1. Select the **App** scheme and **Any iOS Device (arm64)** or a generic physical iOS destination.
2. Choose **Product → Archive**.
3. In Organizer, select the archive and choose **Distribute App**.
4. Choose **Custom → Development** for development testing, or **Custom → Ad Hoc** for registered test devices.
5. Keep automatic signing unless the team deliberately manages profiles manually, then export the signed `.ipa`.

Development and Ad Hoc builds only run on devices included in the provisioning profile. For broader beta distribution, choose **TestFlight & App Store**, upload the archive, and assign it to TestFlight testers in App Store Connect.

## 22. Install and validate the exported test IPA

Deploy/restart the updated `test` backend before testing the exported app; otherwise the older server payload may still omit `aps.sound`.

1. Delete the older `hitable-test` installation from the registered iPhone so the new native bundle and notification registration are unambiguous.
2. Connect and unlock the iPhone.
3. In Xcode, open **Window → Devices and Simulators**, select the iPhone, click the add button under **Installed Apps**, and select the exported `.ipa`.
4. Launch the app, allow notifications, and log in against the test environment.
5. Turn off Silent Mode and Focus, enable the app's notification Sounds option, and raise **Settings → Sounds & Haptics → Ringtone and Alerts**.
6. Put the app in the background or lock the screen.
7. Trigger a hotel alert from the test environment.
8. Confirm the test-backend sender logs `iosSound: order.caf`, then confirm the iPhone displays the notification and plays the custom sound.

Installing an IPA exported with Development/Release Testing signing only works on iPhones registered in the provisioning profile.

## 23. Exported IPA receives no notifications: APNs environment mismatch

The exported `App.ipa` was inspected directly. It contains:

- Bundle ID `table.test.hipalz.com`.
- An Ad Hoc provisioning profile for the PALTRIBE team.
- `aps-environment = production`.
- The matching `GoogleService-Info.plist`.
- The bundled 4.68-second `order.caf`.

The earlier Xcode Debug build used sandbox APNs, while Ad Hoc/Release Testing uses production APNs. The Apple topic-specific key originally uploaded to Firebase was created for Sandbox. A key from the wrong environment cannot deliver to the production APNs token, which explains why the exported IPA received neither a banner nor sound.

Create a Production related APNs key for topic `table.test.hipalz.com`, securely record its new Key ID, download its one-time `.p8`, and upload it to the **production APNs authentication key** slot for this Firebase Apple app. Keep the existing Sandbox key for Debug testing. Do not use the development/production APNs certificate `.p12` sections.

After Firebase accepts the Production key, the existing IPA does not need rebuilding because its provisioning, entitlement, Firebase configuration, and sound resource are already correct. Reinstalling the IPA is recommended to refresh notification registration and save a fresh production FCM token.

## 24. Cable-free use, additional testers, and iOS branding

After installation, the app does not need to remain connected to the Mac. Notifications and sound work over the internet through the test API, Firebase, and APNs. The installed Ad Hoc/Development build remains limited by its signing and provisioning validity.

The first exported IPA contained only the originally registered iPhone. To test on another iPhone, either register that device's UDID and export a new Ad Hoc/Release Testing IPA whose profile includes it, or use TestFlight. TestFlight is preferred for multiple testers because their UDIDs do not need to be embedded in the IPA profile.

The iOS notification sound is intentionally independent from Android:

- Android requests `order` and resolves `android/app/src/main/res/raw/order.mp3`.
- iOS requests the exact filename `order.caf` and loads it from the native app bundle.

The iOS asset catalog originally contained Capacitor's default blue icon and splash. These were replaced using the existing HiPal hand artwork already used by the Android launcher:

- The iOS app icon is an opaque 1024×1024 PNG with the HiPal hand centered on white. iOS applies the device-specific corner mask.
- All iOS splash image variants are 2732×2732, white, with the same HiPal hand centered.
- Android resources were read as the design reference but were not modified.

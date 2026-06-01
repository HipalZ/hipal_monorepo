import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ApiResponse = {
  err?: boolean;
  message?: string;
  data?: unknown;
};

type LogEntry = {
  id: string;
  title: string;
  body: string;
};

type StaffLoginResponse = ApiResponse & {
  data?: {
    user?: {
      _id?: string;
      name?: string;
      customRole?: Array<{
        businessId?:
          | string
          | {
              _id?: string;
              name?: string;
            };
      }>;
    };
    accessToken?: string;
    refreshToken?: string;
  };
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const defaultApiUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  "https://api.test.hipalz.com";
const defaultBusinessId = "66a41b98f3d1d34df72a4bb0";

const getProjectId = () =>
  Constants.easConfig?.projectId ||
  (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)
    ?.projectId;

const postJson = async (apiUrl: string, path: string, body: object) => {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => ({}))) as ApiResponse;
  if (!response.ok || json.err) {
    throw new Error(json.message || `Request failed with ${response.status}`);
  }
  return json;
};

export default function App() {
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [businessId, setBusinessId] = useState(defaultBusinessId);
  const [phone, setPhone] = useState("2222222222");
  const [password, setPassword] = useState("6344");
  const [userId, setUserId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("MVP Room");
  const [serviceName, setServiceName] = useState("Housekeeping");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const platform = useMemo(() => {
    if (Platform.OS === "android" || Platform.OS === "ios") return Platform.OS;
    return "unknown";
  }, []);

  const addLog = (title?: string | null, body?: string | null) => {
    setLogs((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        title: title || "Notification",
        body: body || "",
      },
      ...current,
    ]);
  };

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        addLog(
          notification.request.content.title,
          notification.request.content.body,
        );
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        addLog(
          response.notification.request.content.title,
          response.notification.request.content.body,
        );
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const withBusy = async (label: string, action: () => Promise<void>) => {
    try {
      setBusy(true);
      setStatus(label);
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message);
      Alert.alert("Push MVP", message);
    } finally {
      setBusy(false);
    }
  };

  const registerForPushToken = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("service-alerts", {
          name: "Service alerts",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#0F766E",
        });
      }

      const currentPermissions = await Notifications.getPermissionsAsync();
      const finalPermissions = currentPermissions.granted
        ? currentPermissions
        : await Notifications.requestPermissionsAsync();

      if (!finalPermissions.granted) {
        throw new Error("Notification permission was not granted.");
      }

      const projectId = getProjectId();
      const pushToken = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();

      setToken(pushToken.data);
      return pushToken.data;
  };

  const loginStaff = async () => {
    if (!phone || !password) {
      throw new Error("Phone and password are required.");
    }

    const response = (await postJson(apiUrl, "/users/current/stafflogin", {
      phone,
      password,
    })) as StaffLoginResponse;

    const user = response.data?.user;
    if (!user?._id) {
      throw new Error("Login succeeded but staff user id was not returned.");
    }

    setUserId(user._id);
    setStaffName(user.name || "");
    setAccessToken(response.data?.accessToken || "");
    setRefreshToken(response.data?.refreshToken || "");
    return {
      userId: user._id,
      name: user.name || "",
      accessToken: response.data?.accessToken || "",
      refreshToken: response.data?.refreshToken || "",
    };
  };

  const saveTokenForStaff = async (
    pushToken: string,
    staffUserId: string,
    tokens?: { accessToken?: string; refreshToken?: string },
  ) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const authAccessToken = tokens?.accessToken || accessToken;
    const authRefreshToken = tokens?.refreshToken || refreshToken;
    if (authAccessToken) headers.Authorization = `Bearer ${authAccessToken}`;
    if (authRefreshToken) headers["x-refresh-token"] = authRefreshToken;

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/users/save/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        registrationToken: pushToken,
        businessId,
        userId: staffUserId,
        provider: "expo",
        platform,
        app: "staff-expo-mvp",
      }),
    });
    const json = (await response.json().catch(() => ({}))) as ApiResponse;
    if (!response.ok || json.err) {
      throw new Error(json.message || `Token save failed with ${response.status}`);
    }
    return json;
  };

  const enterStaffApp = async () => {
    await withBusy("Logging in and saving push token...", async () => {
      if (!businessId) {
        throw new Error("businessId is required.");
      }

      const staff = await loginStaff();
      const pushToken = token || (await registerForPushToken());
      await saveTokenForStaff(pushToken, staff.userId, staff);

      setStatus(
        `Entered as ${staff.name || staff.userId}. Push token saved for hotel business.`,
      );
    });
  };

  const sendServiceRequestTest = async () => {
    await withBusy("Sending service request test...", async () => {
      if (!businessId) throw new Error("businessId is required.");
      const response = await postJson(apiUrl, "/notifications/service-request-test", {
        businessId,
        userId: userId || undefined,
        roomId: roomId || undefined,
        roomName,
        serviceName,
      });
      setStatus(response.message || "Service request test requested.");
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HiPal Push MVP</Text>
        <Text style={styles.subtitle}>
          Login as staff, allow notifications, and save this device token for
          service-request alerts.
        </Text>

        <View style={styles.section}>
          <Field label="API URL" value={apiUrl} onChangeText={setApiUrl} />
          <Field
            label="Business ID"
            value={businessId}
            onChangeText={setBusinessId}
            placeholder="required"
          />
          <Field
            label="Staff Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="2222222222"
          />
          <Field
            label="Staff Password"
            value={password}
            onChangeText={setPassword}
            placeholder="6344"
            secureTextEntry
          />
          <Field
            label="Staff User ID"
            value={userId}
            onChangeText={setUserId}
            placeholder="auto-filled after login"
          />
          <Field
            label="Room ID"
            value={roomId}
            onChangeText={setRoomId}
            placeholder="optional"
          />
          <Field label="Room Name" value={roomName} onChangeText={setRoomName} />
          <Field
            label="Service Name"
            value={serviceName}
            onChangeText={setServiceName}
          />
        </View>

        <View style={styles.actions}>
          <ActionButton
            label="Login & Enable Notifications"
            onPress={enterStaffApp}
            disabled={busy}
          />
          <ActionButton
            label="Service Request Test"
            onPress={sendServiceRequestTest}
            disabled={busy || !userId}
          />
          <Text style={styles.actionHint}>
            Login first. After the token is saved, service requests assigned to
            this staff user should notify this mobile app.
          </Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusRow}>
            {busy ? <ActivityIndicator color="#0F766E" /> : null}
            <Text style={styles.statusText}>{status}</Text>
          </View>
          {staffName ? (
            <Text style={styles.staffText}>Logged in staff: {staffName}</Text>
          ) : null}
        </View>

        <View style={styles.tokenBox}>
          <Text style={styles.statusLabel}>Expo Push Token</Text>
          <Text selectable style={styles.token}>
            {token || "No token yet"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.statusLabel}>Received Notifications</Text>
          {logs.length === 0 ? (
            <Text style={styles.empty}>No notifications received in-app yet.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logTitle}>{log.title}</Text>
                <Text style={styles.logBody}>{log.body}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  title: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    paddingHorizontal: 12,
    fontSize: 15,
  },
  actions: {
    gap: 10,
  },
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F766E",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  actionHint: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },
  statusBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    backgroundColor: "#F0FDFA",
    padding: 14,
    gap: 8,
  },
  statusLabel: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusText: {
    flex: 1,
    color: "#0F766E",
    fontSize: 14,
    lineHeight: 20,
  },
  staffText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  tokenBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 8,
  },
  token: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
  },
  empty: {
    color: "#64748B",
    fontSize: 14,
  },
  logItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 4,
  },
  logTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },
  logBody: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
  },
});

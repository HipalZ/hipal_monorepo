package table.test.hipalz.com;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.annotation.RequiresApi;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlertReadinessPlugin.class);
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }

        // Request battery optimization exemption so FCM works in background
        requestBatteryOptimizationExemption();
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createNotificationChannel() {
        createAlertChannel(
                "custom_channel_id",
                "Service Alerts",
                "Alert notifications for room service requests"
        );
        createAlertChannel(
                "wake_up_call_channel_v1",
                "Wake-up Call Alerts",
                "Urgent wake-up call reminders for front office"
        );
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createAlertChannel(String channelId, CharSequence name, String description) {
        // IMPORTANCE_HIGH ensures heads-up popup + sound on all devices
        int importance = NotificationManager.IMPORTANCE_HIGH;

        NotificationChannel channel = new NotificationChannel(channelId, name, importance);
        channel.setDescription(description);
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[]{0, 300, 200, 300});
        channel.setBypassDnd(true);

        // Explicit AudioAttributes so OEM skins don't downgrade to silent
        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/order");
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();
        channel.setSound(soundUri, audioAttributes);

        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager != null) {
            notificationManager.createNotificationChannel(channel);
        }
    }

    /**
     * Requests the OS to exempt this app from battery optimization.
     * This shows a system dialog asking the user to allow unrestricted background activity.
     * Critical for FCM push notifications to arrive when the app is in background/killed.
     */
    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        }
    }
}

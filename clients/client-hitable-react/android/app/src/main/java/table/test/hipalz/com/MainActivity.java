package table.test.hipalz.com;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.RequiresApi;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Create the notification channel if Android version is Oreo or higher
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createNotificationChannel() {
        // Define the channel ID, name, and description
        String channelId = "custom_channel_id";
        CharSequence name = "Custom Notifications";
        String description = "Notifications with custom sound";
        int importance = NotificationManager.IMPORTANCE_DEFAULT;

        // Create the notification channel
        NotificationChannel channel = new NotificationChannel(channelId, name, importance);
        channel.setDescription(description);

        // Set the custom sound URI for the notification channel
        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/raw/order");
        channel.setSound(soundUri, null);  // Set your custom sound here

        // Register the channel with the system
        NotificationManager notificationManager = getSystemService(NotificationManager.class);
        if (notificationManager != null) {
            notificationManager.createNotificationChannel(channel);
        }
    }
}

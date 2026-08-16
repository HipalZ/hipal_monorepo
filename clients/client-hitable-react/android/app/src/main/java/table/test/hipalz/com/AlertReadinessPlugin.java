package table.test.hipalz.com;

import static androidx.core.content.UnusedAppRestrictionsConstants.API_30;
import static androidx.core.content.UnusedAppRestrictionsConstants.API_30_BACKPORT;
import static androidx.core.content.UnusedAppRestrictionsConstants.API_31;
import static androidx.core.content.UnusedAppRestrictionsConstants.DISABLED;
import static androidx.core.content.UnusedAppRestrictionsConstants.ERROR;
import static androidx.core.content.UnusedAppRestrictionsConstants.FEATURE_NOT_AVAILABLE;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.IntentCompat;
import androidx.core.content.PackageManagerCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.common.util.concurrent.ListenableFuture;

@CapacitorPlugin(name = "AlertReadiness")
public class AlertReadinessPlugin extends Plugin {

    @PluginMethod
    public void check(PluginCall call) {
        ListenableFuture<Integer> future = PackageManagerCompat.getUnusedAppRestrictionsStatus(getContext());

        future.addListener(() -> {
            int unusedRestrictionsStatus = ERROR;
            try {
                unusedRestrictionsStatus = future.get();
            } catch (Exception ignored) {
            }

            JSObject result = buildStatus(unusedRestrictionsStatus);
            call.resolve(result);
        }, ContextCompat.getMainExecutor(getContext()));
    }

    @PluginMethod
    public void openUnusedAppRestrictionsSettings(PluginCall call) {
        try {
            Intent intent = IntentCompat.createManageUnusedAppRestrictionsIntent(
                    getContext(),
                    getActivity().getPackageName()
            );
            startActivityForResult(call, intent, "settingsResult");
        } catch (UnsupportedOperationException | ActivityNotFoundException error) {
            openApplicationDetails(call);
        }
    }

    @PluginMethod
    public void openBatteryOptimizationSettings(PluginCall call) {
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager powerManager = (PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
                if (powerManager != null && !powerManager.isIgnoringBatteryOptimizations(getActivity().getPackageName())) {
                    intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getActivity().getPackageName()));
                } else {
                    intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                }
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getActivity().getPackageName()));
            }
            startActivityForResult(call, intent, "settingsResult");
        } catch (ActivityNotFoundException error) {
            openApplicationDetails(call);
        }
    }

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, getActivity().getPackageName());
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getActivity().getPackageName()));
            }
            startActivityForResult(call, intent, "settingsResult");
        } catch (ActivityNotFoundException error) {
            openApplicationDetails(call);
        }
    }

    private JSObject buildStatus(int unusedRestrictionsStatus) {
        JSObject result = new JSObject();
        result.put("notificationEnabled", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        result.put("batteryOptimized", isBatteryOptimized());
        result.put("unusedAppRestrictionsStatus", mapUnusedRestrictionsStatus(unusedRestrictionsStatus));
        result.put("unusedAppRestrictionsEnabled", isUnusedRestrictionEnabled(unusedRestrictionsStatus));
        return result;
    }

    private boolean isBatteryOptimized() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return false;
        }

        PowerManager powerManager = (PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
        return powerManager != null && !powerManager.isIgnoringBatteryOptimizations(getActivity().getPackageName());
    }

    private boolean isUnusedRestrictionEnabled(int status) {
        return status == API_30_BACKPORT || status == API_30 || status == API_31;
    }

    private String mapUnusedRestrictionsStatus(int status) {
        if (status == FEATURE_NOT_AVAILABLE) return "unavailable";
        if (status == DISABLED) return "disabled";
        if (status == API_30_BACKPORT) return "enabled_api_30_backport";
        if (status == API_30) return "enabled_api_30";
        if (status == API_31) return "enabled_api_31";
        return "unknown";
    }

    private void openApplicationDetails(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + getActivity().getPackageName()));
        startActivityForResult(call, intent, "settingsResult");
    }

    @ActivityCallback
    private void settingsResult(PluginCall call, ActivityResult result) {
        JSObject response = new JSObject();
        response.put("opened", true);
        call.resolve(response);
    }
}

import Header from "@/components/molecules/header";
import { memo, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    fbq: any;
    FB: any;
    fbAsyncInit: any;
  }
}

const MemoizedProfile = () => {
  const [facebookSDKLoaded, setFacebookSDKLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeFacebookSDK = () => {
      // Avoid re-initializing if already loaded
      if (window.FB) {
        setFacebookSDKLoaded(true);
        return;
      }

      ((f, b, e, v, n, t, s) => {
        if (f.fbq) return;
        n = f.fbq = (...args) => {
          n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        "script",
        "https://connect.facebook.net/en_US/fbevents.js",
      );

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: "1166415764661953",
          cookie: true,
          xfbml: true,
          version: "v19.0",
        });
        setFacebookSDKLoaded(true);
      };

      ((d, s, id) => {
        let js: HTMLScriptElement;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    };

    initializeFacebookSDK();
  }, []);

  const launchWhatsAppSignup = () => {
    if (facebookSDKLoaded && typeof window.FB !== "undefined") {
      window.fbq("trackCustom", "WhatsAppOnboardingStart", {
        appId: "1166415764661953",
        feature: "whatsapp_embedded_signup",
      });
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            const code = response.authResponse.code;
            console.log(code, "code");
            console.log(response, "response");
          } else {
            console.log("User cancelled login or did not fully authorize.");
          }
        },
        {
          config_id: "1187408585794361",
          response_type: "code",
          override_default_response_type: true,
          extras: {
            sessionInfoVersion: 2,
          },
        },
      );
    } else {
      // No need to set timeout here, just ensure SDK is loaded
      setFacebookSDKLoaded(false);
    }
  };

  const handleBack = () => {
    navigate("/app/business/");
  };

  return (
    <center>
      <Header
        leftIcon={<FaArrowLeft />}
        isIconBusinessShow={false}
        onBack={handleBack}
      />
      <button
        type="button"
        onClick={launchWhatsAppSignup}
        id="connect-with-facebook"
        data-type="add"
        className="w-48 text-white bg-blue-500 rounded-3xl on_active_bounce"
      >
        Login with Facebook
      </button>
    </center>
  );
};

const Profile = memo(MemoizedProfile);
export default Profile;

import { memo, useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaFacebookSquare } from "react-icons/fa";
import { CONFIG_ID, APP_ID } from "@/configs";
import { useNavigate } from "react-router-dom";
import MemoizedHeader from "@/components/molecules/header";
import axios from "axios";

declare global {
  interface Window {
    fbq: any;
    FB: any;
    fbAsyncInit: any;
  }
}

const MemoizedProfile = () => {
  const [facebookSDKLoaded, setFacebookSDKLoaded] = useState(false);
  const [loginStep, setLoginStep] = useState<"initial" | "review" | "success">(
    "initial",
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeFacebookSDK = () => {
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
          appId: APP_ID,
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

  const launchWhatsAppSignup = async () => {
    if (facebookSDKLoaded && typeof window.FB !== "undefined") {
      setLoading(true);
      setErrorMessage(null);

      window.fbq("trackCustom", "WhatsAppOnboardingStart", {
        appId: APP_ID,
        feature: "whatsapp_embedded_signup",
      });

      window.FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const { accessToken } = response.authResponse;

            try {
              await axios.post("/api/login", { accessToken });
              setLoginStep("review");
            } catch (error) {
              setErrorMessage("Failed to authenticate with the backend.");
            }
          } else {
            setErrorMessage("User cancelled login or did not fully authorize.");
          }
          setLoading(false);
        },
        {
          config_id: CONFIG_ID,
          response_type: "code",
          override_default_response_type: true,
          scope: "business_management,whatsapp_business_management",
          return_scopes: true,
          extras: {
            sessionInfoVersion: 2,
          },
        },
      );
    } else {
      setErrorMessage("Facebook SDK not loaded.");
    }
  };

  const handleBack = useCallback(() => {
    navigate("/app/business/");
  }, [navigate]);

  return (
    <main>
      <nav className="sticky top-0 flex items-center gap-4 mb-4">
        <div className="z-50 w-full rounded-lg whatzapp_gradient_background">
          <MemoizedHeader
            title="WhatzApp"
            leftIcon={<FaArrowLeft />}
            onBack={handleBack}
            headingColor="white"
          />
        </div>
      </nav>

      <center>
        <section className="bg-white rounded-lg shadow-md p-8 w-[350px] mt-8">
          {loading && <p>Loading...</p>}
          <h1 className="mb-2 text-2xl font-bold">Connect with Facebook</h1>
          <p className="mb-6 text-gray-600">
            Login and connect with your Facebook account to get started
          </p>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <div className="space-y-4">
            {loginStep === "initial" && (
              <button
                type="button"
                onClick={launchWhatsAppSignup}
                className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <FaFacebookSquare className="mr-2" />
                Login with Facebook
              </button>
            )}
            {loginStep === "review" && (
              <p>Reviewing your account information...</p>
            )}
            {loginStep === "success" && (
              <p>You're successfully connected to WhatsApp!</p>
            )}
          </div>
        </section>
      </center>
    </main>
  );
};

const Profile = memo(MemoizedProfile);
export default Profile;

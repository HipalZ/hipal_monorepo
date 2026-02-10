import MiddlePopUp from "@/components/atom/middlePopUp";
import MemoizedHeader from "@/components/molecules/header";
import { useExchangeToken } from "@/hooks/useWhatsappFlows";
import { memo, useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaFacebookSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MemoizedProfile = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { exchangeToken } = useExchangeToken();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1166415764661953",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v22.0",
      });
    };

    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");

    // Listen for messages from Facebook's embedded signup
    const handleMessage = (event) => {
      console.log("Received message from Facebook: ", event.data);
      console.log('event', typeof event)
      // Validate origin
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      // Check if data is JSON or query string
      let parsedData = null;
      try {
        parsedData = JSON.parse(event.data);
      } catch (error) {
        console.warn("Message was not JSON, skipping:", event.data);
        return;
      }

      // If parsed successfully, continue
      if (parsedData?.type === "WA_EMBEDDED_SIGNUP") {
        if (parsedData.event === "FINISH") {
          const { phone_number_id, waba_id } = parsedData.data;
          saveToDatabase({ phone_number_id, waba_id });
          setIsSubmitted(true);
        } else if (parsedData.event === "CANCEL") {
          console.warn("User canceled at step: ", parsedData.data.current_step);
        } else if (parsedData.event === "ERROR") {
          console.error("Error: ", parsedData.data.error_message);
        }
        setSessionInfo(parsedData);
      }
    };


    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      exchangeToken(code)
        .then((res) => {
          console.log("Access token:", res.access_token);
          setIsSubmitted(true); // Move inside the .then block
          setSdkResponse(response); // Move inside the .then block
        })
        .catch((err) => console.error("Token exchange error:", err.message));
    }
  };

  const launchWhatsAppSignup = () => {
    window.FB.login(fbLoginCallback, {
      config_id: "1187408585794361", // Your configuration ID
      response_type: "code", // Required for system user access token
      override_default_response_type: true,
      extras: {
        sessionInfoVersion: "3",
        setup: {
          skip_payment_step: true,
        },
        featureType: "",
      },
    });
  };

  const saveToDatabase = async (data) => {
    try {
      const response = await fetch("/api/save-whatsapp-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log("Data saved to database:", result);
    } catch (error) {
      console.error("Error saving to database:", error);
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
          <h1 className="mb-2 text-2xl font-bold">Connect with Facebook</h1>
          <p className="mb-6 text-gray-600">
            Login and connect with your Facebook account to get started
          </p>
          <div className="space-y-4">
            <button
              type="button"
              onClick={launchWhatsAppSignup}
              className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <FaFacebookSquare className="mr-2" />
              Login with Facebook
            </button>

          </div>
        </section>
        {isSubmitted && <MiddlePopUp show={isSubmitted} onClose={() => setIsSubmitted(false)}>
          <section className="text-green-800 rounded-md m-6 h-[100px] flex items-center text-center">
            ✅ Your business has been submitted for verification. We’ll notify you once it's activated.
          </section>
        </MiddlePopUp>}
      </center>
    </main>
  );
};

const Profile = memo(MemoizedProfile);
export default Profile;

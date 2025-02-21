import MemoizedHeader from "@/components/molecules/header";
import { memo, useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaFacebookSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MemoizedProfile = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sdkResponse, setSdkResponse] = useState(null);
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
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id } = data.data;
            console.log(
              "Phone number ID: ",
              phone_number_id,
              " WhatsApp business account ID: ",
              waba_id
            );
            saveToDatabase({ phone_number_id, waba_id });
          } else if (data.event === "CANCEL") {
            console.warn("User canceled at step: ", data.data.current_step);
          } else if (data.event === "ERROR") {
            console.error("Error: ", data.data.error_message);
          }
        }
        setSessionInfo(data);
      } catch (error) {
        console.log("Non JSON response received: ", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fbLoginCallback = (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log("Facebook Auth Code: ", code);

      // Send code to the backend to exchange for an access token
      fetch("/api/save-fb-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Token saved:", data))
        .catch((error) => console.error("Error saving token:", error));
    }
    setSdkResponse(response);
  };

  const launchWhatsAppSignup = () => {
    window.FB.login(fbLoginCallback, {
      config_id: "1187408585794361", // Your configuration ID
      response_type: "code", // Required for system user access token
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "",
        sessionInfoVersion: "2",
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
        <p>Session info response:</p>
        <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>

        <p>SDK response:</p>
        <pre>{JSON.stringify(sdkResponse, null, 2)}</pre>
      </center>
    </main>
  );
};

const Profile = memo(MemoizedProfile);
export default Profile;

import { User, UserReward } from "@hi/db-models";

const bodySequence = async (
  businessName: string,
  address: string,
  bodyvariblesequence: string[],
  customer: {
    name: string;
    phone: string;
    email?: string;
  },
  businessId: string,
) => {
  const ans = [];

  for (const variable of bodyvariblesequence) {
    let value: string | undefined;

    if (variable === "name") {
      value = customer?.name?.toString();
    } else if (variable === "phone") {
      value = customer?.phone?.toString();
    } else if (variable === "businessName") {
      value = businessName?.toString();
    } else if (variable === "address") {
      value = address?.toString();
    } else if (variable === "time") {
      value = new Date().toLocaleString();
    } else if (variable === "date") {
      value = new Date().toLocaleDateString("en-GB");
    } else if (variable === "email") {
      value = customer?.email?.toString();
    } else if (variable === "coins") {
      const user = await User.findOne({ phone: customer.phone });
      const userReward = await UserReward.findOne({
        userId: user?._id,
        loyaltyId: businessId,
      });
      value = userReward?.rewards?.toString();
    }

    if (value !== undefined) {
      ans.push({
        type: "text",
        text: value,
      });
    }
  }

  return ans;
};

export const returnBodyComponents = async (
  businessName: string,
  address: string,
  bodyVariableSequence: string[],
  mediaUrl: string,
  customer: {
    name: string;
    phone: string;
  },
  businessId: string,
) => {
  // Resolve body parameters
  const parameters = await bodySequence(
    businessName,
    address,
    bodyVariableSequence,
    customer,
    businessId,
  );

  const components = [];

  if (mediaUrl) {
    const url = mediaUrl.toLowerCase();

    let headerParam: any = null;

    // 🎥 VIDEO (mp4)
    if (url.includes("mp4")) {
      headerParam = {
        type: "video",
        video: { link: mediaUrl },
      };
    }
    // 🎧 AUDIO (mp3)
    else if (url.includes("mp3")) {
      headerParam = {
        type: "audio",
        audio: { link: mediaUrl },
      };
    }
    // 📄 DOCUMENT (pdf/doc/xls)
    else if (
      url.includes("pdf") ||
      url.includes("doc") ||
      url.includes("docx") ||
      url.includes("xls") ||
      url.includes("xlsx")
    ) {
      headerParam = {
        type: "document",
        document: { link: mediaUrl },
      };
    } else if (
      url.includes("jpg") ||
      url.includes("jpeg") ||
      url.includes("png") ||
      url.includes("gif") ||
      url.includes("webp")
    ) {
      headerParam = {
        type: "image",
        image: { link: mediaUrl },
      };
    }

    if (headerParam) {
      components.push({
        type: "HEADER",
        parameters: [headerParam],
      });
    }
  }

  // BODY parameters
  components.push({
    type: "BODY",
    parameters,
  });

  return components;
};

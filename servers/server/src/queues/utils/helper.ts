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
  imageUrl: string,
  customer: {
    name: string;
    phone: string;
  },
  businessId: string,
) => {
  // return components for the body
  const parameters = await bodySequence(
    businessName,
    address,
    bodyVariableSequence,
    customer,
    businessId,
  );

  const components = [];

  if (imageUrl) {
    components.push({
      type: "HEADER",
      parameters: [
        {
          type: "image",
          image: {
            link: imageUrl,
          },
        },
      ],
    });
  }

  components.push({
    type: "BODY",
    parameters: parameters,
  });

  return components;
};

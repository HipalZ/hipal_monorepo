const whatAppToken =
  "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";

export const whatsAppConfig = {
  token: whatAppToken,
  headers: {
    Authorization: `Bearer ${whatAppToken}`,
  },
  phoneId: "365941956611521",
  whatAppAccountId: "378623998675618",
  version: "v21.0",
};

// no more than 20 templates

export const festival = {
  name: "festivals_template",
  parameter_format: "POSITIONAL",
  components: [
    {
      type: "HEADER", // OPTIONAL 512 characters max
      format: "IMAGE", // TEXT | IMAGE | VIDEO | DOCUMENT | LOCATION
      example: {
        header_handle: [
          "https://scontent.whatsapp.net/v/t61.29466-34/434034098_592109933248371_8041677346495841774_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=zCE_npp6WngQ7kNvgEmghX_&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AIJs65cEAAAA&_nc_gid=AU5i0kIKqD8nMjq7yorjJEk&oh=01_Q5AaIA_OkXmKZ2QnhkQWD1kjlblGi9JfGE6WK29h16O8V5lk&oe=6749A1A4",
        ],
      }, // image content
    },
    {
      type: "BODY", // REQUIRED 1024 characters max
      text: "Greetings, {{1}}! As the festive season arrives, we bring you exciting offers. Grab your favorite coffee at {{2}} and receive instant rewards!",
      example: {
        body_text: [["Rishabh", "The Coffee Cup"]], // if variables are present this is mandatory
      },
    },
    {
      type: "FOOTER", // OPTIONAL
      text: "From Hipalz", // 60 characters max
    },
    {
      type: "BUTTONS", // OPTIONAL
      buttons: [
        {
          type: "URL", // URL | PHONE_NUMBER
          text: "Visit us", // 25 characters max
          url: "https://www.hipalz.com/coffeecup", // 2000 characters max
        },
      ],
    },
  ],
  language: "en_GB", // en_US
  status: "APPROVED", // APPROVED | REJECTED
  category: "MARKETING", // UTILITY | SERVICE | MARKETING
  sub_category: "CUSTOM", // use by default
  id: "592109929915038",
};

// Marketing Template
export const marketingTemplate = {
  name: "special_offer_template",
  parameter_format: "POSITIONAL",
  components: [
    {
      type: "HEADER", // OPTIONAL 512 characters max
      format: "IMAGE", // TEXT | IMAGE | VIDEO | DOCUMENT | LOCATION
      example: {
        header_handle: ["https://example.com/special_offer_image.jpg"],
      }, // image content
    },
    {
      type: "BODY", // REQUIRED 1024 characters max
      text: "Hello {{1}}! Don't miss our exclusive {{2}} sale. Get up to {{3}}% off on selected items. Limited time offer!",
      example: {
        body_text: [["John", "Summer", "50"]], // if variables are present this is mandatory
      },
    },
    {
      type: "FOOTER", // OPTIONAL
      text: "Terms and conditions apply", // 60 characters max
    },
    {
      type: "BUTTONS", // OPTIONAL
      buttons: [
        {
          type: "URL", // URL | PHONE_NUMBER
          text: "Shop Now", // 25 characters max
          url: "https://www.example.com/sale", // 2000 characters max
        },
        {
          type: "PHONE_NUMBER",
          text: "Call Us", // 25 characters max
          phone_number: "+1234567890",
        },
      ],
    },
  ],
  language: "en_US", // en_US
  status: "APPROVED", // APPROVED | REJECTED
  category: "MARKETING", // UTILITY | SERVICE | MARKETING
  sub_category: "CUSTOM", // use by default
  id: "123456789012345",
};

// Utility Template
export const utilityTemplate = {
  name: "appointment_reminder_template",
  parameter_format: "POSITIONAL",
  components: [
    {
      type: "HEADER", // OPTIONAL 512 characters max
      format: "TEXT", // TEXT | IMAGE | VIDEO | DOCUMENT | LOCATION
      text: "Appointment Reminder",
    },
    {
      type: "BODY", // REQUIRED 1024 characters max
      text: "Dear {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Please arrive 10 minutes early. If you need to reschedule, please contact us.",
      example: {
        body_text: [["Ms. Smith", "May 15, 2024", "2:30 PM"]], // if variables are present this is mandatory
      },
    },
    {
      type: "FOOTER", // OPTIONAL
      text: "Thank you for choosing our service", // 60 characters max
    },
    {
      type: "BUTTONS", // OPTIONAL
      buttons: [
        {
          type: "URL", // URL | PHONE_NUMBER
          text: "View Details", // 25 characters max
          url: "https://www.example.com/appointments", // 2000 characters max
        },
        {
          type: "PHONE_NUMBER",
          text: "Call Us", // 25 characters max
          phone_number: "+1987654321",
        },
      ],
    },
  ],
  language: "en_US", // en_US
  status: "APPROVED", // APPROVED | REJECTED
  category: "UTILITY", // UTILITY | SERVICE | MARKETING
  sub_category: "CUSTOM", // use by default
  id: "987654321098765",
};

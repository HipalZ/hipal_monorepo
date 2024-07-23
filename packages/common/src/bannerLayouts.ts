import { ArrowPattern, BowPattern, DotsPattern } from "@hi/common";

export enum BannerType {
  BANNER_TYPE_0 = "BANNER_TYPE_0",
  BANNER_TYPE_1 = "BANNER_TYPE_1",
  BANNER_TYPE_2 = "BANNER_TYPE_2",
  BANNER_TYPE_3 = "BANNER_TYPE_3",
  BANNER_TYPE_4 = "BANNER_TYPE_4",
  BANNER_TYPE_5 = "BANNER_TYPE_5",
  BANNER_TYPE_6 = "BANNER_TYPE_6",
  BANNER_TYPE_7 = "BANNER_TYPE_7",
  BANNER_TYPE_8 = "BANNER_TYPE_8",
  BANNER_TYPE_9 = "BANNER_TYPE_9",
  BANNER_TYPE_10 = "BANNER_TYPE_10",
  BANNER_TYPE_11 = "BANNER_TYPE_11",
  BANNER_TYPE_12 = "BANNER_TYPE_12",
  BANNER_TYPE_13 = "BANNER_TYPE_13",
}
export const bannerLayouts = [
  {
    _id: BannerType.BANNER_TYPE_1,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Fit With Link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_2,
    heading: "Pasta with Bun, No actions are long",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Fit No Link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts2 = [
  {
    _id: BannerType.BANNER_TYPE_3,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Hanging card with link",
    image: "",
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_4,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Hanging card no link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts3 = [
  {
    _id: BannerType.BANNER_TYPE_5,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand with link",
    image: "",
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_6,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    title: "Expand no link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts4 = [
  {
    _id: BannerType.BANNER_TYPE_7,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand center banner",
    image: "",
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_8,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "Explore",
    title: "Expand center no link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts5 = [
  {
    _id: BannerType.BANNER_TYPE_9,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand top banner",
    image: "",
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_10,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Expand top no link",
    image: "",
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts6 = [
  {
    _id: BannerType.BANNER_TYPE_11,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Cool text link",
    isPattern: true,
    pattern: ArrowPattern,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_12,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Cool text no link",
    isPattern: true,
    pattern: BowPattern,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_13,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Cool text no link",
    isPattern: true,
    pattern: DotsPattern,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const truncateDescription = (textContent: string) => {
  return textContent.length > 70
    ? `${textContent.substring(0, 70)}...`
    : textContent;
};

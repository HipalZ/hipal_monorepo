import type { ContentType } from "@/components/flow-builder/types";

const isFormField = (type: ContentType) =>
  [
    "short-answer",
    "paragraph",
    "datepicker",
    "single-choice",
    "multiple-choice",
    "dropdown",
    "opt-in",
  ].includes(type);

const formatName = (label = "", id: string) => {
  return `${label.replace(/[^a-zA-Z0-9]/g, "_")}_${id.slice(-6)}`;
};

export const generateJsonPayload = (screens: Screen[]) => {
  const mappedScreens = screens.map((screen) => {
    const formFields = screen.content.filter((c) => isFormField(c.type));
    const completionPayload = formFields.reduce(
      (acc, item, index) => {
        const name = formatName(item.data.label, item.id);
        const key = `screen_0_${name}_${index}`;
        acc[key] = `\${form.${name}}`;
        return acc;
      },
      {} as Record<string, string>,
    );

    const children = [
      ...screen.content.map((item) => {
        const name = formatName(item.data.label, item.id);
        switch (item.type) {
          case "large-heading":
            return { type: "TextHeading", text: item.data.text };
          case "small-heading":
            return { type: "TextSubheading", text: item.data.text };
          case "body-text":
            return { type: "TextBody", text: item.data.text };
          case "caption":
            return { type: "TextCaption", text: item.data.text };
          case "image":
            return {
              type: "Image",
              src: item.data.src?.split(",")[1] || "",
              height: item.data.height,
              "scale-type": "contain",
            };
          case "paragraph":
            return {
              type: "TextArea",
              label: item.data.label,
              name,
              required: item.data.required,
              "helper-text": item.data.instructions,
            };
          case "short-answer":
            return {
              type: "TextInput",
              label: item.data.label,
              name,
              required: item.data.required,
              "helper-text": item.data.instructions,
              "input-type": item.data.subtype,
            };
          case "single-choice":
            return {
              type: "RadioButtonsGroup",
              label: item.data.label,
              name,
              required: item.data.required,
              "data-source": (item.data.options || []).map(
                (opt: string, i: number) => ({
                  id: `${i}_${opt.replace(/\s+/g, "_")}`,
                  title: opt,
                }),
              ),
            };
          case "multiple-choice":
            return {
              type: "CheckboxGroup",
              label: item.data.label,
              name,
              required: item.data.required,
              "data-source": (item.data.options || []).map(
                (opt: string, i: number) => ({
                  id: `${i}_${opt.replace(/\s+/g, "_")}`,
                  title: opt,
                }),
              ),
            };
          case "dropdown":
            return {
              type: "Dropdown",
              label: item.data.label,
              name,
              required: item.data.required,
              "data-source": (item.data.options || []).map(
                (opt: string, i: number) => ({
                  id: `${i}_${opt.replace(/\s+/g, "_")}`,
                  title: opt,
                }),
              ),
            };
          case "opt-in":
            return {
              type: "Checkbox",
              label: item.data.label,
              name,
              required: item.data.required,
            };
          case "datepicker":
            return {
              type: "DatePicker",
              label: item.data.label,
              name,
              required: item.data.required,
              "helper-text": item.data.instructions,
            };
          default:
            return null;
        }
      }),
      {
        type: "Footer",
        label: screen.button.text,
        "on-click-action": {
          name: screen.button.action === "submit" ? "complete" : "navigate",
          payload:
            screen.button.action === "submit"
              ? completionPayload
              : { screen: screen.button.targetScreenId || "" },
        },
      },
    ].filter(Boolean);

    return {
      id: screen.name.toUpperCase().replace(/\s+/g, "_"),
      title: screen.title,
      terminal: screen.button.action === "submit",
      data: {},
      layout: {
        type: "SingleColumnLayout",
        children: [{ type: "Form", name: "flow_path", children }],
      },
    };
  });

  return {
    version: "7.2",
    screens: mappedScreens,
  };
};

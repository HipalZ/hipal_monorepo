const whatAppToken =
  "EAAQk2VVQJsEBOwWROT0lhfAxyZB7IZBpdjRWLfAi1B0S4eMIZCl9CQGZBSuYnYjWGu2I5ysD446ZAEQZCfxdx1MWfajqKNoMIVFzJQbVIO4YJZAORYMTbE4zqvoE9LkVqTFA5P2IBbN8wAB36dBoJliVevoJ0p19ZB4TnRqOeAwp9iGqTvSPV74dYHjSWZAD2e9QtugZDZD";

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

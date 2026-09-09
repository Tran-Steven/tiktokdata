// Parses the uploaded TikTok export off the main thread so large files don't freeze the UI.
self.onmessage = function (event) {
  try {
    const data = JSON.parse(event.data);
    const chats =
      data &&
      data["Direct Message"] &&
      data["Direct Message"]["Direct Messages"] &&
      data["Direct Message"]["Direct Messages"]["ChatHistory"];
    if (!chats) {
      throw new Error(
        "Couldn't find chat history in this file. Make sure you uploaded your TikTok data export JSON.",
      );
    }
    const cleaned = {};
    Object.keys(chats).forEach((k) => {
      const user = k.replace(/^Chat History with /, "").replace(/:$/, "");
      cleaned[user] = chats[k];
    });
    self.postMessage({ ok: true, chats: cleaned });
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err instanceof Error ? err.message : "This file couldn't be read.",
    });
  }
};

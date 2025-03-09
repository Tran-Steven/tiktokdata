"use client";
import { useState, useMemo, useRef, useEffect } from "react";

interface ChatMessage {
  From: string;
  Content: string;
  Date: string;
}

interface ChatData {
  [username: string]: ChatMessage[];
}

function isBracketedGifLink(content: string) {
  return content.trim().startsWith("[https://");
}

function extractLinkFromBracketed(content: string) {
  const match = content.match(/\[(https?:\/\/[^\]]+)\]/i);
  return match ? match[1] : content;
}

function isTikTokLink(url: string) {
  const lower = url.trim().toLowerCase();
  return (
    lower.startsWith("https://www.tiktok") ||
    lower.startsWith("https://www.tiktokv") ||
    lower.startsWith("https://m.tiktok")
  );
}

export default function TikTokDMViewer() {
  const [messages, setMessages] = useState<ChatData | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inboxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat && chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop =
          chatContainerRef.current!.scrollHeight;
      }, 100);
    }
  }, [selectedChat, messages]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        const chats =
          data?.["Direct Message"]?.["Direct Messages"]?.["ChatHistory"];
        if (!chats) throw new Error();
        const cleaned: ChatData = {};
        Object.entries(chats).forEach(([k, v]) => {
          const user = k.replace(/^Chat History with /, "").replace(/:$/, "");
          cleaned[user] = v as ChatMessage[];
        });
        setMessages(cleaned);
        setFileName(file.name);
        setShowModal(false);
      } catch {}
    };
    reader.readAsText(file);
  }

  function formatDate(d: string) {
    const date = new Date(d);
    return isNaN(date.getTime())
      ? "Unknown"
      : new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date);
  }

  function isLink(content: string) {
    const trimmed = content.trim().toLowerCase();
    return (
      trimmed.startsWith("https://") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("www.")
    );
  }

  const filtered = useMemo(() => {
    if (!messages) return [];
    if (!searchTerm.trim()) return Object.entries(messages);
    const s = searchTerm.toLowerCase();
    return Object.entries(messages).filter(([username, arr]) => {
      if (username.toLowerCase().includes(s)) return true;
      return arr.some((msg) => msg.Content.toLowerCase().includes(s));
    });
  }, [messages, searchTerm]);

  const inboxList = useMemo(() => {
    if (!messages || filtered.length === 0)
      return (
        <p className="text-gray-500 mt-6 text-center">No messages found</p>
      );
    const sorted = [...filtered].sort((a, b) => {
      const aLast = a[1][a[1].length - 1]?.Date || "";
      const bLast = b[1][b[1].length - 1]?.Date || "";
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });
    return sorted.map(([username, chatMessages], i) => (
      <div
        key={i}
        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
        onClick={() => setSelectedChat(username)}
      >
        <div className="w-12 h-12 rounded-full bg-gray-300 flex justify-center items-center mr-3">
          <svg
            className="w-8 h-8 text-gray-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{username}</h2>
          <p className="text-gray-500 text-sm truncate">
            {chatMessages[chatMessages.length - 1]?.Content ?? "No content"}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(chatMessages[chatMessages.length - 1]?.Date)}
        </span>
      </div>
    ));
  }, [filtered, messages]);

  const chatView = useMemo(() => {
    if (!selectedChat || !messages) return null;
    const arr = messages[selectedChat];
    return (
      <div className="fixed inset-0 flex flex-col w-full h-full max-w-md mx-auto z-50 bg-white">
        <div className="relative flex items-center h-14 border-b border-gray-200 bg-white px-4">
          <button
            onClick={() => setSelectedChat(null)}
            className="text-black w-8 h-8 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex items-center ml-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex justify-center items-center mr-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold">{selectedChat}</h2>
          </div>
          <div className="flex items-center ml-auto space-x-4">
            <svg
              className="w-5 h-5 text-black cursor-pointer"
              fill="#000000"
              viewBox="0 0 65.456 65.456"
            >
              <path d="M57.427,5.031C53.76,1.646,49.895,0,45.611,0c-5.052,0-9.663,2.314-14.123,4.553c-4.012,2.014-7.801,3.916-11.432,3.916c-2.742,0-5.203-1.092-7.745-3.438c-0.875-0.808-2.146-1.021-3.238-0.543c-1.023,0.448-1.698,1.425-1.78,2.526c-0.147,0.354-0.23,0.742-0.23,1.149v54.293c0,1.657,1.343,3,3,3s3-1.343,3-3V44.807c2.222,1.1,4.536,1.66,6.992,1.66c0,0,0.001,0,0.002,0c5.051-0.001,9.662-2.314,14.122-4.553c4.013-2.014,7.803-3.915,11.434-3.915c2.742,0,5.203,1.092,7.744,3.438c0.875,0.81,2.146,1.023,3.238,0.544c1.092-0.478,1.797-1.557,1.797-2.748V7.235C58.392,6.397,58.042,5.599,57.427,5.031z M52.392,33.534C50.236,32.506,47.989,32,45.613,32c-5.052,0-9.664,2.314-14.125,4.553c-4.012,2.013-7.801,3.914-11.431,3.915h-0.001c-2.393,0-4.572-0.833-6.778-2.605V12.934c2.156,1.029,4.403,1.535,6.779,1.535c5.052,0,9.664-2.314,14.123-4.553C38.192,7.902,41.982,6,45.612,6c2.395,0,4.574,0.833,6.78,2.605V33.534z" />
            </svg>
            <svg
              className="w-6 h-6 text-black cursor-pointer"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </div>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f8f8f8]"
        >
          {arr.map((msg, i) => {
            const isUser = msg.From !== selectedChat;
            const side = isUser ? "justify-end" : "justify-start";
            const bubbleColor = isUser
              ? "bg-[#1092d6] text-white"
              : "bg-white text-black";
            if (isBracketedGifLink(msg.Content)) {
              const link = extractLinkFromBracketed(msg.Content);
              return (
                <div key={i} className={`flex items-end gap-2 ${side}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex justify-center items-center">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <img
                      src={link}
                      alt="gif"
                      className="rounded-md max-w-[200px] h-auto mb-1"
                    />
                    <span
                      className={`block text-xs ${
                        isUser ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {formatDate(msg.Date)}
                    </span>
                  </div>
                </div>
              );
            }
            if (isLink(msg.Content)) {
              if (isTikTokLink(msg.Content)) {
                return (
                  <div key={i} className={`flex items-end gap-2 ${side}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex justify-center items-center">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <div className="relative w-[200px] h-[350px] bg-black rounded-md flex items-center justify-center mb-1">
                        <a
                          href={msg.Content.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <svg
                            className="w-10 h-10 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </a>
                      </div>
                      <a
                        href={msg.Content.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-black underline break-all mb-1 max-w-[200px]"
                      >
                        {msg.Content}
                      </a>
                      <span className="text-xs text-black">
                        {formatDate(msg.Date)}
                      </span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex items-end gap-2 ${side}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex justify-center items-center">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <div className="relative w-[200px] h-[350px] bg-black rounded-md flex items-center justify-center mb-1">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-xs break-words whitespace-pre-wrap mb-1 max-w-[200px]">
                      {msg.Content}
                    </p>
                    <span
                      className={`block text-xs ${
                        isUser ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {formatDate(msg.Date)}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className={`flex items-end gap-2 ${side}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex justify-center items-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${bubbleColor}`}
                >
                  {msg.Content}
                  <span
                    className={`block text-xs mt-1 ${
                      isUser ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {formatDate(msg.Date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 flex items-center bg-[#f8f8f8]">
          <div className="flex-1 rounded-full bg-white text-sm text-gray-400 pointer-events-none select-none px-3 py-2">
            Message...
          </div>
        </div>
      </div>
    );
  }, [selectedChat, messages]);

  function handleInboxClick() {
    // Force jump to top (no smooth)
    if (inboxContainerRef.current) {
      inboxContainerRef.current.scrollTop = 0;
    }
    // If you'd rather try smooth scrolling:
    // inboxContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center w-full max-w-md mx-auto relative">
      {!selectedChat && (
        <>
          <div className="relative h-14 w-full border-b border-gray-200 flex-none">
            <div
              className={`absolute inset-0 flex items-center transition-all duration-300 ${
                isSearching ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <div className="absolute left-4">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 8l.867-1.5A2 2 0 017.58 6h8.84a2 2 0 011.713.937L19 8h1a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h1zM12 17a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <h1 className="mx-auto text-lg font-bold">Inbox</h1>
              <div className="absolute right-4">
                <svg
                  onClick={() => setIsSearching(true)}
                  className="w-6 h-6 text-gray-500 cursor-pointer"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 2a8 8 0 105.29 14.012l4.7 4.7a1 1 0 001.42-1.42l-4.7-4.7A8 8 0 0010 2zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" />
                </svg>
              </div>
            </div>
            <div
              className={`absolute inset-0 px-4 flex items-center transition-all duration-300 ${
                isSearching ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <input
                type="text"
                className="w-full h-9 bg-white rounded-full px-3 text-sm outline-none border-none"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                onClick={() => {
                  setIsSearching(false);
                  setSearchTerm("");
                }}
                className="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 2a8 8 0 105.29 14.012l4.7 4.7a1 1 0 001.42-1.42l-4.7-4.7A8 8 0 0010 2zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" />
              </svg>
            </div>
          </div>

          {/*
            This is the scrollable inbox area.
            We force a fixed height so it actually can scroll.
            h-[calc(100vh-3.5rem-4rem)] => for example:
            - 3.5rem might be your header height
            - 4rem might be your bottom bar
            Adjust to suit your own layout or screen design
          */}
          <div
            ref={inboxContainerRef}
            className="overflow-y-auto w-full flex-grow h-[calc(100vh-3.5rem-4rem)]"
          >
            {inboxList}
          </div>
        </>
      )}

      {selectedChat && chatView}

      {!selectedChat && (
        <div className="w-full max-w-md mx-auto bg-white border-t border-gray-200 flex-none h-16 sticky bottom-0 flex justify-center items-center">
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={handleInboxClick}
          >
            <svg
              viewBox="0 0 90 90"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="w-8 h-8 pb-3 text-black"
            >
              <path d="M60.66,39.31H29.341c-2.063,0-3.735-1.672-3.735-3.735c0-2.063,1.672-3.735,3.735-3.735H60.66 c2.062,0,3.735,1.672,3.735,3.735C64.395,37.638,62.722,39.31,60.66,39.31z" />
              <path
                fill="black"
                d="M45,90c-0.991,0-1.94-0.394-2.64-1.094L24.603,71.15H5.853 c-2.063,0-3.735-1.673-3.735-3.735V3.735C2.118,1.672,3.79,0,5.853,0h78.294 c2.062,0,3.735,1.672,3.735,3.735v63.681c0,2.062-1.673,3.735-3.735,3.735H65.397 L47.64,88.906C46.94,89.606,45.991,90,45,90z M9.587,63.681h16.564c0.991,0,1.94,0.394,2.64,1.094L45,80.985l16.21-16.21 c0.7-0.7,1.651-1.094,2.64-1.094h16.562V7.469H9.587v56.212z"
              />
            </svg>
            <span className="text-base text-black -mt-2">Inbox</span>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 max-w-sm p-6 bg-white rounded-2xl shadow-xl flex flex-col items-center text-center">
            <h2 className="text-xl font-bold mb-2">
              Upload Your TikTok Data JSON File
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              We never store your data — it stays local.
              <br />
              <a
                className="text-blue-300"
                href="https://github.com/Tran-Steven/tiktokdata"
                target="_blank"
              >
                View Code Repository and Privacy
              </a>
            </p>
            <div className="relative w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <svg
                className="w-12 h-12 text-gray-400 mb-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16.5 2a1 1 0 01.94.66l1.02 2.72A1 1 0 0019.4 6h2.6a1 1 0 010 2h-1.4l-.45 8.16A4 4 0 0116.18 20H7.82A4 4 0 014.45 16.16L4 8H2a1 1 0 010-2h2.6a1 1 0 00.94-.66l1.02-2.72A1 1 0 017.5 2h9z" />
              </svg>
              <p className="text-gray-600">Tap or drag file here</p>
            </div>
            {fileName && (
              <p className="text-sm text-gray-500 mt-3">{fileName}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

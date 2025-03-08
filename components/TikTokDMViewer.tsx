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

function isLink(content: string) {
  const urlPattern = /^(https?:\/\/|www\.)/i;
  return urlPattern.test(content.trim());
}

export default function TikTokDMViewer() {
  const [messages, setMessages] = useState<ChatData | null>(null);
  const [showModal, setShowModal] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const filtered = useMemo(() => {
    if (!messages) return [];
    if (!searchTerm.trim()) return Object.entries(messages);
    const s = searchTerm.toLowerCase();
    return Object.entries(messages).filter(([u, arr]) => {
      if (u.toLowerCase().includes(s)) return true;
      return arr.some((m) => m.Content.toLowerCase().includes(s));
    });
  }, [messages, searchTerm]);

  const inboxList = useMemo(() => {
    if (!messages || filtered.length === 0) {
      return (
        <p className="text-gray-500 mt-6 text-center">No messages found</p>
      );
    }
    return filtered.map(([u, c], i) => (
      <div
        key={i}
        className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
        onClick={() => setSelectedChat(u)}
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
          <h2 className="font-semibold truncate">{u}</h2>
          <p className="text-gray-500 text-sm truncate">
            {c[c.length - 1]?.Content ?? "No content"}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(c[c.length - 1]?.Date)}
        </span>
      </div>
    ));
  }, [filtered, messages]);

  const chatView = useMemo(() => {
    if (!selectedChat || !messages) return null;
    const arr = messages[selectedChat];
    return (
      <div className="fixed inset-0 flex flex-col w-full h-full max-w-md mx-auto z-50 bg-[#f8f8f8]">
        <div className="relative h-14 w-full flex items-center justify-center px-4 bg-[#f8f8f8] border-b border-gray-200">
          <button
            onClick={() => setSelectedChat(null)}
            className="absolute left-4 text-black text-2xl"
          >
            &lt;
          </button>
          <h2 className="text-base font-semibold text-black">{selectedChat}</h2>
          <button className="absolute right-4 text-black">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {arr.map((m, i) => {
            const isUser = m.From !== selectedChat;
            const link = /^https?:\/\/|^www\./i.test(m.Content.trim());
            const stamp = isUser ? "text-white" : "text-gray-500";
            return (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-300 flex justify-center items-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c4.67 0 8 2.33 8 4v2H4v-2c0-1.67 3.33-4 8-4z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                    isUser
                      ? "bg-[#1092d6] text-white self-end"
                      : "bg-white text-black"
                  }`}
                >
                  {link ? (
                    <div>
                      <div className="relative w-44 h-72 bg-black rounded-md flex items-center justify-center mb-2">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <div className="absolute left-2 bottom-2 text-white">
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs break-words whitespace-pre-wrap">
                        {m.Content}
                      </p>
                    </div>
                  ) : (
                    <span className="break-words whitespace-pre-wrap">
                      {m.Content}
                    </span>
                  )}
                  <span className={`block text-xs mt-1 ${stamp}`}>
                    {formatDate(m.Date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 flex items-center bg-[#f8f8f8]">
          <div className="flex-1 p-3 rounded-full bg-white text-sm text-gray-400 pointer-events-none select-none">
            Message...
          </div>
        </div>
      </div>
    );
  }, [selectedChat, messages]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center w-full max-w-md mx-auto relative">
      {!selectedChat && (
        <div className="relative h-14 w-full border-b border-gray-200">
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
      )}
      {!selectedChat && (
        <div className="flex-1 w-full overflow-y-auto">{inboxList}</div>
      )}
      {chatView}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 max-w-sm p-6 bg-white rounded-2xl shadow-xl flex flex-col items-center text-center">
            <h2 className="text-xl font-bold mb-2">
              Upload Your TikTok DM JSON File
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              We never store your data — it stays local.
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

import { useState, useEffect, useRef } from "react";
import api from "../lib/api.js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/chat/history").then((res) => setMessages(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: "user", content: input, id: `temp-${Date.now()}` };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await api.post("/chat", { message: userMessage.content });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply, id: `temp-reply-${Date.now()}` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Try again?", id: `temp-error-${Date.now()}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <h1 className="text-xl font-semibold mb-4">Coach</h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {loading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-text-muted text-sm">
            Tell me what you ate, what you trained, or ask me anything about your progress.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-accent text-accent-dark ml-auto"
                  : "bg-bg-card border border-bg-border text-text"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        {sending && (
          <div className="bg-bg-card border border-bg-border text-text-muted px-4 py-2 rounded-2xl text-sm max-w-[80%]">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I had 2 eggs and ran 30 min…"
          className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-accent text-accent-dark px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
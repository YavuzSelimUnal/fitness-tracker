import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import api from "../lib/api.js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get("/chat/history").then((res) => setMessages(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSend(e) {
    e.preventDefault();
    if ((!input.trim() && !photo) || sending) return;

    const userMessage = {
      role: "user",
      content: input || "[Sent a meal photo]",
      id: `temp-${Date.now()}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentPhoto = photo;
    const currentCaption = input;
    setInput("");
    setPhoto(null);
    setPhotoPreview(null);
    setSending(true);

    try {
      let res;
      if (currentPhoto) {
        const formData = new FormData();
        formData.append("photo", currentPhoto);
        if (currentCaption) formData.append("caption", currentCaption);
        res = await api.post("/chat/meal-photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.post("/chat", { message: currentCaption });
      }

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

      <form onSubmit={handleSend} className="space-y-2">
        {photoPreview && (
          <div className="relative inline-block">
            <img src={photoPreview} alt="Selected meal" className="h-20 rounded-lg" />
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setPhotoPreview(null);
              }}
              className="absolute -top-2 -right-2 bg-bg-card border border-bg-border rounded-full w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-bg-card border border-bg-border text-text-muted px-3 rounded-lg"
          >
            <Camera size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={photo ? "Add a caption (optional)…" : "I had 2 eggs and ran 30 min…"}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-bg-border text-text placeholder-text-muted"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-accent text-accent-dark px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
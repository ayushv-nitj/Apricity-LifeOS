/**
 * components/social/ChatTab.tsx — Chat Rooms
 *
 * "use client" — uses hooks, refs, polling interval, and fetch.
 *
 * Two-panel layout:
 *  - Left: scrollable list of rooms the user is a member of
 *  - Right: message thread for the selected room + input bar
 *
 * Room types:
 *  - "dm"      → direct message between two people
 *  - "group"   → group chat with multiple members
 *  - "project" → project-focused room (same as group, different label)
 *
 * Real-time messaging via polling:
 *  - No WebSocket or Pusher is used (keeps dependencies minimal)
 *  - When a room is selected, `setInterval` polls for new messages every 3 seconds
 *  - The interval is cleared in the useEffect cleanup when the room changes or
 *    the component unmounts — prevents memory leaks and stale intervals
 *  - `pollRef` stores the interval ID so it can be cleared from anywhere
 *
 * Auto-scroll:
 *  - `bottomRef` is an invisible div at the end of the message list
 *  - `scrollIntoView({ behavior: "smooth" })` is called whenever messages update
 *
 * Create room modal:
 *  - Name, type (group/project/DM), and comma-separated member emails
 *  - The API resolves emails to user IDs and creates the ChatRoom document
 *
 * Data sources:
 *  - GET  /api/rooms                    → list user's rooms
 *  - POST /api/rooms                    → create a room { name, type, memberEmails }
 *  - GET  /api/rooms/:id/messages       → fetch last 50 messages
 *  - POST /api/rooms/:id/messages       → send a message { content }
 */
"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Send, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room { _id: string; name: string; type: string; updatedAt: string }
interface Message { _id: string; senderId: string; senderName: string; content: string; createdAt: string }

export default function ChatTab() {
  const { data: session } = useSession();
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom]     = useState({ name: "", type: "group", emails: "" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom._id);
    pollRef.current = setInterval(() => loadMessages(activeRoom._id), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadRooms() {
    const data = await fetch("/api/rooms").then((r) => r.json());
    setRooms(Array.isArray(data) ? data : []);
  }

  async function loadMessages(roomId: string) {
    const data = await fetch(`/api/rooms/${roomId}/messages`).then((r) => r.json());
    setMessages(Array.isArray(data) ? data : []);
  }

  async function sendMessage() {
    if (!input.trim() || !activeRoom) return;
    const content = input.trim();
    setInput("");
    await fetch(`/api/rooms/${activeRoom._id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    loadMessages(activeRoom._id);
  }

  async function createRoom() {
    const memberEmails = newRoom.emails.split(",").map((e) => e.trim()).filter(Boolean);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoom.name, type: newRoom.type, memberEmails }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewRoom({ name: "", type: "group", emails: "" });
      loadRooms();
    }
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Room list */}
      <div className="w-56 flex flex-col gap-2">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-mono transition-colors"
        >
          <Plus className="w-4 h-4" /> New Room
        </button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {rooms.length === 0 && (
            <p className="text-xs text-slate-600 font-mono px-2 pt-2">No rooms yet.</p>
          )}
          {rooms.map((r) => (
            <button
              key={r._id}
              onClick={() => setActiveRoom(r)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors flex items-center gap-2",
                activeRoom?._id === r._id
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass-card rounded-xl flex flex-col overflow-hidden">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 font-mono text-sm">
            Select a room to start chatting
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-cyber-border/40 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-sm text-white">{activeRoom.name}</span>
              <span className="text-xs text-slate-500 ml-1">({activeRoom.type})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.senderId === session?.user?.id;
                return (
                  <div key={m._id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    {!isMe && (
                      <span className="text-xs text-slate-500 font-mono mb-1">{m.senderName}</span>
                    )}
                    <div
                      className={cn(
                        "max-w-xs px-3 py-2 rounded-xl text-sm",
                        isMe
                          ? "bg-cyan-500/20 text-cyan-100 rounded-br-none"
                          : "bg-white/5 text-slate-200 rounded-bl-none"
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="text-xs text-slate-600 mt-0.5">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-cyber-border/40 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="cyber-input flex-1 px-3 py-2 rounded-lg text-sm"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create room modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-96 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-white">Create Room</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              placeholder="Room name"
              className="cyber-input w-full px-3 py-2 rounded-lg text-sm"
            />
            <select
              value={newRoom.type}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
              className="cyber-input w-full px-3 py-2 rounded-lg text-sm"
            >
              <option value="group">Group</option>
              <option value="project">Project</option>
              <option value="dm">DM</option>
            </select>
            <div>
              <label className="text-xs text-slate-400 font-mono">Member emails (comma-separated)</label>
              <input
                value={newRoom.emails}
                onChange={(e) => setNewRoom({ ...newRoom, emails: e.target.value })}
                placeholder="a@x.com, b@x.com"
                className="cyber-input w-full px-3 py-2 rounded-lg text-sm mt-1"
              />
            </div>
            <button
              onClick={createRoom}
              disabled={!newRoom.name.trim()}
              className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-mono transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

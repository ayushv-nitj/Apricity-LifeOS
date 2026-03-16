/**
 * components/social/FriendsTab.tsx — Friends Management
 *
 * "use client" — all state and fetch calls happen in the browser.
 *
 * Three sections:
 *
 *  1. Add Friend — input an email address and send a friend request.
 *     The API checks that the email exists, isn't the current user,
 *     and that no request already exists between the two users.
 *
 *  2. Pending Requests — incoming friend requests waiting for a response.
 *     Each request shows the sender's avatar, username, and email.
 *     Accept → sets status to "accepted" (both users become friends).
 *     Decline → sets status to "declined" (request disappears).
 *
 *  3. Friends List — all accepted friends with their username, email, and level.
 *
 * `load()` fetches both lists in parallel using Promise.all for efficiency.
 * It's called on mount and after any accept/decline action to refresh the UI.
 *
 * Data sources:
 *  - GET  /api/friends          → accepted friends list
 *  - POST /api/friends          → send a friend request { email }
 *  - GET  /api/friends/requests → incoming pending requests
 *  - PATCH /api/friends/requests → accept/decline { requestId, action }
 */
"use client";
import { useEffect, useState } from "react";
import { UserPlus, Check, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Friend { _id: string; username: string; email: string; avatar?: string; level: number; xp: number }
interface Request { _id: string; sender: { username: string; email: string; avatar?: string } }

export default function FriendsTab() {
  const [friends, setFriends]     = useState<Friend[]>([]);
  const [requests, setRequests]   = useState<Request[]>([]);
  const [email, setEmail]         = useState("");
  const [msg, setMsg]             = useState("");
  const [loading, setLoading]     = useState(false);

  async function load() {
    const [f, r] = await Promise.all([
      fetch("/api/friends").then((r) => r.json()),
      fetch("/api/friends/requests").then((r) => r.json()),
    ]);
    setFriends(Array.isArray(f) ? f : []);
    setRequests(Array.isArray(r) ? r : []);
  }

  useEffect(() => { load(); }, []);

  async function sendRequest() {
    if (!email.trim()) return;
    setLoading(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Request sent!" : data.error ?? "Error");
    setEmail("");
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function respond(requestId: string, action: "accept" | "decline") {
    await fetch("/api/friends/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      {/* Add friend */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-mono text-slate-300 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-cyan-400" /> Add Friend by Email
        </h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendRequest()}
            placeholder="friend@email.com"
            className="cyber-input flex-1 px-3 py-2 rounded-lg text-sm"
          />
          <button
            onClick={sendRequest}
            disabled={loading}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-mono transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
        {msg && <p className={cn("text-xs mt-2 font-mono", msg === "Request sent!" ? "text-emerald-400" : "text-red-400")}>{msg}</p>}
      </div>

      {/* Pending requests */}
      {requests.length > 0 && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-sm font-mono text-slate-300 mb-3">Pending Requests</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r._id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center">
                    {r.sender.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.sender.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white font-mono">{r.sender.username}</p>
                    <p className="text-xs text-slate-500">{r.sender.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond(r._id, "accept")} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => respond(r._id, "decline")} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-mono text-slate-300 mb-3">Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="text-xs text-slate-600 font-mono">No friends yet. Add someone above.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f._id} className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-cyan-400/10 flex items-center justify-center overflow-hidden">
                  {f.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-mono">{f.username}</p>
                  <p className="text-xs text-slate-500">{f.email}</p>
                </div>
                <span className="text-xs font-mono text-yellow-400">LVL {f.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

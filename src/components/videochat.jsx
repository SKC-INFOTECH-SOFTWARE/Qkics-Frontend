import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../redux/store/tokenManager";
import { useLiveKit } from "./hooks/useLiveKit";
import { useCallChat } from "./hooks/useCallChat";
import {
  getCallRoom,
  getCallMessages,
  getMyNote,
  uploadCallFile,
  saveMyNote,
  endCall,
} from "./utils/callApi";

// ── Main UI Component ─────────────────────────────────────
export default function VideoCallComponent({ call_Room_id, token, onCallEnd }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const screenRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);

  const lk = useLiveKit();
  const chat = useCallChat(call_Room_id, token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState("");
  const [chatInput, setChatInput] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const roomData = await getCallRoom(call_Room_id);
        if (!roomData.can_join) {
          setError("Call abhi available nahi hai ya khatam ho gaya.");
          setLoading(false);
          return;
        }
        const history = await getCallMessages(call_Room_id);
        const noteData = await getMyNote(call_Room_id);
        setNote(noteData.content || "");
        await lk.connect(roomData.sfu_url, roomData.sfu_token);
        chat.connect(history);
        if (roomData.remaining_seconds) {
          setRemaining(roomData.remaining_seconds);
        }
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
    return () => {
      clearInterval(timerRef.current);
      lk.disconnect();
      chat.disconnect();
    };
  }, [call_Room_id, lk, chat]);

  useEffect(() => {
    if (!remaining) return;
    timerRef.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remaining]);

  useEffect(() => {
    if (localRef.current && lk.localVideoTrack) {
      localRef.current.srcObject = new MediaStream([lk.localVideoTrack.mediaStreamTrack]);
    }
  }, [lk.localVideoTrack]);

  useEffect(() => {
    if (remoteRef.current && lk.remoteVideoTrack) {
      remoteRef.current.srcObject = new MediaStream([lk.remoteVideoTrack.mediaStreamTrack]);
    }
  }, [lk.remoteVideoTrack]);

  useEffect(() => {
    if (screenRef.current && lk.screenShareTrack) {
      screenRef.current.srcObject = new MediaStream([lk.screenShareTrack.mediaStreamTrack]);
    }
  }, [lk.screenShareTrack]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleEndCall = useCallback(async () => {
    lk.disconnect();
    chat.disconnect();
    await endCall(call_Room_id);   
    onCallEnd?.();
  }, [lk, chat, call_Room_id, onCallEnd]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    chat.sendMessage(chatInput);
    setChatInput("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const msg = await uploadCallFile(call_Room_id, file);
      chat.notifyFileShared(msg);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = "";
  };

  const handleNoteSave = () => saveMyNote(call_Room_id, note);

  const fmt = (s) => (s || s === 0) ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "";

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: "#aaa", marginTop: 16 }}>Connecting...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <p style={{ color: "#ff4444" }}>{error}</p>
      <button style={styles.btnRed} onClick={onCallEnd}>Leave</button>
    </div>
  );

  return (
    <div style={styles.root}>
      <div style={styles.videoArea}>
        {lk.screenShareTrack ? (
          <video ref={screenRef} autoPlay playsInline style={styles.mainVideo} />
        ) : lk.remoteVideoTrack ? (
          <video ref={remoteRef} autoPlay playsInline style={styles.mainVideo} />
        ) : (
          <div style={styles.waiting}>
            <p>{lk.isConnected ? "Dusre participant ka wait kar rahe hain..." : "Connecting..."}</p>
          </div>
        )}
        {lk.screenShareTrack && lk.remoteVideoTrack && (
          <video ref={remoteRef} autoPlay playsInline style={{ ...styles.pip, bottom: 120, right: 12 }} />
        )}
        <video ref={localRef} autoPlay playsInline muted style={styles.pip} />
        {remaining !== null && <div style={{...styles.timer, color: remaining < 120 ? "#ff4444" : "#fff"}}>{fmt(remaining)}</div>}
        {!lk.isConnected && <div style={styles.connecting}>Reconnecting...</div>}
      </div>

      <div style={styles.controls}>
        <button style={lk.isMicOn ? styles.btn : styles.btnOff} onClick={lk.toggleMic}>{lk.isMicOn ? "🎤 Mute" : "🔇 Unmute"}</button>
        <button style={lk.isCamOn ? styles.btn : styles.btnOff} onClick={lk.toggleCamera}>{lk.isCamOn ? "📷 Cam Off" : "📷 Cam On"}</button>
        <button style={lk.isScreenSharing ? styles.btnOff : styles.btn} onClick={lk.toggleScreenShare}>{lk.isScreenSharing ? "🖥 Stop Share" : "🖥 Share Screen"}</button>
        <button style={showNotes ? styles.btnOff : styles.btn} onClick={() => setShowNotes(!showNotes)}>📝 Notes</button>
        <button style={styles.btnRed} onClick={handleEndCall}>📵 End Call</button>
      </div>

      <div style={styles.bottom}>
        <div style={styles.chatPanel}>
          <div style={styles.panelHeader}>In-Call Chat</div>
          <div style={styles.messages}>
            {chat.messages.map((m, i) => (
              <div key={m.id || i} style={styles.msg}>
                <span style={styles.msgUser}>{m.senderUsername}:</span>
                {m.isFile ? <a href={m.fileUrl} target="_blank" rel="noreferrer" style={styles.fileLink}> {m.fileName}</a> : <span style={styles.msgText}> {m.text}</span>}
              </div>
            ))}
            {chat.isTyping && <div style={{ color: "#888", fontSize: 12, fontStyle: "italic" }}>Typing...</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} style={styles.chatForm}>
            <input value={chatInput} onChange={(e) => {setChatInput(e.target.value); chat.sendTyping(e.target.value.length > 0);}} onBlur={() => chat.sendTyping(false)} placeholder="Message..." style={styles.chatInput} />
            <button type="submit" style={styles.btnSend}>Send</button>
            <button type="button" style={styles.btnFile} onClick={() => fileRef.current?.click()}>File</button>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
          </form>
        </div>
        {showNotes && (
          <div style={styles.notesPanel}>
            <div style={styles.panelHeader}>My Private Notes</div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={handleNoteSave} placeholder="Sirf aap dekh sakte ho..." style={styles.noteArea} />
            <button style={styles.btnGreen} onClick={handleNoteSave}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { display: "flex", flexDirection: "column", height: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "sans-serif" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0d0d", color: "#fff" },
  spinner: { width: 40, height: 40, border: "3px solid #333", borderTop: "3px solid #4da6ff", borderRadius: "50%", animation: "spin 1s linear infinite" },
  videoArea: { position: "relative", flex: 1, background: "#111", overflow: "hidden" },
  mainVideo: { width: "100%", height: "100%", objectFit: "cover" },
  waiting: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 16 },
  pip: { position: "absolute", bottom: 12, right: 12, width: 160, height: 100, objectFit: "cover", borderRadius: 8, border: "2px solid #333" },
  timer: { position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: 6, fontSize: 18, fontWeight: 500 },
  connecting: { position: "absolute", top: 12, left: 12, background: "rgba(255,165,0,0.8)", color: "#000", padding: "4px 12px", borderRadius: 6, fontSize: 12 },
  controls: { display: "flex", gap: 8, padding: "10px 16px", background: "#111", justifyContent: "center", borderTop: "1px solid #222", flexWrap: "wrap" },
  btn: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#2a2a2a", color: "#fff", cursor: "pointer", fontSize: 13 },
  btnOff: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#444", color: "#aaa", cursor: "pointer", fontSize: 13 },
  btnRed: { padding: "8px 16px", borderRadius: 6, border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", fontSize: 13 },
  btnSend: { padding: "7px 14px", borderRadius: 6, border: "none", background: "#1a6ee0", color: "#fff", cursor: "pointer", fontSize: 13 },
  btnFile: { padding: "7px 12px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "#aaa", cursor: "pointer", fontSize: 13 },
  btnGreen: { padding: "8px", borderRadius: 6, border: "none", background: "#1d6a44", color: "#fff", cursor: "pointer", fontSize: 13, marginTop: 8 },
  bottom: { display: "flex", height: 240, background: "#0d0d0d", borderTop: "1px solid #1a1a1a" },
  chatPanel: { flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #1a1a1a" },
  notesPanel: { width: 280, display: "flex", flexDirection: "column", padding: 10 },
  panelHeader: { padding: "5px 12px", fontSize: 11, color: "#555", letterSpacing: 1, borderBottom: "1px solid #1a1a1a", textTransform: "uppercase" },
  messages: { flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 },
  msg: { fontSize: 13, lineHeight: 1.5 },
  msgUser: { color: "#4da6ff", fontWeight: 500 },
  msgText: { color: "#ccc" },
  fileLink: { color: "#63d9a0", textDecoration: "underline" },
  chatForm: { display: "flex", gap: 6, padding: "8px 10px", borderTop: "1px solid #1a1a1a" },
  chatInput: { flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 6, color: "#fff", padding: "6px 10px", fontSize: 13, outline: "none" },
  noteArea: { flex: 1, background: "#111", border: "1px solid #2a2a2a", borderRadius: 6, color: "#ccc", padding: 8, fontSize: 13, resize: "none", outline: "none" },
};

// ── Page Wrapper ──────────────────────────────────────────
export function VideoCallPage() {
  const { call_Room_id } = useParams();
  const navigate = useNavigate();
  const token = getAccessToken();

  if (!token) {
    return <div style={styles.center}>Session expired. Please login again.</div>;
  }

  if (!call_Room_id) {
    return <div style={styles.center}>Call session ID was not found. Please join from your bookings.</div>;
  }

  return (
    <VideoCallComponent
      call_Room_id={call_Room_id}
      token={token}
      onCallEnd={() => navigate("/my-bookings")}
    />
  );
}

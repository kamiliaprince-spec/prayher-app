import React, { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ID } from "appwrite";

const PROFILES_COLLECTION_ID = "profiles";
const COMMUNITY_POSTS_COLLECTION_ID = "community_posts";
const COMMUNITY_COMMENTS_COLLECTION_ID = "community_comments";
const PRAYER_AGREEMENTS_COLLECTION_ID = "prayer_agreements";

const SCRIPTURES = [
  { verse: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25", note: "God already equipped you. You don't have to earn your worth — it was woven into you." },
  { verse: "Be still, and know that I am God.", ref: "Psalm 46:10", note: "In the stillness, He speaks. Pause before you rush into the next thing today." },
  { verse: "I can do all this through him who gives me strength.", ref: "Philippians 4:13", note: "This isn't about willpower. His strength flows through you when you stop relying solely on your own." },
  { verse: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5", note: "Your mind will try to figure everything out. Practice releasing what you can't control." },
  { verse: "The Lord your God is with you, the Mighty Warrior who saves.", ref: "Zephaniah 3:17", note: "You are not fighting alone. The same God who created the universe is fighting for you." },
  { verse: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7", note: "Every single worry — give it to Him. Not some of them. All of them." },
  { verse: "You are altogether beautiful, my darling; there is no flaw in you.", ref: "Song of Solomon 4:7", note: "God sees you fully and loves what He sees. Let that truth settle into your heart today." },
];

const PROMPTS = [
  "Talk to God about what's been weighing on your heart lately.",
  "Pray for patience — with others and with yourself.",
  "Ask God to reveal where fear is driving your decisions.",
  "Thank Him for three specific things from the past 24 hours.",
  "Pray for the woman in your life who needs the most grace right now.",
  "Ask God to align your desires with His will for your life.",
  "Tell God about the thing you've been too afraid to say out loud.",
];

const MOODS = [
  {
    emoji: "😔", label: "Anxious",
    prayer: "Lord, I release every anxious thought into Your hands. Where my mind races, let Your peace flood in. Remind me that You hold every detail of my life with care. I trust You. Amen.",
    verse: "Do not be anxious about anything, but in every situation, present your requests to God.", ref: "Philippians 4:6",
    note: "Anxiety is a signal, not a sentence. You felt it — now give it to God. He's already ahead of whatever you're worried about. 💛"
  },
  {
    emoji: "😤", label: "Overwhelmed",
    prayer: "Jesus, I am carrying more than I was made to carry alone. Today I lay down the weight. Help me release what isn't mine to hold. You are my rest. Amen.",
    verse: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28",
    note: "You're not failing — you're human. Overwhelm means you care. Let God carry the parts that are too heavy. 🤍"
  },
  {
    emoji: "😊", label: "Grateful",
    prayer: "God, thank You. For breath, for grace, for the fact that Your mercies are new this morning. I don't want to rush past this feeling. You are so good to me. Amen.",
    verse: "Give thanks in all circumstances; for this is God's will for you.", ref: "1 Thessalonians 5:18",
    note: "Gratitude is a spiritual superpower. Hold onto this — it's proof that God has been moving in your life. ✨"
  },
  {
    emoji: "😴", label: "Tired",
    prayer: "Lord, I'm running on empty. Restore what rest couldn't fully give back. Be my energy today. Let me move in Your grace, not my own striving. Amen.",
    verse: "He gives strength to the weary and increases the power of the weak.", ref: "Isaiah 40:29",
    note: "You're allowed to be tired. That doesn't make you weak. Ask God to be your energy today. 🌿"
  },
  {
    emoji: "💪", label: "Focused",
    prayer: "God, sharpen my mind and steady my purpose. Let every effort I make be an act of worship. Keep me aligned with what truly matters to You. Amen.",
    verse: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23",
    note: "This clarity is a gift. Move in it. God honors intentional effort — you're walking in purpose today. 🔥"
  },
];

const TRACKS = [
  { icon: "💔", title: "Healing & Letting Go", desc: "Release what no longer serves your spirit", days: 21, color: "#F5DEDE", accent: "#B87070" },
  { icon: "💪", title: "Discipline & Consistency", desc: "Build the habits God is calling you to", days: 14, color: "#F5E8CC", accent: "#B8873C" },
  { icon: "👩‍👧", title: "Motherhood & Patience", desc: "Lead your home with grace and wisdom", days: 30, color: "#DFF0E1", accent: "#6B8F71" },
  { icon: "💸", title: "Faith & Finances", desc: "Trust God as your ultimate provider", days: 21, color: "#F0E6D3", accent: "#7A5230" },
  { icon: "💍", title: "Relationships & Boundaries", desc: "Love deeply, but from a place of wholeness", days: 14, color: "#F5DEDE", accent: "#B87070" },
];

function getDisplayName(user: any) {
  const emailPrefix = user?.email?.split("@")?.[0] || "Sis";
  return user?.name?.trim() || emailPrefix || "Sis";
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function Tag({ label, color, text }: { label: string; color: string; text?: string }) {
  return (
    <span
      style={{
        background: color,
        color: text || "#7A5230",
        fontSize: 11,
        fontFamily: "'Crimson Pro', serif",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}

function Card({
  children,
  style = {},
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFCF7",
        borderRadius: 18,
        border: "1px solid #E8DDD0",
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  style = {},
  variant = "primary",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  variant?: "primary" | "ghost" | "outline";
  disabled?: boolean;
}) {
  const base: CSSProperties = {
    border: "none",
    borderRadius: 14,
    padding: "13px 20px",
    fontFamily: "'Crimson Pro', serif",
    fontSize: 16,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
    transition: "opacity 0.15s",
    opacity: disabled ? 0.65 : 1,
  };

  const variants: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #B8873C, #D4A855)",
      color: "#FFFDF9",
    },
    ghost: {
      background: "#F0E6D3",
      color: "#4A2E12",
    },
    outline: {
      background: "transparent",
      border: "1.5px solid #B8873C",
      color: "#B8873C",
    },
  };

  return (
    <button disabled={disabled} onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function HomeScreen({
  streak,
  onCheckIn,
  openPrayNow,
}: {
  streak: number;
  onCheckIn: () => Promise<void>;
  openPrayNow: () => void;
}) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [mood, setMood] = useState<any>(null);

  const today = new Date();
  const scripture = SCRIPTURES[today.getDay()];
  const prompt = PROMPTS[today.getDay()];
  const hr = today.getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  async function handleCheckIn() {
    await onCheckIn();
    setCheckedIn(true);
  }

  return (
    <div style={{ padding: "0 0 100px" }}>
      <div style={{ background: "linear-gradient(160deg, #4A2E12 0%, #7A5230 100%)", padding: "48px 24px 32px", borderRadius: "0 0 32px 32px" }}>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#D4A855", margin: "0 0 6px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {greet}, sis ✨
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#FFFDF9", margin: "0 0 20px", lineHeight: 1.25, fontWeight: 700 }}>
          Walk with God
          <br />
          today.
        </h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={openPrayNow}
            style={{ flex: 1, background: "linear-gradient(135deg, #B8873C, #D4A855)", border: "none", borderRadius: 16, padding: "14px 0", fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#FFFDF9", cursor: "pointer", fontWeight: 700 }}
          >
            🙏 Pray Now
          </button>

          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#D4A855", fontWeight: 700 }}>{streak}</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>DAYS 🔥</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {!checkedIn ? (
          <Card>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", margin: "0 0 10px" }}>Hey sis, don't forget your moment with God today 💛</p>
            <Btn onClick={handleCheckIn}>✅ I spent time with God today</Btn>
          </Card>
        ) : (
          <div style={{ background: "#DFF0E1", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 12, border: "1px solid #6B8F7133" }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#6B8F71", fontWeight: 700 }}>Time with God: Done</div>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060" }}>You're showing up. Keep going. 🌿</div>
            </div>
          </div>
        )}

        <Card>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#2E1F0E", margin: "0 0 12px", fontWeight: 700 }}>How are you feeling today?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(mood?.label === m.label ? null : m)}
                style={{ background: mood?.label === m.label ? "#F5E8CC" : "#F0E6D3", border: mood?.label === m.label ? "1.5px solid #B8873C" : "1.5px solid transparent", borderRadius: 40, padding: "6px 12px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#2E1F0E" }}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {mood && (
            <div style={{ marginTop: 14, padding: 14, background: "#F5E8CC", borderRadius: 14, borderLeft: "3px solid #B8873C" }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#4A2E12", margin: "0 0 8px", fontStyle: "italic", lineHeight: 1.6 }}>"{mood.prayer}"</p>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#7A5230", margin: "0 0 6px" }}>📖 {mood.verse} <span style={{ color: "#B8873C" }}>— {mood.ref}</span></p>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060", margin: 0 }}>{mood.note}</p>
            </div>
          )}
        </Card>

        <Card style={{ background: "linear-gradient(135deg, #F5E8CC, #F0E6D3)" }}>
          <Tag label="Scripture of the Day" color="#B8873C22" text="#4A2E12" />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#4A2E12", margin: "10px 0 6px", fontStyle: "italic", lineHeight: 1.6 }}>"{scripture.verse}"</p>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#B8873C", margin: "0 0 10px", fontWeight: 700 }}>— {scripture.ref}</p>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#7A5230", margin: 0, lineHeight: 1.6 }}>{scripture.note}</p>
        </Card>

        <Card>
          <Tag label="Today's Prayer Prompt" color="#DFF0E1" text="#6B8F71" />
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2E1F0E", margin: "10px 0 12px", lineHeight: 1.6 }}>"{prompt}"</p>
          <Btn onClick={openPrayNow} variant="ghost">Start Praying →</Btn>
        </Card>

        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#8A7060", margin: 0, fontStyle: "italic" }}>"You are a woman of discipline. You are growing spiritually. God is with you daily."</p>
        </div>
      </div>
    </div>
  );
}

function PrayScreen({ onSave }: { onSave: (text: string, title?: string, tag?: string, mode?: string) => Promise<void> }) {
  const [step, setStep] = useState("start");
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const prompt = PROMPTS[new Date().getDay()];

  async function handleAmen() {
    if (text.trim()) await onSave(text);
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#4A2E12", margin: "0 0 10px" }}>Amen.</h2>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 17, color: "#8A7060", lineHeight: 1.7, margin: "0 0 28px" }}>
          God heard every word. Whether you had a lot to say or just sat in silence — that time was sacred.
        </p>
        <Btn onClick={() => { setText(""); setStep("start"); setDone(false); }} variant="ghost">Pray again</Btn>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 18px 100px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#2E1F0E", margin: "0 0 4px" }}>Prayer Space 🕊️</h2>
      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", margin: "0 0 20px" }}>God is here. Take a breath. Start when you're ready.</p>

      {step === "start" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "guided", icon: "✨", title: "Guide me", sub: "Use today's prompt to get started", border: "#B8873C" },
            { id: "free", icon: "💬", title: "Just talk", sub: "Write freely — God is listening", border: "#E8DDD0" },
            { id: "scripture", icon: "📖", title: "Scripture-based", sub: "Pray around today's scripture", border: "#E8DDD0" },
          ].map((opt) => (
            <button key={opt.id} onClick={() => setStep(opt.id)} style={{ background: "#FFFCF7", border: `1.5px solid ${opt.border}`, borderRadius: 16, padding: 16, textAlign: "left", cursor: "pointer" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#4A2E12", fontWeight: 700, marginBottom: 4 }}>{opt.icon} {opt.title}</div>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060" }}>{opt.sub}</div>
            </button>
          ))}
        </div>
      )}

      {(step === "guided" || step === "free" || step === "scripture") && (
        <div>
          {step === "guided" && (
            <div style={{ background: "#F5E8CC", borderRadius: 14, padding: 16, marginBottom: 14, borderLeft: "3px solid #B8873C" }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#4A2E12", margin: 0, fontStyle: "italic", lineHeight: 1.7 }}>"{prompt}"</p>
            </div>
          )}
          {step === "scripture" && (
            <div style={{ background: "#F5E8CC", borderRadius: 14, padding: 16, marginBottom: 14, borderLeft: "3px solid #B8873C" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#4A2E12", margin: "0 0 6px", fontStyle: "italic" }}>"{SCRIPTURES[new Date().getDay()].verse}"</p>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#B8873C", margin: 0 }}>— {SCRIPTURES[new Date().getDay()].ref}</p>
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={step === "free" ? "Hey God... I just want to talk." : "Start praying here..."}
            style={{ width: "100%", minHeight: 200, border: "1.5px solid #E8DDD0", borderRadius: 14, padding: 16, fontFamily: "'Crimson Pro', serif", fontSize: 16, color: "#2E1F0E", background: "#FAF7F2", resize: "none", boxSizing: "border-box", lineHeight: 1.7, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Btn onClick={() => setStep("start")} variant="ghost" style={{ flex: 1 }}>← Back</Btn>
            <Btn onClick={handleAmen} style={{ flex: 2 }}>Amen 🙏</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function HandwritingModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
  
    const rect = container.getBoundingClientRect();
    const pageHeight = Math.max(rect.height, 520);
  
    canvas.width = rect.width * 2;
    canvas.height = pageHeight * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${pageHeight}px`;
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(2, 2);
  
    clearCanvas();
  }, []);
  
  function getPoint(e: any) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startDraw(e: any) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  }

  function draw(e: any) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !container) return;
  
    const rect = container.getBoundingClientRect();
    const pageHeight = rect.height || 700;
  
    ctx.fillStyle = "#FFFDF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    for (let y = 17; y < pageHeight; y += 18) {
      ctx.beginPath();
      ctx.strokeStyle = "#E8DDD0";
      ctx.lineWidth = 1;
      ctx.moveTo(0, y * 2);
      ctx.lineTo(rect.width * 2, y * 2);
      ctx.stroke();
    }
  
    ctx.beginPath();
    ctx.strokeStyle = "#EAD7D7";
    ctx.lineWidth = 1;
    ctx.moveTo(42 * 2, 0);
ctx.lineTo(42 * 2, pageHeight * 2);
    ctx.stroke();
  
    ctx.strokeStyle = "#4A2E12";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }  
  function saveCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    onSave(dataUrl);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(46,31,14,0.65)",
        zIndex: 400,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
  style={{
    background: "#FFFDF9",
    borderRadius: "24px 24px 0 0",
    width: "100%",
    maxWidth: 430,
    height: "88vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
  onClick={(e) => e.stopPropagation()}
>
        <div style={{ width: 36, height: 4, background: "#F0E6D3", borderRadius: 2, margin: "0 auto 20px" }} />

        <div
  ref={containerRef}
  style={{
    flex: 1,
    background: "#FFFDF9",
    overflow: "hidden",
  }}
>
  <canvas
    ref={canvasRef}
    onMouseDown={startDraw}
    onMouseMove={draw}
    onMouseUp={endDraw}
    onMouseLeave={endDraw}
    onTouchStart={startDraw}
    onTouchMove={draw}
    onTouchEnd={endDraw}
    style={{
      display: "block",
      width: "100%",
      height: "100%",
      background:
        "repeating-linear-gradient(to bottom, #FFFDF9 0px, #FFFDF9 17px, #E8DDD0 18px)",
      touchAction: "none",
      cursor: "crosshair",
    }}
  />
</div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn onClick={clearCanvas} variant="ghost" style={{ flex: 1 }}>
            Clear
          </Btn>
          <Btn onClick={saveCanvas} style={{ flex: 1 }}>
            Save
          </Btn>
        </div>
      </div>
    </div>
  );
}

function EntryDetailModal({
  entry,
  onClose,
  onDelete,
  onTogglePin,
  onTogglePrivate,
  onShareToCircle,
}: {
  entry: any;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePin: (id: string, current: boolean) => Promise<void>;
  onTogglePrivate: (id: string, current: boolean) => Promise<void>;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#FAF7F2", zIndex: 250, overflowY: "auto" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "20px 18px 100px" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 16, color: "#8A7060", cursor: "pointer", marginBottom: 18, padding: 0 }}>← Back</button>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
  {entry.isPinned && <Tag label="📌 Pinned" color="#F5E8CC" text="#7A5230" />}
  {entry.isPrivate && <Tag label="🔒 Private" color="#F5DEDE" text="#B87070" />}
  {entry.answered && <Tag label="✓ Answered" color="#DFF0E1" text="#6B8F71" />}
  {entry.sharedToCircle && <Tag label="👯 Shared" color="#DFF0E1" text="#6B8F71" />}
  {entry.mode === "handwriting" && <Tag label="✍🏽 Handwritten" color="#F0E6D3" text="#7A5230" />}
</div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#2E1F0E", margin: "0 0 8px", lineHeight: 1.3 }}>
          {entry.title || "Untitled Prayer"}
        </h2>

        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", marginBottom: 18 }}>
          {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>

        {entry.tags?.length ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {(Array.isArray(entry.tags) ? entry.tags : [entry.tags]).map((t: string) => (
              <Tag key={t} label={t} color="#F0E6D3" text="#7A5230" />
            ))}
          </div>
        ) : null}

        <Card style={{ marginBottom: 18 }}>
          {entry.mode === "handwriting" && entry.drawing ? (
            <img
              src={entry.drawing}
              alt="Handwritten journal entry"
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid #E8DDD0",
                background: "#FFFDF9",
              }}
            />
          ) : (
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 17, color: "#2E1F0E", lineHeight: 1.95, whiteSpace: "pre-wrap", margin: 0 }}>
              {entry.body}
            </p>
          )}
        </Card>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
  <button
    onClick={async () => await onTogglePin(entry.$id, entry.isPinned)}
    style={{ background: entry.isPinned ? "#F5E8CC" : "#F0E6D3", border: entry.isPinned ? "1.5px solid #B8873C" : "1.5px solid transparent", borderRadius: 40, padding: "8px 14px", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#2E1F0E", cursor: "pointer" }}
  >
    {entry.isPinned ? "Unpin" : "Pin prayer"}
  </button>

  <button
    onClick={async () => await onTogglePrivate(entry.$id, entry.isPrivate)}
    style={{ background: entry.isPrivate ? "#F5DEDE" : "#F0E6D3", border: entry.isPrivate ? "1.5px solid #B87070" : "1.5px solid transparent", borderRadius: 40, padding: "8px 14px", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#2E1F0E", cursor: "pointer" }}
  >
    {entry.isPrivate ? "Unlock" : "Lock private"}
  </button>

  {!entry.sharedToCircle && !entry.isPrivate && (
    <button
      onClick={async () => await onShareToCircle(entry)}
      style={{
        background: "#F0E6D3",
        border: "1.5px solid #B8873C",
        borderRadius: 40,
        padding: "8px 14px",
        fontFamily: "'Crimson Pro', serif",
        fontSize: 14,
        color: "#4A2E12",
        cursor: "pointer",
      }}
    >
      Share to Circle
    </button>
  )}

  <button
    onClick={async () => {
      if (window.confirm("Delete this entry?")) {
        await onDelete(entry.$id);
        onClose();
      }
    }}
    style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#B87070", cursor: "pointer", padding: "8px 0" }}
  >
    Delete
  </button>
</div>


        <Card>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#2E1F0E", margin: "0 0 12px" }}>Reflection</h3>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: 0, lineHeight: 1.7 }}>
            Circle comments live in the community feed, not under private journal entries.
          </p>
        </Card>
      </div>
    </div>
  );
}

function JournalScreen({
  entries,
  onSave,
  onMarkAnswered,
  onDelete,
  onTogglePin,
  onTogglePrivate,
  onShareToCircle,
}: {
  entries: any[];
  onSave: (content: string, title: string, tag: string, mode?: string) => Promise<void>;
  onMarkAnswered: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePin: (id: string, current: boolean) => Promise<void>;
  onTogglePrivate: (id: string, current: boolean) => Promise<void>;
  onShareToCircle: (entry: any) => Promise<void>;
}) {
  const [writing, setWriting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTag, setNewTag] = useState("faith");
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [handwritingOpen, setHandwritingOpen] = useState(false);
  const [drawingData, setDrawingData] = useState("");

  async function save() {
    if (!newBody.trim() && !drawingData) return;

    if (drawingData) {
      await onSave(drawingData, newTitle, newTag, "handwriting");
    } else {
      await onSave(newBody, newTitle, newTag, "text");
    }

    setNewTitle("");
    setNewBody("");
    setDrawingData("");
    setWriting(false);
    setHandwritingOpen(false);
  }

  return (
    <>
      <div style={{ padding: "24px 18px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#2E1F0E", margin: 0 }}>Prayer Journal 📖</h2>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: "4px 0 0" }}>Watch God move over time.</p>
          </div>

          <button onClick={() => setWriting(!writing)} style={{ background: writing ? "#F0E6D3" : "linear-gradient(135deg, #B8873C, #D4A855)", border: "none", borderRadius: 40, padding: "8px 16px", color: "#FFFDF9", fontFamily: "'Crimson Pro', serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {writing ? "Cancel" : "+ New"}
          </button>
        </div>

        {writing && (
          <Card style={{ marginBottom: 16 }}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Give this prayer a title..." style={{ width: "100%", border: "none", borderBottom: "1px solid #E8DDD0", background: "transparent", fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2E1F0E", padding: "0 0 10px", marginBottom: 12, outline: "none", boxSizing: "border-box" }} />

            {!drawingData ? (
              <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="Write your prayer..." style={{ width: "100%", minHeight: 120, border: "1px solid #E8DDD0", borderRadius: 10, padding: 12, fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#2E1F0E", background: "#FAF7F2", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.7 }} />
            ) : (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={drawingData}
                  alt="Handwritten preview"
                  style={{ width: "100%", borderRadius: 12, border: "1px solid #E8DDD0", background: "#FFFDF9" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["faith", "healing", "family", "finances", "patience"].map((t) => (
                <button key={t} onClick={() => setNewTag(t)} style={{ background: newTag === t ? "#F5E8CC" : "#F0E6D3", border: newTag === t ? "1.5px solid #B8873C" : "1.5px solid transparent", borderRadius: 40, padding: "4px 12px", fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#2E1F0E", cursor: "pointer" }}>{t}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Btn onClick={save} style={{ flex: 2 }}>Save Entry</Btn>
              <Btn onClick={() => setHandwritingOpen(true)} variant="outline" style={{ flex: 1 }}>✍🏽 Write</Btn>
            </div>
          </Card>
        )}

        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060" }}>✅ {entries.filter((e) => e.answered).length} answered prayers · 📝 {entries.length} total</span>
        </div>

        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#8A7060" }}>No entries yet.</p>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", marginTop: 6 }}>Your first prayer is waiting to be written. 🤍</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map((entry) => (
            <Card key={entry.$id} onClick={() => setSelectedEntry(entry)} style={{ borderLeft: entry.answered ? "3px solid #6B8F71" : "3px solid #B8873C", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
  <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#8A7060" }}>{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
  {entry.answered && <Tag label="✓ Answered" color="#DFF0E1" text="#6B8F71" />}
  {entry.isPinned && <Tag label="📌 Pinned" color="#F5E8CC" text="#7A5230" />}
  {entry.isPrivate && <Tag label="🔒 Private" color="#F5DEDE" text="#B87070" />}
  {entry.sharedToCircle && <Tag label="👯 Shared" color="#DFF0E1" text="#6B8F71" />}
  {entry.mode === "handwriting" && <Tag label="✍🏽 Handwritten" color="#F0E6D3" text="#7A5230" />}
</div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {!entry.answered && (
                    <button onClick={(e) => { e.stopPropagation(); onMarkAnswered(entry.$id); }} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#8A7060", cursor: "pointer", padding: 0 }}>
                      Mark answered
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onTogglePin(entry.$id, !!entry.isPinned); }} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: entry.isPinned ? "#B8873C" : "#8A7060", cursor: "pointer", padding: 0 }}>
                    {entry.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onTogglePrivate(entry.$id, !!entry.isPrivate); }} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: entry.isPrivate ? "#6B8F71" : "#8A7060", cursor: "pointer", padding: 0 }}>
                    {entry.isPrivate ? "Unlock" : "Lock"}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this entry?")) onDelete(entry.$id); }} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#B87070", cursor: "pointer", padding: 0 }}>
                    Delete
                  </button>
                </div>
              </div>

              {entry.title ? <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2E1F0E", margin: "0 0 6px" }}>{entry.title}</h3> : null}

              {entry.mode === "handwriting" && entry.drawing ? (
                <div style={{ margin: "0 0 10px" }}>
                  <img
                    src={entry.drawing}
                    alt="Handwritten journal entry"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid #E8DDD0",
                      background: "#FFFDF9",
                    }}
                  />
                </div>
              ) : (
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: "0 0 10px", lineHeight: 1.6 }}>
                  {entry.body.length > 120 ? entry.body.slice(0, 120) + "..." : entry.body}
                </p>
              )}

              {entry.tags && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(Array.isArray(entry.tags) ? entry.tags : [entry.tags]).map((t: string) => (
                    <Tag key={t} label={t} color="#F0E6D3" text="#7A5230" />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {handwritingOpen && (
        <HandwritingModal
          onClose={() => setHandwritingOpen(false)}
          onSave={(dataUrl) => {
            setDrawingData(dataUrl);
            setHandwritingOpen(false);
            setWriting(true);
          }}
        />
      )}

{selectedEntry && (
  <EntryDetailModal
    entry={selectedEntry}
    onClose={() => setSelectedEntry(null)}
    onDelete={onDelete}
    onTogglePin={onTogglePin}
    onTogglePrivate={onTogglePrivate}
    onShareToCircle={onShareToCircle}
  />
)}

    </>
  );
} function TracksScreen() {
  const [active, setActive] = useState<any>(null);

  return (
    <div style={{ padding: "24px 18px 100px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#2E1F0E", margin: "0 0 4px" }}>Growth Tracks 🌿</h2>
      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", margin: "0 0 20px" }}>Choose your journey. God will meet you there.</p>
      {active && (
        <div style={{ background: "linear-gradient(135deg, #4A2E12, #7A5230)", borderRadius: 18, padding: 18, marginBottom: 16 }}>
          <Tag label="Active Track" color="rgba(255,255,255,0.15)" text="#D4A855" />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#FFFDF9", margin: "8px 0 4px" }}>{active.icon} {active.title}</h3>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>{active.desc}</p>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, height: 6, marginBottom: 12 }}>
            <div style={{ width: "35%", height: "100%", background: "#D4A855", borderRadius: 8 }} />
          </div>
          <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#D4A855" }}>Day 7 of {active.days} · Keep going 🔥</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRACKS.map((track) => (
          <button
            key={track.title}
            onClick={() => setActive(track)}
            style={{
              background: active?.title === track.title ? track.color : "#FFFCF7",
              border: active?.title === track.title ? `2px solid ${track.accent}` : "1.5px solid #E8DDD0",
              borderRadius: 16,
              padding: 16,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ fontSize: 32 }}>{track.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2E1F0E", fontWeight: 700, marginBottom: 2 }}>{track.title}</div>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060", marginBottom: 6 }}>{track.desc}</div>
              <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: 12, color: track.accent }}>{track.days}-day journey</span>
            </div>
            {active?.title === track.title && <span style={{ color: track.accent, fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function CommunityScreen({ user, databases, DATABASE_ID }: { user: any; databases: any; DATABASE_ID: string }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [postTag, setPostTag] = useState("Prayer Request");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

  useEffect(() => {
    ensureProfileAndLoad();
  }, [user?.$id]);

  async function ensureProfileAndLoad() {
    if (!user?.$id) return;
    setLoading(true);
    try {
      await ensureProfile();
      await loadCommunity();
    } finally {
      setLoading(false);
    }
  }

  async function ensureProfile() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID);
      const existing = res.documents.find((doc: any) => doc.userId === user.$id);
      if (!existing) {
        await databases.createDocument(DATABASE_ID, PROFILES_COLLECTION_ID, ID.unique(), {
          userId: user.$id,
          displayName,
          initials,
          bio: "",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCommunity() {
    try {
      const [postsRes, commentsRes, agreementsRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COMMUNITY_POSTS_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, COMMUNITY_COMMENTS_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, PRAYER_AGREEMENTS_COLLECTION_ID),
      ]);

      const livePosts = postsRes.documents
        .filter((doc: any) => !doc.isArchived)
        .sort((a: any, b: any) => new Date(b.date || b.createdAt || b.$createdAt).getTime() - new Date(a.date || a.createdAt || a.$createdAt).getTime());

      const liveComments = commentsRes.documents
        .sort((a: any, b: any) => new Date(a.date || a.$createdAt).getTime() - new Date(b.date || b.$createdAt).getTime());

      setPosts(livePosts);
      setComments(liveComments);
      setAgreements(agreementsRes.documents);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitPost() {
    if (!newPost.trim()) return;
    try {
      await databases.createDocument(DATABASE_ID, COMMUNITY_POSTS_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        displayName,
        initials,
        tag: postTag,
        text: newPost.trim(),
        hearts: 0,
        createdAt: new Date().toISOString(),
        isAnonymous: false,
        isArchived: false,
        date: new Date().toISOString(),
        pinned: false,
      });
      setNewPost("");
      setWriting(false);
      await loadCommunity();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || JSON.stringify(err) || "Post save failed");
    }
  }

  async function submitComment(postId: string) {
    const body = (commentDrafts[postId] || "").trim();
    if (!body) return;
    try {
      await databases.createDocument(DATABASE_ID, COMMUNITY_COMMENTS_COLLECTION_ID, ID.unique(), {
        postId,
        userId: user.$id,
        displayName,
        body,
        date: new Date().toISOString(),
        initials,
      });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      setOpenComments((prev) => ({ ...prev, [postId]: true }));
      await loadCommunity();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || JSON.stringify(err) || "Comment save failed");
    }
  }

  function agreementsForPost(postId: string) {
    return agreements.filter((a) => a.postId === postId);
  }

  function commentsForPost(postId: string) {
    return comments.filter((c) => c.postId === postId);
  }

  async function toggleAgreement(post: any) {
    const existing = agreements.find((a) => a.postId === post.$id && a.userId === user.$id);
    try {
      if (existing) {
        await databases.deleteDocument(DATABASE_ID, PRAYER_AGREEMENTS_COLLECTION_ID, existing.$id);
      } else {
        await databases.createDocument(DATABASE_ID, PRAYER_AGREEMENTS_COLLECTION_ID, ID.unique(), {
          postId: post.$id,
          userId: user.$id,
          createdAt: new Date().toISOString(),
        });
      }
      await loadCommunity();
    } catch (err) {
      console.error(err);
      alert("Prayer agreement didn’t save.");
    }
  }

  const userAgreementSet = useMemo(() => {
    return new Set(
      agreements
        .filter((a) => a.userId === user?.$id)
        .map((a) => a.postId)
    );
  }, [agreements, user?.$id]);

  return (
    <div style={{ padding: "24px 18px 100px" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#2E1F0E", margin: "0 0 2px" }}>Your Circle 👯‍♀️</h2>
      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: "0 0 16px" }}>Safe space. No performance. Just real women growing.</p>

      <div style={{ background: "#F0E6D3", borderRadius: 14, padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🤝</span>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#4A2E12", fontWeight: 700 }}>Circle Status: Live</div>
          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060" }}>Real posts, real comments, real prayer agreements.</div>
        </div>
        <span style={{ marginLeft: "auto", background: "#DFF0E1", borderRadius: 20, padding: "4px 10px", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#6B8F71" }}>Active ✓</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#2E1F0E", fontWeight: 700 }}>Circle Feed</span>
        <button onClick={() => setWriting(!writing)} style={{ background: writing ? "#F0E6D3" : "linear-gradient(135deg, #B8873C, #D4A855)", border: "none", borderRadius: 40, padding: "7px 14px", color: "#FFFDF9", fontFamily: "'Crimson Pro', serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {writing ? "Cancel" : "+ Share"}
        </button>
      </div>

      {writing && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {["Prayer Request", "Testimony", "Win"].map((t) => (
              <button key={t} onClick={() => setPostTag(t)} style={{ background: postTag === t ? "#F5E8CC" : "#F0E6D3", border: postTag === t ? "1.5px solid #B8873C" : "1.5px solid transparent", borderRadius: 40, padding: "4px 12px", fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#2E1F0E", cursor: "pointer" }}>{t}</button>
            ))}
          </div>

          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Share with your circle..." style={{ width: "100%", minHeight: 100, border: "1px solid #E8DDD0", borderRadius: 10, padding: 12, fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#2E1F0E", background: "#FAF7F2", resize: "none", outline: "none", boxSizing: "border-box" }} />
          <Btn onClick={submitPost} style={{ marginTop: 10 }}>Share 💛</Btn>
        </Card>
      )}

      {loading && <Card><p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", margin: 0 }}>Loading your Circle...</p></Card>}

      {!loading && posts.length === 0 && (
        <Card>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#8A7060", margin: "0 0 6px" }}>No Circle posts yet.</p>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#8A7060", margin: 0 }}>Be the first woman to share something meaningful today. 🤍</p>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((post) => {
          const postComments = commentsForPost(post.$id);
          const agreementCount = agreementsForPost(post.$id).length;
          const userAgreed = userAgreementSet.has(post.$id);

          return (
            <Card key={post.$id}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #B8873C, #7A5230)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#FFFDF9", fontWeight: 700, flexShrink: 0 }}>
                  {post.initials || getInitials(post.displayName || "Sis")}
                </div>

                <div>
                  <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#8A7060" }}>
                    {post.displayName || "Sis"} · {new Date(post.date || post.createdAt || post.$createdAt).toLocaleDateString()}
                  </div>

                  <Tag
                    label={post.tag}
                    color={post.tag === "Testimony" ? "#DFF0E1" : post.tag === "Win" ? "#F5E8CC" : "#F5DEDE"}
                    text={post.tag === "Testimony" ? "#6B8F71" : post.tag === "Win" ? "#7A5230" : "#B87070"}
                  />
                </div>
              </div>

              {post.title ? (
  <h3
    style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: 18,
      color: "#2E1F0E",
      margin: "0 0 8px",
    }}
  >
    {post.title}
  </h3>
) : null}

{post.mode === "handwriting" && post.drawing ? (
  <div style={{ margin: "0 0 12px" }}>
    <img
      src={post.drawing}
      alt="Shared handwritten prayer"
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid #E8DDD0",
        background: "#FFFDF9",
      }}
    />
  </div>
) : (
  <p
    style={{
      fontFamily: "'Crimson Pro', serif",
      fontSize: 15,
      color: "#2E1F0E",
      margin: "0 0 12px",
      lineHeight: 1.7,
    }}
  >
    {post.text}
  </p>
)}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                <button onClick={() => toggleAgreement(post)} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: userAgreed ? "#B87070" : "#8A7060", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  {userAgreed ? "❤️" : "🤍"} {agreementCount} agreeing in prayer
                </button>

                <button onClick={() => setOpenComments((prev) => ({ ...prev, [post.$id]: !prev[post.$id] }))} style={{ background: "none", border: "none", fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", cursor: "pointer", padding: 0 }}>
                  💬 {postComments.length} comments
                </button>
              </div>

              {openComments[post.$id] && (
                <div style={{ borderTop: "1px solid #E8DDD0", paddingTop: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
                    {postComments.length === 0 ? (
                      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: 0 }}>No comments yet. Be the first to encourage her. 💛</p>
                    ) : (
                      postComments.map((comment) => (
                        <div key={comment.$id} style={{ background: "#FAF7F2", border: "1px solid #E8DDD0", borderRadius: 12, padding: 10 }}>
                          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#8A7060", marginBottom: 4 }}>
                            {comment.displayName || "Sis"} · {new Date(comment.date || comment.$createdAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#2E1F0E", lineHeight: 1.7 }}>
                            {comment.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <textarea
                    value={commentDrafts[post.$id] || ""}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.$id]: e.target.value }))}
                    placeholder="Add encouragement, prayer, or support..."
                    style={{ width: "100%", minHeight: 82, border: "1px solid #E8DDD0", borderRadius: 10, padding: 12, fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#2E1F0E", background: "#FAF7F2", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                  />

                  <Btn onClick={() => submitComment(post.$id)} variant="ghost">Post Comment</Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PrayNowModal({ onClose, onSave }: { onClose: () => void; onSave: (text: string, title?: string, tag?: string, mode?: string) => Promise<void>; }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  async function handleAmen() {
    if (text.trim()) await onSave(text);
    setDone(true);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(46,31,14,0.65)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#FFFDF9", borderRadius: "24px 24px 0 0", padding: "24px 20px 48px", width: "100%", maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: "#F0E6D3", borderRadius: 2, margin: "0 auto 20px" }} />

        {!done ? (
          <>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#4A2E12", margin: "0 0 6px" }}>Pray Now 🙏</h2>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, color: "#8A7060", margin: "0 0 14px" }}>God is here. Take a breath.</p>
            <div style={{ background: "#F5E8CC", borderRadius: 12, padding: 14, marginBottom: 14, borderLeft: "3px solid #B8873C" }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#4A2E12", margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>"{prompt}"</p>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Start praying... or just sit. Both count. 🤍" style={{ width: "100%", minHeight: 130, border: "1.5px solid #E8DDD0", borderRadius: 12, padding: 14, fontFamily: "'Crimson Pro', serif", fontSize: 15, color: "#2E1F0E", background: "#FAF7F2", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.7 }} />
            <Btn onClick={handleAmen} style={{ marginTop: 12 }}>Amen 🙏</Btn>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#4A2E12", margin: "0 0 8px" }}>Amen.</h3>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 16, color: "#8A7060", lineHeight: 1.7, margin: "0 0 20px" }}>God heard every word. That time was sacred.</p>
            <Btn onClick={onClose}>Done</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "pray", icon: "🕊️", label: "Pray" },
    { id: "journal", icon: "📖", label: "Journal" },
    { id: "tracks", icon: "🌿", label: "Tracks" },
    { id: "community", icon: "👯‍♀️", label: "Circle" },
  ];

  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#FFFDF9", borderTop: "1px solid #E8DDD0", display: "flex", zIndex: 100, paddingBottom: 12 }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", padding: "10px 0 2px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 19 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontFamily: "'Crimson Pro', serif", color: tab === t.id ? "#B8873C" : "#8A7060", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          {tab === t.id && <div style={{ width: 18, height: 2, background: "#B8873C", borderRadius: 2 }} />}
        </button>
      ))}
    </nav>
  );
}

export default function PrayherShell({
  user,
  streak,
  onCheckIn,
  onLogout,
  databases,
  DATABASE_ID,
  JOURNAL_COLLECTION_ID,
}: any) {
  const [tab, setTab] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (user?.$id) loadEntries();
  }, [user?.$id]);

  async function loadEntries() {
    try {
      const res = await databases.listDocuments(DATABASE_ID, JOURNAL_COLLECTION_ID);
      const userEntries = res.documents
        .filter((doc: any) => doc.userId === user.$id)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(userEntries);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function saveEntry(content: string, title: string = "", tag: string = "faith", mode: string = "text") {
    try {
      await databases.createDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        body: mode === "text" ? content : "",
        title: title || "",
        tags: tag,
        answered: false,
        date: new Date().toISOString(),
        isPinned: false,
        isPrivate: false,
        sharedToCircle: false,
        mode,
        drawing: mode === "handwriting" ? content : "",
      });

      await onCheckIn();
      await loadEntries();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || JSON.stringify(err) || "Journal save failed");
    }
  }

  async function markAnswered(id: string) {
    try {
      await databases.updateDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, id, { answered: true });
      await loadEntries();
    } catch (err: any) {
      console.error(err.message);
    }
  }

  async function togglePin(id: string, current: boolean) {
    try {
      await databases.updateDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, id, { isPinned: !current });
      await loadEntries();
    } catch (err: any) {
      console.error(err.message);
    }
  }

  async function togglePrivate(id: string, current: boolean) {
    try {
      await databases.updateDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, id, { isPrivate: !current });
      await loadEntries();
    } catch (err: any) {
      console.error(err.message);
    }
  }

  async function deleteEntry(id: string) {
    try {
      await databases.deleteDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, id);
      await loadEntries();
    } catch (err: any) {
      console.error(err.message);
    }
  }
  async function shareEntryToCircle(entry: any) {
    try {
      const displayName = getDisplayName(user);
      const initials = getInitials(displayName);
  
      await databases.createDocument(DATABASE_ID, COMMUNITY_POSTS_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        displayName,
        initials,
        tag: "Prayer Request",
        title: entry.title || "",
        text: entry.mode === "handwriting"
          ? ""
          : (entry.title ? `${entry.title}\n\n${entry.body}` : entry.body),
        mode: entry.mode || "text",
        drawing: entry.mode === "handwriting" ? (entry.drawing || "") : "",
        hearts: 0,
        createdAt: new Date().toISOString(),
        isAnonymous: false,
        isArchived: false,
        date: new Date().toISOString(),
        pinned: false,
      });
  
      await databases.updateDocument(DATABASE_ID, JOURNAL_COLLECTION_ID, entry.$id, {
        sharedToCircle: true,
      });
  
      await loadEntries();
      alert("Shared to Circle 💛");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || JSON.stringify(err) || "Share to Circle failed");
    }
  }
  
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #FAF7F2; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FAF7F2", position: "relative", overflowX: "hidden" }}>
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 50, background: "#FAF7F2", borderBottom: "1px solid #E8DDD0", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#4A2E12", fontWeight: 700 }}>Pray<span style={{ color: "#B8873C" }}>her</span></span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setShowModal(true)} style={{ background: "linear-gradient(135deg, #B8873C, #D4A855)", border: "none", borderRadius: 40, padding: "6px 14px", fontFamily: "'Crimson Pro', serif", fontSize: 13, color: "#FFFDF9", fontWeight: 700, cursor: "pointer" }}>🙏 Pray Now</button>
            <button onClick={onLogout} style={{ background: "none", border: "1px solid #E8DDD0", borderRadius: 40, padding: "6px 12px", fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#8A7060", cursor: "pointer" }}>Logout</button>
          </div>
        </div>

        <div style={{ paddingTop: 52 }}>
          {tab === "home" && <HomeScreen streak={streak} onCheckIn={onCheckIn} openPrayNow={() => setShowModal(true)} />}
          {tab === "pray" && <PrayScreen onSave={saveEntry} />}
          {tab === "journal" && (
  <JournalScreen
    entries={entries}
    onSave={saveEntry}
    onMarkAnswered={markAnswered}
    onDelete={deleteEntry}
    onTogglePin={togglePin}
    onTogglePrivate={togglePrivate}
    onShareToCircle={shareEntryToCircle}
  />
)}
          {tab === "tracks" && <TracksScreen />}
          {tab === "community" && <CommunityScreen user={user} databases={databases} DATABASE_ID={DATABASE_ID} />}
        </div>

        <Nav tab={tab} setTab={setTab} />
        {showModal && <PrayNowModal onClose={() => setShowModal(false)} onSave={saveEntry} />}
      </div>
    </>
  );
}
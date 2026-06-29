import { useState, useEffect, useRef, useCallback } from "react";

// ─── WHATSAPP NUMBER ──────────────────────────────────────────────────────────
const WA_NUMBER = "919579239700";

// ─── Send lead to WhatsApp ────────────────────────────────────────────────────
function sendToWhatsApp(data) {
  const msg = `🔔 *New Lead - A V Technology Website*\n\n👤 *Name:* ${data.name}\n📧 *Email:* ${data.email || "—"}\n📱 *Phone:* ${data.phone}\n🛠️ *Service:* ${data.service}\n💬 *Message:* ${data.message || "—"}\n\n⏰ ${new Date().toLocaleString("en-IN")}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ─── clamp ────────────────────────────────────────────────────────────────────
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

// ─── useTilt ──────────────────────────────────────────────────────────────────
function useTilt(strength = 10) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${clamp(-y * strength, -strength, strength)}deg) rotateY(${clamp(x * strength, -strength, strength)}deg) scale3d(1.025,1.025,1.025)`;
    el.style.transition = "transform 0.05s linear";
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.5s ease";
  }, []);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [onMove, onLeave]);
  return ref;
}

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

// ─── AnimCounter ──────────────────────────────────────────────────────────────
function AnimCounter({ end, suffix = "", dur = 1800 }) {
  const [n, setN] = useState(0);
  const [ref, vis] = useInView(0.5);
  useEffect(() => {
    if (!vis) return;
    let cur = 0; const step = end / (dur / 16);
    const t = setInterval(() => { cur += step; if (cur >= end) { setN(end); clearInterval(t); } else setN(Math.floor(cur)); }, 16);
    return () => clearInterval(t);
  }, [vis, end, dur]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

// ─── Contact Modal ────────────────────────────────────────────────────────────
function ContactModal({ open, onClose, defaultService = "" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: defaultService, message: "" });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (open) { setForm(f => ({ ...f, service: defaultService })); setSent(false); setErrors({}); } }, [open, defaultService]);
  useEffect(() => { const fn = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn); }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.service) e.service = "Select a service";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    sendToWhatsApp(form);
    setSent(true);
  };

  if (!open) return null;

  const inp = (field, placeholder, type = "text") => ({
    value: form[field],
    onChange: e => setForm(f => ({ ...f, [field]: e.target.value })),
    placeholder,
    type,
    style: {
      width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
      border: `1.5px solid ${errors[field] ? "#ef4444" : "#e2e8f0"}`,
      background: "#f8fafc", color: "#1e293b", fontSize: 14,
      fontFamily: "'Inter',sans-serif", outline: "none", transition: "border 0.2s",
    },
    onFocus: e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; },
    onBlur: e => { e.target.style.borderColor = errors[field] ? "#ef4444" : "#e2e8f0"; e.target.style.background = "#f8fafc"; },
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 24, padding: "40px 36px",
        width: "100%", maxWidth: 520, boxShadow: "0 25px 80px rgba(99,102,241,0.18)",
        animation: "popIn 0.3s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%",
          border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: 18, color: "#64748b",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>Lead Sent to WhatsApp!</h3>
            <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your details have been sent to our WhatsApp. We'll respond within 2 hours.
            </p>
            <button onClick={onClose} style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif",
            }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "linear-gradient(135deg,#ede9fe,#fce7f3)", borderRadius: 100,
                padding: "4px 12px", marginBottom: 12,
              }}>
                <span style={{ fontSize: 12 }}>✉️</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em" }}>GET A FREE QUOTE</span>
              </div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>Request a Callback</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Fill in your details — we'll WhatsApp you within 2 hours.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input {...inp("name", "Full Name *")} />
                {errors.name && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, fontFamily: "'Inter',sans-serif" }}>{errors.name}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input {...inp("phone", "Phone / WhatsApp *", "tel")} />
                <input {...inp("email", "Email (optional)", "email")} />
              </div>
              {errors.phone && <p style={{ color: "#ef4444", fontSize: 11, marginTop: -8, fontFamily: "'Inter',sans-serif" }}>{errors.phone}</p>}
              <div>
                <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                  border: `1.5px solid ${errors.service ? "#ef4444" : "#e2e8f0"}`,
                  background: "#f8fafc", color: form.service ? "#1e293b" : "#94a3b8",
                  fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer",
                }}>
                  <option value="" disabled>Select a Service *</option>
                  <option>Billing / ERP Software</option>
                  <option>WhatsApp Marketing Software</option>
                  <option>Barcode / Billing Printers</option>
                  <option>Barcode / Billing Rolls</option>
                  <option>Complete Bundle</option>
                </select>
                {errors.service && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, fontFamily: "'Inter',sans-serif" }}>{errors.service}</p>}
              </div>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe your requirement (optional)" rows={3}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                  border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#1e293b",
                  fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", resize: "vertical",
                }}
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
              />
              <button onClick={handleSubmit} style={{
                padding: "13px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter',sans-serif", boxShadow: "0 6px 24px rgba(99,102,241,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(99,102,241,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.35)"; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Send via WhatsApp & Get Quote
              </button>
              <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94a3b8" }}>
                🔒 Your details are sent directly and securely to our WhatsApp
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ openModal }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  const links = ["Home", "Products", "Software", "About", "Contact"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
      boxShadow: scrolled ? "0 2px 20px rgba(99,102,241,0.08)" : "none",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: "#1e293b", letterSpacing: "-0.5px" }}>
            A V <span style={{ color: "#6366f1" }}>Technology</span>
          </span>
        </div>
        {/* Desktop nav */}
        <div style={{ display: "flex", gap: "2rem" }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 500,
              color: "#475569", textDecoration: "none", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#6366f1"}
              onMouseLeave={e => e.target.style.color = "#475569"}
            >{l}</a>
          ))}
        </div>
        {/* CTA */}
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" style={{
            padding: "8px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0",
            background: "transparent", color: "#475569", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter',sans-serif", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#25d366"; e.currentTarget.style.color = "#16a34a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </a>
          <button onClick={() => openModal("")} style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Inter',sans-serif",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(99,102,241,0.3)"; }}
          >Get Free Quote →</button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ openModal }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const fn = e => setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <section id="home" style={{
      minHeight: "100vh", position: "relative", display: "flex", alignItems: "center",
      justifyContent: "center", overflow: "hidden",
      background: "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 35%,#fff1f5 65%,#f0fdf4 100%)",
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", top: "-10%", right: "-15%", filter: "blur(40px)", transform: `translate(${mouse.x * 25}px,${mouse.y * 25}px)`, transition: "transform 0.5s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)", bottom: "-5%", left: "-10%", filter: "blur(40px)", transform: `translate(${-mouse.x * 20}px,${-mouse.y * 20}px)`, transition: "transform 0.5s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)", bottom: "20%", right: "20%", filter: "blur(30px)", pointerEvents: "none" }} />

      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 880, padding: "100px 2rem 60px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,#ede9fe,#fce7f3)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 100, padding: "6px 18px", marginBottom: 28,
          animation: "fadeUp 0.7s ease both",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", display: "inline-block", boxShadow: "0 0 8px rgba(99,102,241,0.6)" }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#7c3aed", fontWeight: 700, letterSpacing: "0.08em" }}>NEXT-GEN BUSINESS AUTOMATION</span>
        </div>

        <h1 style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: "clamp(2.6rem,6vw,5rem)",
          fontWeight: 800, color: "#0f172a", lineHeight: 1.08,
          letterSpacing: "-2px", marginBottom: 22,
          animation: "fadeUp 0.75s ease 0.08s both",
        }}>
          Complete Automation,<br />
          <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Billing & Marketing
          </span>
          <br />Solutions
        </h1>

        <p style={{
          fontFamily: "'Inter',sans-serif", fontSize: "clamp(1rem,1.8vw,1.15rem)",
          color: "#64748b", maxWidth: 580, margin: "0 auto 36px",
          lineHeight: 1.75, animation: "fadeUp 0.75s ease 0.15s both",
        }}>
          Empower your business with enterprise billing software, barcode hardware, WhatsApp marketing, and end-to-end ERP — all from one trusted partner.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.75s ease 0.22s both" }}>
          <button onClick={() => openModal("")} style={{
            padding: "13px 30px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 8px 28px rgba(99,102,241,0.35)",
            fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.35)"; }}
          >
            Get Free Quote →
          </button>
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'd like to know more about A V Technology solutions.")}`} target="_blank" rel="noreferrer" style={{
            padding: "13px 30px", borderRadius: 10,
            border: "1.5px solid #e2e8f0", background: "#fff",
            color: "#1e293b", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter',sans-serif", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#25d366"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(37,211,102,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Chat on WhatsApp
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 48, justifyContent: "center", marginTop: 64,
          paddingTop: 48, borderTop: "1px solid #e2e8f0",
          animation: "fadeUp 0.75s ease 0.3s both", flexWrap: "wrap",
        }}>
          {[{ v: 5000, s: "+", l: "Active Clients" }, { v: 99, s: "%", l: "Uptime SLA" }, { v: 12, s: "+", l: "Years Experience" }, { v: 24, s: "/7", l: "Support" }].map(st => (
            <div key={st.l} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3vw,2.4rem)",
                fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}><AnimCounter end={st.v} suffix={st.s} /></div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#94a3b8", marginTop: 4, letterSpacing: "0.04em" }}>{st.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "🖨️", title: "Barcode & Billing Printers", desc: "Industrial thermal and laser printers with Wi-Fi, USB, Bluetooth. From desktop to warehouse-scale.", color: "#6366f1", light: "#ede9fe", features: ["Thermal & Laser", "Wi-Fi + USB + BT", "Driver Portal", "Bulk Deals"], service: "Barcode / Billing Printers" },
  { icon: "🏷️", title: "Barcode & Billing Rolls", desc: "Thermal paper, semi-gloss, chromo labels in every size. Bulk ordering with volume discount tiers.", color: "#8b5cf6", light: "#f5f3ff", features: ["All Materials", "Custom Sizes", "Volume Discounts", "Fast Delivery"], service: "Barcode / Billing Rolls" },
  { icon: "💼", title: "Billing / ERP System", desc: "Full ERP: inventory, GST billing, accounts, purchase orders, and real-time analytics in one app.", color: "#ec4899", light: "#fdf2f8", features: ["GST Ready", "Multi-Branch", "Cloud Sync", "AI Reports"], service: "Billing / ERP Software" },
  { icon: "💬", title: "WhatsApp Marketing", desc: "Bulk campaigns with smart delays, auto-responders, Excel contact import, and anti-ban protection.", color: "#10b981", light: "#f0fdf4", features: ["Bulk Messaging", "Anti-Ban Technology", "Auto-Responder", "Excel Import"], service: "WhatsApp Marketing Software" },
];

function ServicesSection({ openModal }) {
  const [ref, vis] = useInView(0.08);
  return (
    <section id="products" ref={ref} style={{ padding: "100px 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>CORE SOLUTIONS</span>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", margin: "0 0 14px" }}>Built for Modern Business</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>Four integrated product lines covering every operational need.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 22 }}>
          {SERVICES.map((s, i) => {
            const tref = useTilt(10);
            return (
              <div key={s.title} ref={tref} style={{
                background: "#fff", border: "1.5px solid #f1f5f9",
                borderRadius: 20, padding: 28, cursor: "default",
                boxShadow: "0 4px 24px rgba(99,102,241,0.06)",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px)",
                transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`,
                willChange: "transform",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 40px ${s.color}20`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(99,102,241,0.06)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: s.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{s.icon}</div>
                  <span style={{ background: s.light, color: s.color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, fontFamily: "'Inter',sans-serif", letterSpacing: "0.08em" }}>EXPLORE</span>
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: "0 0 18px" }}>{s.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
                  {s.features.map(f => (
                    <span key={f} style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, color: s.color, background: s.light, borderRadius: 6, padding: "3px 9px" }}>{f}</span>
                  ))}
                </div>
                <button onClick={() => openModal(s.service)} style={{
                  width: "100%", padding: "10px", borderRadius: 9, border: `1.5px solid ${s.color}30`,
                  background: s.light, color: s.color, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.25s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.boxShadow = `0 6px 20px ${s.color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = s.light; e.currentTarget.style.color = s.color; e.currentTarget.style.boxShadow = "none"; }}
                >Get Quote for This →</button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  {
    label: "ERP System", icon: "💼",
    heading: "Enterprise Billing & ERP",
    body: "Manage your entire business from one dashboard. GST-compliant invoicing, real-time inventory, multi-branch support, purchase orders, and AI-powered analytics.",
    points: ["GST & e-Invoice Ready", "Real-time Inventory", "Multi-Branch", "AI Analytics", "Customer Ledger", "Automated Reminders"],
    color: "#6366f1", light: "#ede9fe", service: "Billing / ERP Software",
  },
  {
    label: "WhatsApp CRM", icon: "💬",
    heading: "WhatsApp Marketing Suite",
    body: "Scale your outreach with intelligent bulk messaging. Import contacts from Excel, set smart delay intervals, prevent bans, and automate responses.",
    points: ["Bulk Messaging Engine", "Anti-Ban Smart Delays", "Excel Import", "Auto-Responder Flows", "Campaign Analytics", "Media & PDF Sending"],
    color: "#10b981", light: "#f0fdf4", service: "WhatsApp Marketing Software",
  },
  {
    label: "Hardware", icon: "🖨️",
    heading: "Barcode & Printing Hardware",
    body: "From compact desktop label printers to industrial barcode scanners — supply, configure, and support the full hardware stack.",
    points: ["Thermal & Laser", "Wi-Fi / USB / BT", "Compatibility Matrix", "Driver Portal", "On-site Setup", "Annual Maintenance"],
    color: "#8b5cf6", light: "#f5f3ff", service: "Barcode / Billing Printers",
  },
];

function FeatureTabs({ openModal }) {
  const [active, setActive] = useState(0);
  const [ref, vis] = useInView(0.1);
  const t = TABS[active];
  return (
    <section id="software" ref={ref} style={{ padding: "100px 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", margin: 0 }}>
            Deep Dive Into <span style={{ color: "#6366f1" }}>What We Build</span>
          </h2>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48, background: "#fff", padding: 6, borderRadius: 14, border: "1.5px solid #e2e8f0", width: "fit-content", margin: "0 auto 48px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          {TABS.map((tb, i) => (
            <button key={tb.label} onClick={() => setActive(i)} style={{
              padding: "9px 22px", borderRadius: 10, border: "none",
              background: active === i ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
              color: active === i ? "#fff" : "#64748b",
              fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: active === i ? "0 4px 14px rgba(99,102,241,0.35)" : "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>{tb.icon} {tb.label}</button>
          ))}
        </div>
        {/* Content */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div>
            <div style={{ display: "inline-block", background: t.light, color: t.color, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 18, fontFamily: "'Inter',sans-serif" }}>FEATURED</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.5rem,2.5vw,2.2rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px", letterSpacing: "-0.5px" }}>{t.heading}</h3>
            <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{t.body}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {t.points.map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </div>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#475569" }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => openModal(t.service)} style={{
                padding: "11px 24px", borderRadius: 9, border: "none",
                background: `linear-gradient(135deg,${t.color},${t.color}cc)`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter',sans-serif", boxShadow: `0 4px 18px ${t.color}40`,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >Book Live Demo →</button>
              <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi! I want to know more about ${t.label}`)}`} target="_blank" rel="noreferrer" style={{
                padding: "11px 24px", borderRadius: 9,
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#475569", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Inter',sans-serif",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all 0.25s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}>Chat Now</a>
            </div>
          </div>
          {/* Mock UI */}
          <div style={{
            background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: 28,
            boxShadow: "0 8px 40px rgba(99,102,241,0.08)", willChange: "transform",
          }}>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 5, background: "#fff" }}>
                {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                <div style={{ flex: 1, marginLeft: 8, height: 10, background: "#f1f5f9", borderRadius: 4, alignSelf: "center" }} />
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                  <div>
                    <div style={{ height: 9, width: 100, background: "#e2e8f0", borderRadius: 4, marginBottom: 5 }} />
                    <div style={{ height: 7, width: 70, background: "#f1f5f9", borderRadius: 4 }} />
                  </div>
                  <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 100, background: t.light, color: t.color, fontSize: 10, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>LIVE</div>
                </div>
                {[85, 62, 93, 48, 76].map((w, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ height: 7, width: `${w * 0.6}px`, background: "#e2e8f0", borderRadius: 3 }} />
                      <div style={{ height: 7, width: 28, background: t.light, borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 5, borderRadius: 4, background: "#f1f5f9" }}>
                      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${t.color},${t.color}88)`, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: t.light, border: `1px solid ${t.color}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ height: 8, width: 80, background: `${t.color}50`, borderRadius: 4, marginBottom: 5 }} />
                      <div style={{ height: 6, width: 120, background: `${t.color}30`, borderRadius: 4 }} />
                    </div>
                    <div style={{ padding: "5px 12px", borderRadius: 7, background: t.color, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>View</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Compatibility Matrix ─────────────────────────────────────────────────────
function CompatMatrix({ openModal }) {
  const [ref, vis] = useInView(0.1);
  const rows = [
    { model: "NX-Pro Thermal 80mm", usb: true, wifi: true, bt: false, gsm: true, laser: false },
    { model: "NX-500 Label Printer", usb: true, wifi: true, bt: true, gsm: true, laser: false },
    { model: "NX-Laser Pro A4", usb: true, wifi: false, bt: false, gsm: true, laser: true },
    { model: "NX-Portable Bluetooth", usb: true, wifi: false, bt: true, gsm: false, laser: false },
  ];
  return (
    <section style={{ padding: "80px 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>Hardware Compatibility Matrix</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", marginTop: 8, fontSize: 14 }}>Find your perfect printer instantly.</p>
        </div>
        <div ref={ref} style={{
          borderRadius: 18, overflow: "hidden", border: "1.5px solid #e2e8f0",
          boxShadow: "0 4px 24px rgba(99,102,241,0.07)",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#f0f4ff,#faf5ff)", borderBottom: "1.5px solid #e2e8f0" }}>
                <th style={{ padding: "14px 18px", textAlign: "left", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Model</th>
                {["USB", "Wi-Fi", "Bluetooth", "GST Billing", "Laser"].map(c => <th key={c} style={{ padding: "14px 18px", textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.model} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => openModal("Barcode / Billing Printers")}
                >
                  <td style={{ padding: "13px 18px", fontFamily: "'Inter',sans-serif", fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{row.model}</td>
                  {[row.usb, row.wifi, row.bt, row.gsm, row.laser].map((v, j) => (
                    <td key={j} style={{ padding: "13px 18px", textAlign: "center" }}>
                      {v ? <span style={{ color: "#10b981", fontSize: 16, fontWeight: 700 }}>✓</span> : <span style={{ color: "#e2e8f0" }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => openModal("Barcode / Billing Printers")} style={{
            padding: "10px 24px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.25s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >Get a Quote for Any Printer →</button>
        </div>
      </div>
    </section>
  );
}

// ─── Bulk Calculator ──────────────────────────────────────────────────────────
function BulkCalc({ openModal }) {
  const [rolls, setRolls] = useState(100);
  const [ref, vis] = useInView(0.2);
  const tiers = [
    { min: 1, max: 49, disc: 0, label: "Standard" },
    { min: 50, max: 99, disc: 5, label: "Silver" },
    { min: 100, max: 249, disc: 12, label: "Gold" },
    { min: 250, max: 499, disc: 18, label: "Platinum" },
    { min: 500, max: Infinity, disc: 25, label: "Enterprise" },
  ];
  const base = 4.5;
  const tier = tiers.find(t => rolls >= t.min && rolls <= t.max);
  const unit = base * (1 - tier.disc / 100);
  const total = (unit * rolls).toFixed(2);
  const save = ((base - unit) * rolls).toFixed(2);

  return (
    <section style={{ padding: "80px 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>Bulk Volume Calculator</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", marginTop: 8, fontSize: 14 }}>Slide to see your discount tier and savings instantly.</p>
        </div>
        <div ref={ref} style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 22, padding: 36,
          boxShadow: "0 6px 32px rgba(99,102,241,0.08)",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 14, fontWeight: 500 }}>Number of Rolls</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#1e293b", fontSize: 28 }}>{rolls}</span>
          </div>
          <input type="range" min={1} max={600} value={rolls} onChange={e => setRolls(+e.target.value)}
            style={{ width: "100%", accentColor: "#6366f1", height: 4, marginBottom: 24, cursor: "pointer" }} />
          {/* Tier pills */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {tiers.map(t => {
              const isActive = tier?.label === t.label;
              return (
                <div key={t.label} style={{
                  flex: 1, minWidth: 70, padding: "9px 6px", borderRadius: 10, textAlign: "center",
                  background: isActive ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f8fafc",
                  border: isActive ? "none" : "1.5px solid #e2e8f0",
                  transition: "all 0.3s",
                }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: isActive ? "#fff" : "#1e293b" }}>{t.label}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: isActive ? "rgba(255,255,255,0.85)" : "#64748b", marginTop: 2 }}>{t.disc}% OFF</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
            {[{ l: "Unit Price", v: `₹${unit.toFixed(2)}` }, { l: "Total Amount", v: `₹${total}`, hi: true }, { l: "You Save", v: `₹${save}`, good: true }].map(item => (
              <div key={item.l} style={{
                background: item.hi ? "#ede9fe" : "#f8fafc",
                border: `1.5px solid ${item.hi ? "#c4b5fd" : "#e2e8f0"}`,
                borderRadius: 12, padding: "14px 16px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#94a3b8", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.l}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: item.good ? "#10b981" : item.hi ? "#6366f1" : "#1e293b" }}>{item.v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => openModal("Barcode / Billing Rolls")} style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Inter',sans-serif", boxShadow: "0 6px 22px rgba(99,102,241,0.3)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,0.3)"; }}
          >
            Request Quote — {rolls} Rolls @ {tier?.disc}% Off
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── WhatsApp Features ────────────────────────────────────────────────────────
const WA_FEATS = [
  { icon: "📤", t: "Bulk Messaging", d: "Send thousands of personalized messages with smart scheduling." },
  { icon: "⏱️", t: "Smart Delay Engine", d: "Randomized delays prevent WhatsApp bans automatically." },
  { icon: "📊", t: "Excel Import", d: "Upload your entire contact list from CSV or Excel in seconds." },
  { icon: "🤖", t: "Auto-Responder", d: "Keyword-triggered replies that work 24/7 without you." },
  { icon: "📎", t: "Media Campaigns", d: "Send images, PDFs, videos, and voice notes in bulk." },
  { icon: "📈", t: "Live Analytics", d: "Track delivery, read rates, and replies in real-time." },
];

function WASection({ openModal }) {
  const [ref, vis] = useInView(0.1);
  return (
    <section style={{ padding: "80px 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 100, padding: "5px 14px", marginBottom: 14 }}>
            <span style={{ fontSize: 13 }}>💬</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#16a34a", fontWeight: 700, letterSpacing: "0.1em" }}>WHATSAPP MARKETING</span>
          </div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", margin: 0 }}>
            Marketing That Runs Itself
          </h2>
        </div>
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18 }}>
          {WA_FEATS.map((f, i) => {
            const tr = useTilt(8);
            return (
              <div key={f.t} ref={tr} style={{
                background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                borderRadius: 16, padding: 22, cursor: "default",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
                willChange: "transform",
              }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#14532d", fontSize: 15, margin: "0 0 7px" }}>{f.t}</h4>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#4ade80", lineHeight: 1.6, margin: 0, color: "#166534" }}>{f.d}</p>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button onClick={() => openModal("WhatsApp Marketing Software")} style={{
            padding: "13px 32px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#16a34a,#15803d)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Inter',sans-serif",
            boxShadow: "0 6px 22px rgba(22,163,74,0.3)",
            display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(22,163,74,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(22,163,74,0.3)"; }}
          >
            <span style={{ fontSize: 16 }}>💬</span> Book Live Demo
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTI = [
  { name: "Ramesh Patel", role: "Owner, PatelMart Superstore", av: "RP", text: "A V Technology's ERP transformed our 5-branch retail chain. Real-time inventory and GST billing saved us 20+ hours per week. Incredible support team.", color: "#6366f1", bg: "#ede9fe" },
  { name: "Sunita Sharma", role: "Director, Sharma Distributors", av: "SS", text: "The WhatsApp marketing software is a game changer. Reached 12,000 customers in one afternoon without a single ban. Bulk roll pricing is unbeatable.", color: "#10b981", bg: "#f0fdf4" },
  { name: "Ajay Mehta", role: "MD, Mehta Pharma Wholesale", av: "AM", text: "Thermal printers work flawlessly with the billing software. The compatibility matrix made ordering so simple. Zero downtime in 2 years.", color: "#8b5cf6", bg: "#f5f3ff" },
  { name: "Priya Nair", role: "CEO, Kerala Textile Hub", av: "PN", text: "We process 500+ invoices daily with zero errors. Cloud sync keeps all 3 branches in sync. Best ROI investment we've made in a decade.", color: "#ec4899", bg: "#fdf2f8" },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [ref, vis] = useInView(0.1);
  const go = (d) => { if (anim) return; setAnim(true); setTimeout(() => { setIdx(i => (i + d + TESTI.length) % TESTI.length); setAnim(false); }, 300); };
  useEffect(() => { const t = setInterval(() => go(1), 5500); return () => clearInterval(t); }, []);
  const t = TESTI[idx];
  return (
    <section ref={ref} style={{ padding: "80px 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>
            Trusted by <span style={{ color: "#6366f1" }}>5,000+</span> Businesses
          </h2>
        </div>
        <div style={{
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 22, padding: "44px 44px 36px",
          boxShadow: "0 8px 40px rgba(99,102,241,0.09)",
          opacity: vis ? (anim ? 0 : 1) : 0, transform: vis ? (anim ? "translateY(8px)" : "none") : "translateY(20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: 24, right: 36, fontFamily: "'Syne',sans-serif", fontSize: 72, color: t.color, opacity: 0.1, lineHeight: 1 }}>"</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 18 }}>★</span>)}
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(1rem,1.6vw,1.1rem)", color: "#334155", lineHeight: 1.75, marginBottom: 32, fontStyle: "italic" }}>"{t.text}"</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg,${t.color},${t.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#fff", fontSize: 14, boxShadow: `0 4px 14px ${t.color}40` }}>{t.av}</div>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#1e293b", fontSize: 14 }}>{t.name}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", color: "#94a3b8", fontSize: 12 }}>{t.role}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => go(-1)} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#64748b", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>‹</button>
              <div style={{ display: "flex", gap: 5 }}>
                {TESTI.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? "#6366f1" : "#e2e8f0", transition: "all 0.3s", cursor: "pointer" }} />)}
              </div>
              <button onClick={() => go(1)} style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#64748b", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>›</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection({ openModal }) {
  const [ref, vis] = useInView(0.1);
  return (
    <section id="contact" ref={ref} style={{ padding: "80px 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-20px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", margin: "0 0 14px" }}>
              Let's Build Something<br /><span style={{ color: "#6366f1" }}>Together</span>
            </h2>
            <p style={{ fontFamily: "'Inter',sans-serif", color: "#64748b", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              Whether you need a quick quote on barcode rolls or a full ERP implementation — our team responds within 2 hours on WhatsApp.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "💬", l: "WhatsApp Direct", v: "+91 95792 39700", href: `https://wa.me/${WA_NUMBER}` },
                { icon: "📧", l: "Email", v: "avtechnology07@gmail.com" },
                { icon: "📍", l: "Head Office", v: "Parshwanath Heights Tilekar Nagar,Kondwa Bk. , Pune- 411048" },
              ].map(c => (
                <a key={c.l} href={c.href || "#"} target={c.href ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0f4ff", border: "1.5px solid #e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#94a3b8", marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.l}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#1e293b", fontWeight: 600 }}>{c.v}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>







          <div style={{
            background: "linear-gradient(135deg,#f0f4ff,#faf5ff)", border: "1.5px solid #e0e7ff",
            borderRadius: 22, padding: 36, boxShadow: "0 8px 36px rgba(99,102,241,0.1)",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(20px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#1e293b", fontSize: 18, margin: "0 0 6px" }}>Request a Free Quote</h3>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#64748b", marginBottom: 22 }}>Fill in your details — we'll reply on WhatsApp within 2 hours.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["name", "Full Name *", "text"], ["phone", "Phone / WhatsApp *", "tel"], ["email", "Email (optional)", "email"]].map(([field, ph, type]) => (
                <input key={field} placeholder={ph} type={type} style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                  border: "1.5px solid #e2e8f0", background: "#fff", color: "#1e293b",
                  fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", transition: "border 0.2s",
                }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              ))}
              <select defaultValue="" style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box",
                border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
                fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none", cursor: "pointer",
              }}>
                <option value="" disabled>Select a Service</option>
                <option>Billing / ERP Software</option>
                <option>WhatsApp Marketing Software</option>
                <option>Barcode / Billing Printers</option>
                <option>Barcode / Billing Rolls</option>
                <option>Complete Bundle</option>
              </select>
              <button onClick={() => openModal("")} style={{
                padding: "13px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter',sans-serif", boxShadow: "0 6px 22px rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(99,102,241,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(99,102,241,0.3)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Submit Now  →
              </button>
            </div>
          </div>







        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ openModal, setPage }) {
  return (
    <footer id="about" style={{ background: "#0f172a", padding: "56px 2rem 28px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
                </svg>
              </div>

              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                A V<span style={{ color: "#818cf8" }}>Technology</span>
              </span>
            </div>

            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
                maxWidth: 220,
                marginBottom: 18,
              }}
            >
              Complete automation, billing, and marketing solutions for modern
              Indian businesses.
            </p>

            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#25d366",
                color: "#fff",
                fontFamily: "'Inter',sans-serif",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
              }}
            >
              WhatsApp Chat
            </a>
          </div>

          {[
            {
              t: "Products",
              ls: [
                "Billing Printers",
                "Barcode Rolls",
                "ERP Software",
                "WhatsApp Suite",
              ],
            },
            {
              t: "Company",
              ls: ["About Us", "Our Story", "Partners", "Blog"],
            },
            {
              t: "Support",
              ls: [
                "Driver Downloads",
                "Documentation",
                "Live Chat",
                "Contact",
              ],
            },
          ].map((col) => (
            <div key={col.t}>
              <h4
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  color: "#fff",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                {col.t}
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                }}
              >
                {col.ls.map((l) => (
                  <a
                    key={l}
                    href="#"
                    onClick={() => openModal("")}
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            © 2025 A V Technology. All rights reserved.
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setPage("privacy")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.25)",
                fontSize: 12,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Privacy Policy
            </button>

            <span style={{ color: "rgba(255,255,255,0.25)" }}>•</span>

            <button
              onClick={() => setPage("terms")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.25)",
                fontSize: 12,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WAFloat() {
  const [hov, setHov] = useState(false);
  const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPulse(false), 4000); return () => clearTimeout(t); }, []);
  return (
    <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'd like to know more about A V Technology solutions.")}`}
      target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 9998,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg,#25d366,#128c7e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: hov ? "0 6px 28px rgba(37,211,102,0.65)" : "0 4px 18px rgba(37,211,102,0.5)",
        transform: hov ? "scale(1.12)" : "scale(1)",
        transition: "all 0.3s", textDecoration: "none",
      }}>
      {pulse && <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid #25d366", animation: "ping 1.5s ease-out infinite", opacity: 0.6 }} />}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
    </a>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{background:#fff;color:#1e293b;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;}}
@keyframes popIn{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
@keyframes ping{from{transform:scale(1);opacity:0.6;}to{transform:scale(1.7);opacity:0;}}
input[type=range]{-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,#6366f1,#e2e8f0);border-radius:4px;height:4px;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);cursor:pointer;box-shadow:0 2px 8px rgba(99,102,241,0.4);border:2px solid #fff;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#f8fafc;}
::-webkit-scrollbar-thumb{background:#c4b5fd;border-radius:3px;}
select option{background:#fff;color:#1e293b;}
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState("");
  const [page, setPage] = useState("home");

  const openModal = (service = "") => {
    setModalService(service);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Privacy Policy Page
  if (page === "privacy") {
    return (
      <>
        <style>{CSS}</style>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 20px" }}>
          <button
            onClick={() => setPage("home")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
              background: "#6366f1",
              color: "#fff"
            }}
          >
            ← Back
          </button>

          <h1>Privacy Policy</h1>

          <p>
            At A V Technology, we respect your privacy and are committed to
            protecting your personal information.
          </p>

          <h2>Information We Collect</h2>
          <p>
            Name, email, phone number and business details submitted through
            our website.
          </p>

          <h2>How We Use Information</h2>
          <p>
            We use your information to provide services, support and business
            communication.
          </p>
        </div>
      </>
    );
  }

  // Terms Page
  if (page === "terms") {
    return (
      <>
        <style>{CSS}</style>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 20px" }}>
          <button
            onClick={() => setPage("home")}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
              background: "#6366f1",
              color: "#fff"
            }}
          >
            ← Back
          </button>

          <h1>Terms & Conditions</h1>

          <p>
            By using A V Technology services, you agree to our terms and
            conditions.
          </p>

          <h2>Services</h2>
          <p>
            We provide ERP software, billing software, WhatsApp marketing,
            barcode printers and related business solutions.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            A V Technology shall not be liable for indirect or consequential
            damages arising from the use of our services.
          </p>
        </div>
      </>
    );
  }

  // Home Page
  return (
    <>
      <style>{CSS}</style>

      <Navbar openModal={openModal} />
      <ContactModal
        open={modalOpen}
        onClose={closeModal}
        defaultService={modalService}
      />

      <main>
        <Hero openModal={openModal} />
        <ServicesSection openModal={openModal} />
        <FeatureTabs openModal={openModal} />
        <CompatMatrix openModal={openModal} />
        <BulkCalc openModal={openModal} />
        <WASection openModal={openModal} />
        <Testimonials />
        <ContactSection openModal={openModal} />
      </main>

      <Footer
        openModal={openModal}
        setPage={setPage}
      />
      <WAFloat />
    </>
  );
}
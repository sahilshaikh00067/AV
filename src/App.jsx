import { useState, useEffect, useRef, useCallback } from "react";
import av from "../public/av.jpeg";

// ─── WHATSAPP NUMBER ──────────────────────────────────────────────────────────
const WA_NUMBER = "919579239700";

function sendToWhatsApp(data) {
  const msg = `🔔 *New Lead - AARTI JEWELLERS Website*\n\n👤 *Name:* ${data.name}\n📧 *Email:* ${data.email || "—"}\n📱 *Phone:* ${data.phone}\n🛠️ *Service:* ${data.service}\n💬 *Message:* ${data.message || "—"}\n\n⏰ ${new Date().toLocaleString("en-IN")}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

function useTilt(strength = 8) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${clamp(-y * strength, -strength, strength)}deg) rotateY(${clamp(x * strength, -strength, strength)}deg) scale3d(1.02,1.02,1.02)`;
    el.style.transition = "transform 0.05s linear";
  }, [strength]);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
  }, []);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [onMove, onLeave]);
  return ref;
}

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

function AnimCounter({ end, suffix = "", dur = 2000 }) {
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

  const inputStyle = (field) => ({
    width: "100%", padding: "13px 16px", borderRadius: 12, boxSizing: "border-box",
    border: `1.5px solid ${errors[field] ? "#f87171" : "rgba(255,255,255,0.68)"}`,
    background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 14,
    fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)" }} />
      <div style={{
        position: "relative",
        background: "linear-gradient(145deg, #0d1117 0%, #161b22 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 28, padding: "44px 40px",
        width: "100%", maxWidth: 540,
        boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,215,0,0.05), inset 0 1px 0 rgba(255,255,255,0.06)",
        animation: "popIn 0.35s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
          cursor: "pointer", fontSize: 20, color: "#94a3b8",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>×</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Sent Successfully!</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your enquiry has been delivered to our WhatsApp. We'll respond within 2 hours.
            </p>
            <button onClick={onClose} style={{
              padding: "12px 36px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#C9A84C,#F5D073)", color: "#0d1117",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 100, padding: "4px 14px", marginBottom: 14 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", display: "inline-block" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.1em" }}>FREE CONSULTATION</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.3px" }}>Request a Callback</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", marginTop: 6 }}>We'll WhatsApp you within 2 hours.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name *" style={inputStyle("name")}
                  onFocus={e => { e.target.style.borderColor = "rgba(201,168,76,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.name ? "#f87171" : "rgba(255,255,255,0.68)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
                {errors.name && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>{errors.name}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="WhatsApp *" type="tel" style={inputStyle("phone")}
                  onFocus={e => { e.target.style.borderColor = "rgba(201,168,76,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.phone ? "#f87171" : "rgba(255,255,255,0.68)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" type="email" style={inputStyle("email")}
                  onFocus={e => { e.target.style.borderColor = "rgba(201,168,76,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.68)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
              </div>
              {errors.phone && <p style={{ color: "#f87171", fontSize: 11, marginTop: -8, fontFamily: "'DM Sans',sans-serif" }}>{errors.phone}</p>}
              <div>
                <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} style={{
                  ...inputStyle("service"), cursor: "pointer",
                  color: form.service ? "#f1f5f9" : "#64748b",
                }}
                  onFocus={e => { e.target.style.borderColor = "rgba(201,168,76,0.5)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.service ? "#f87171" : "rgba(255,255,255,0.68)"; }}
                >
                  <option value="" disabled style={{ background: "#0d1117" }}>Select a Service *</option>
                  {["Billing / ERP Software","WhatsApp Marketing Software","Barcode / Billing Printers","Barcode / Billing Rolls","Computer Sales & Service","Complete Bundle"].map(s => <option key={s} style={{ background: "#0d1117" }}>{s}</option>)}
                </select>
                {errors.service && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>{errors.service}</p>}
              </div>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Describe your requirement (optional)" rows={3}
                style={{ ...inputStyle(""), resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = "rgba(201,168,76,0.5)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.68)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
              />
              <button onClick={handleSubmit} style={{
                padding: "14px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#C9A84C,#F5D073)",
                color: "#0d1117", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(201,168,76,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.35)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0d1117"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Send via WhatsApp & Get Quote
              </button>
              <p style={{ textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#475569" }}>🔒 Sent directly & securely to our WhatsApp</p>
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
      background: scrolled ? "rgba(6,8,12,0.97)" : "rgba(6,8,12,0.6)",
      backdropFilter: "blur(24px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.6)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, overflow: "hidden",
            border: "1.5px solid rgba(201,168,76,0.3)",
            boxShadow: "0 0 20px rgba(201,168,76,0.15)",
            flexShrink: 0,
          }}>
            <img src={av} alt="AV JEWELLERS" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 20, color: "#f1f5f9", letterSpacing: "0.02em", display: "block", lineHeight: 1.1 }}>
              AARTI<span style={{ color: "#C9A84C" }}>JEWELLERS</span>
            </span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase" }}>Business Automation</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: "2.5rem" }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
              color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s",
              letterSpacing: "0.02em",
            }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10 }}>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" style={{
            padding: "9px 18px", borderRadius: 10,
            border: "1px solid rgba(37,211,102,0.25)",
            background: "rgba(37,211,102,0.06)",
            color: "#4ade80", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.12)"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,211,102,0.06)"; e.currentTarget.style.borderColor = "rgba(37,211,102,0.25)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#4ade80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </a>
          <button onClick={() => openModal("")} style={{
            padding: "9px 22px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#C9A84C,#F5D073)",
            color: "#0d1117", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 18px rgba(201,168,76,0.3)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(201,168,76,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(201,168,76,0.3)"; }}
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
      background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1200 0%, #06080c 55%, #000 100%)",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)", top: "-20%", right: "-20%", transform: `translate(${mouse.x * 40}px, ${mouse.y * 30}px)`, transition: "transform 0.8s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)", bottom: "-10%", left: "-15%", transform: `translate(${-mouse.x * 30}px, ${-mouse.y * 20}px)`, transition: "transform 0.8s ease", pointerEvents: "none" }} />

      {/* Fine grid */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />

      {/* Horizontal line accent */}
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.06), transparent)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 1000, padding: "110px 2rem 70px" }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          border: "1px solid rgba(201,168,76,0.2)",
          background: "rgba(201,168,76,0.05)",
          borderRadius: 100, padding: "7px 20px", marginBottom: 36,
          animation: "fadeUp 0.7s ease both",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C9A84C", display: "inline-block", boxShadow: "0 0 10px rgba(201,168,76,0.8)" }} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", fontWeight: 600, letterSpacing: "0.15em" }}>PUNE'S PREMIUM BUSINESS AUTOMATION PARTNER</span>
        </div>

        <h1 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(3rem,7vw,6.5rem)",
          fontWeight: 700, color: "#f1f5f9", lineHeight: 0.95,
          letterSpacing: "-2px", marginBottom: 28,
          animation: "fadeUp 0.75s ease 0.08s both",
        }}>
          Complete Automation,<br />
          <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,#C9A84C,#F5D073,#C9A84C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200%", animation: "shimmer 3s linear infinite" }}>
            Billing & Marketing
          </em>
          <br />
          <span style={{ fontSize: "0.75em", color: "rgba(241,245,249,0.55)", fontWeight: 400 }}>Solutions</span>
        </h1>

        <p style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(0.95rem,1.6vw,1.1rem)",
          color: "rgba(255,255,255,0.55)", maxWidth: 560, margin: "0 auto 44px",
          lineHeight: 1.8, animation: "fadeUp 0.75s ease 0.15s both",
        }}>
          Empower your business with enterprise billing software, barcode hardware, WhatsApp marketing, and complete ERP — all from one trusted Pune partner.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.75s ease 0.22s both" }}>
          <button onClick={() => openModal("")} style={{
            padding: "15px 36px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#C9A84C,#F5D073)",
            color: "#0d1117", fontSize: 15, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 10px 36px rgba(201,168,76,0.35)",
            fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 50px rgba(201,168,76,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(201,168,76,0.35)"; }}
          >
            Get Free Quote →
          </button>
          <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'd like to know more about AARTI JEWELLERS solutions.")}`} target="_blank" rel="noreferrer" style={{
            padding: "15px 36px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)",
            fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)"; e.currentTarget.style.color = "#4ade80"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.68)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Chat on WhatsApp
          </a>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 0, justifyContent: "center", marginTop: 80,
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, overflow: "hidden",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)",
          animation: "fadeUp 0.75s ease 0.3s both", flexWrap: "wrap",
          maxWidth: 700, margin: "80px auto 0",
        }}>
          {[{ v: 5000, s: "+", l: "Active Clients" }, { v: 99, s: "%", l: "Uptime SLA" }, { v: 12, s: "+", l: "Years Experience" }, { v: 24, s: "/7", l: "Support" }].map((st, i) => (
            <div key={st.l} style={{
              flex: 1, minWidth: 120, textAlign: "center", padding: "24px 20px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.8rem,3vw,2.4rem)",
                fontWeight: 700, color: "#C9A84C",
              }}><AnimCounter end={st.v} suffix={st.s} /></div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{st.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: "🖨️", title: "Barcode & Billing Printers", desc: "Industrial thermal and laser printers with Wi-Fi, USB, Bluetooth. From desktop to warehouse-scale printing solutions.", color: "#C9A84C", features: ["Thermal & Laser", "Wi-Fi + USB + BT", "Driver Portal", "Bulk Deals"], service: "Barcode / Billing Printers", num: "01" },
  { icon: "🏷️", title: "Barcode & Billing Rolls", desc: "Thermal paper, semi-gloss, chromo labels in every size. Bulk ordering with volume discount tiers for every business.", color: "#a78bfa", features: ["All Materials", "Custom Sizes", "Volume Discounts", "Fast Delivery"], service: "Barcode / Billing Rolls", num: "02" },
  { icon: "💼", title: "Billing / ERP System", desc: "Full ERP: inventory, GST billing, accounts, purchase orders, and real-time analytics in one powerful cloud app.", color: "#34d399", features: ["GST Ready", "Multi-Branch", "Cloud Sync", "AI Reports"], service: "Billing / ERP Software", num: "03" },
  { icon: "💬", title: "WhatsApp Marketing", desc: "Bulk campaigns with smart delays, auto-responders, Excel contact import, and military-grade anti-ban protection.", color: "#38bdf8", features: ["Bulk Messaging", "Anti-Ban Tech", "Auto-Responder", "Excel Import"], service: "WhatsApp Marketing Software", num: "04" },
  { icon: "🖥️", title: "Computer Sales & Service", desc: "Branded desktops, laptops, components, and repair services. AMC contracts available for businesses of all sizes.", color: "#fb7185", features: ["Sales & Repair", "AMC Contracts", "All Brands", "On-site Service"], service: "Computer Sales & Service", num: "05" },
  { icon: "📦", title: "Complete Business Bundle", desc: "All-in-one package: ERP + WhatsApp + Hardware + Support. Maximum value, single invoice, one point of contact.", color: "#F5D073", features: ["Everything Included", "Best Pricing", "Priority Support", "1 Invoice"], service: "Complete Bundle", num: "06" },
];

function ServicesSection({ openModal }) {
  const [ref, vis] = useInView(0.05);
  return (
    <section id="products" ref={ref} style={{ padding: "120px 2rem", background: "#06080c" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 72, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>— Core Solutions</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-1px", margin: 0, lineHeight: 1 }}>Built for<br /><em style={{ color: "#C9A84C" }}>Modern Business</em></h2>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 340, lineHeight: 1.7 }}>Six integrated product lines covering every operational need of a growing Indian business.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 2 }}>
          {SERVICES.map((s, i) => {
            const tref = useTilt(6);
            return (
              <div key={s.title} ref={tref} style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 0, padding: "36px 32px",
                cursor: "default",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(40px)",
                transition: `opacity 0.7s ease ${i * 0.08}s, transform 0.7s ease ${i * 0.08}s`,
                willChange: "transform", position: "relative", overflow: "hidden",
                borderRadius: i === 0 ? "20px 0 0 0" : i === 1 ? "0 20px 0 0" : i === 4 ? "0 0 0 20px" : i === 5 ? "0 0 20px 0" : 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(${s.color === "#C9A84C" ? "201,168,76" : s.color === "#a78bfa" ? "167,139,250" : s.color === "#34d399" ? "52,211,153" : s.color === "#38bdf8" ? "56,189,248" : s.color === "#fb7185" ? "251,113,133" : "245,208,115"},0.06)`; e.currentTarget.style.borderColor = `${s.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                {/* Number watermark */}
                <div style={{ position: "absolute", top: 20, right: 24, fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "rgba(255,255,255,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>{s.num}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}14`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: s.color, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.num}</div>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px", letterSpacing: "-0.3px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: "0 0 22px" }}>{s.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                  {s.features.map(f => (
                    <span key={f} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: s.color, background: `${s.color}10`, border: `1px solid ${s.color}20`, borderRadius: 6, padding: "3px 10px" }}>{f}</span>
                  ))}
                </div>
                <button onClick={() => openModal(s.service)} style={{
                  padding: "10px 20px", borderRadius: 8,
                  border: `1px solid ${s.color}30`,
                  background: "transparent", color: s.color, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s",
                  letterSpacing: "0.04em",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = "#0d1117"; e.currentTarget.style.boxShadow = `0 6px 24px ${s.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = s.color; e.currentTarget.style.boxShadow = "none"; }}
                >Get Quote →</button>
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
  { label: "ERP System", icon: "💼", heading: "Enterprise Billing & ERP", body: "Manage your entire business from one dashboard. GST-compliant invoicing, real-time inventory, multi-branch support, purchase orders, and AI-powered analytics.", points: ["GST & e-Invoice Ready", "Real-time Inventory", "Multi-Branch Support", "AI Analytics", "Customer Ledger", "Automated Reminders"], color: "#C9A84C", service: "Billing / ERP Software" },
  { label: "WhatsApp CRM", icon: "💬", heading: "WhatsApp Marketing Suite", body: "Scale your outreach with intelligent bulk messaging. Import contacts from Excel, set smart delay intervals, prevent bans, and automate responses 24/7.", points: ["Bulk Messaging Engine", "Anti-Ban Smart Delays", "Excel Import", "Auto-Responder Flows", "Campaign Analytics", "Media & PDF Sending"], color: "#4ade80", service: "WhatsApp Marketing Software" },
  { label: "Hardware", icon: "🖨️", heading: "Barcode & Printing Hardware", body: "From compact desktop label printers to industrial barcode scanners — supply, configure, and support the full hardware stack for your business.", points: ["Thermal & Laser", "Wi-Fi / USB / BT", "Compatibility Matrix", "Driver Portal", "On-site Setup", "Annual Maintenance"], color: "#a78bfa", service: "Barcode / Billing Printers" },
  { label: "Computers", icon: "🖥️", heading: "Computer Sales & AMC", body: "New and refurbished desktops, laptops, servers, and peripherals. Annual Maintenance Contracts keep your fleet running without disruption.", points: ["All Major Brands", "Custom Builds", "Repair & Service", "AMC Contracts", "On-site Support", "Parts Availability"], color: "#fb7185", service: "Computer Sales & Service" },
];

function FeatureTabs({ openModal }) {
  const [active, setActive] = useState(0);
  const [ref, vis] = useInView(0.1);
  const t = TABS[active];
  return (
    <section id="software" ref={ref} style={{ padding: "120px 2rem", background: "radial-gradient(ellipse 70% 50% at 50% 100%, #120e00 0%, #06080c 60%)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>— Deep Dive</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-1px", margin: 0 }}>
            What We <em style={{ color: "#C9A84C" }}>Build for You</em>
          </h2>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 56, background: "rgba(255,255,255,0.03)", padding: 5, borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", width: "fit-content", margin: "0 auto 56px" }}>
          {TABS.map((tb, i) => (
            <button key={tb.label} onClick={() => setActive(i)} style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: active === i ? "linear-gradient(135deg,#C9A84C,#F5D073)" : "transparent",
              color: active === i ? "#0d1117" : "rgba(255,255,255,0.55)",
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: active === i ? "0 4px 18px rgba(201,168,76,0.4)" : "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>{tb.icon} {tb.label}</button>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div>
            <div style={{ display: "inline-block", background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30`, padding: "4px 14px", borderRadius: 100, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 20, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase" }}>Featured</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.6rem,3vw,2.6rem)", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px", letterSpacing: "-0.5px" }}>{t.heading}</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>{t.body}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
              {t.points.map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${t.color}15`, border: `1px solid ${t.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2.5" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{p}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => openModal(t.service)} style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg,${t.color},${t.color}cc)`,
                color: "#0d1117", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", boxShadow: `0 6px 24px ${t.color}30`,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >Book Live Demo →</button>
              <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi! I want to know more about ${t.label}`)}`} target="_blank" rel="noreferrer" style={{
                padding: "12px 28px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all 0.25s",
              }}>Chat Now</a>
            </div>
          </div>

          {/* Mock UI panel */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 28,
            boxShadow: `0 0 80px ${t.color}10`, willChange: "transform",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "11px 15px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6, background: "rgba(255,255,255,0.02)", alignItems: "center" }}>
                {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                <div style={{ flex: 1, marginLeft: 8, height: 9, background: "rgba(255,255,255,0.05)", borderRadius: 4, alignSelf: "center" }} />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, padding: "11px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${t.color}18`, border: `1px solid ${t.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                  <div>
                    <div style={{ height: 8, width: 90, background: "rgba(255,255,255,0.68)", borderRadius: 4, marginBottom: 5 }} />
                    <div style={{ height: 6, width: 60, background: "rgba(255,255,255,0.05)", borderRadius: 4 }} />
                  </div>
                  <div style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 100, background: `${t.color}20`, color: t.color, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", border: `1px solid ${t.color}30` }}>LIVE</div>
                </div>
                {[82, 61, 90, 47, 73].map((w, i) => (
                  <div key={i} style={{ marginBottom: 11 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ height: 6, width: `${w * 0.55}px`, background: "rgba(255,255,255,0.08)", borderRadius: 3 }} />
                      <div style={{ height: 6, width: 26, background: `${t.color}25`, borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.04)" }}>
                      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg,${t.color},${t.color}60)`, borderRadius: 3, transition: "width 0.9s ease" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: `${t.color}0a`, border: `1px solid ${t.color}18` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ height: 7, width: 76, background: `${t.color}40`, borderRadius: 3, marginBottom: 6 }} />
                      <div style={{ height: 6, width: 110, background: `${t.color}25`, borderRadius: 3 }} />
                    </div>
                    <div style={{ padding: "6px 14px", borderRadius: 7, background: t.color, color: "#0d1117", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>View</div>
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
    <section style={{ padding: "100px 2rem", background: "#06080c" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>— Hardware</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Hardware Compatibility Matrix</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.65)", marginTop: 10, fontSize: 14 }}>Find your perfect printer instantly.</p>
        </div>
        <div ref={ref} style={{
          borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 60px rgba(0,0,0,0.5)",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(201,168,76,0.06)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
                <th style={{ padding: "15px 20px", textAlign: "left", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>Model</th>
                {["USB", "Wi-Fi", "Bluetooth", "GST Billing", "Laser"].map(c => <th key={c} style={{ padding: "15px 20px", textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.model} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => openModal("Barcode / Billing Printers")}
                >
                  <td style={{ padding: "14px 20px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{row.model}</td>
                  {[row.usb, row.wifi, row.bt, row.gsm, row.laser].map((v, j) => (
                    <td key={j} style={{ padding: "14px 20px", textAlign: "center" }}>
                      {v ? <span style={{ color: "#4ade80", fontSize: 15, fontWeight: 700 }}>✓</span> : <span style={{ color: "rgba(255,255,255,0.68)" }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button onClick={() => openModal("Barcode / Billing Printers")} style={{
            padding: "11px 28px", borderRadius: 10, border: "1px solid rgba(201,168,76,0.3)",
            background: "rgba(201,168,76,0.08)", color: "#C9A84C",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#C9A84C"; e.currentTarget.style.color = "#0d1117"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.color = "#C9A84C"; }}
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
    { min: 500, max: Infinity, disc: 25, label: "Elite" },
  ];
  const base = 4.5;
  const tier = tiers.find(t => rolls >= t.min && rolls <= t.max);
  const unit = base * (1 - tier.disc / 100);
  const total = (unit * rolls).toFixed(2);
  const save = ((base - unit) * rolls).toFixed(2);

  return (
    <section style={{ padding: "100px 2rem", background: "radial-gradient(ellipse 60% 50% at 50% 0%, #0d0a00 0%, #06080c 70%)" }}>
      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>— Volume Pricing</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Bulk Volume Calculator</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.65)", marginTop: 10, fontSize: 14 }}>Slide to see your discount tier and savings instantly.</p>
        </div>
        <div ref={ref} style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 40,
          boxShadow: "0 10px 80px rgba(0,0,0,0.5)",
          opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Number of Rolls</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#C9A84C", fontSize: 32 }}>{rolls}</span>
          </div>
          <input type="range" min={1} max={600} value={rolls} onChange={e => setRolls(+e.target.value)}
            style={{ width: "100%", accentColor: "#C9A84C", height: 4, marginBottom: 28, cursor: "pointer" }} />
          <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
            {tiers.map(t => {
              const isActive = tier?.label === t.label;
              return (
                <div key={t.label} style={{
                  flex: 1, minWidth: 80, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                  background: isActive ? "linear-gradient(135deg,#C9A84C,#F5D073)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "none" : "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.35s",
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 13, color: isActive ? "#0d1117" : "rgba(255,255,255,0.6)" }}>{t.label}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: isActive ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.65)", marginTop: 2 }}>{t.disc}% OFF</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 26 }}>
            {[{ l: "Unit Price", v: `₹${unit.toFixed(2)}`, hi: false, good: false }, { l: "Total Amount", v: `₹${total}`, hi: true, good: false }, { l: "You Save", v: `₹${save}`, hi: false, good: true }].map(item => (
              <div key={item.l} style={{
                background: item.hi ? "rgba(201,168,76,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${item.hi ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 14, padding: "16px 18px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.l}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 22, color: item.good ? "#4ade80" : item.hi ? "#C9A84C" : "rgba(255,255,255,0.7)" }}>{item.v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => openModal("Barcode / Billing Rolls")} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#C9A84C,#F5D073)",
            color: "#0d1117", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(201,168,76,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.3)"; }}
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
    <section style={{ padding: "100px 2rem", background: "#06080c" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 100, padding: "5px 16px", marginBottom: 16 }}>
            <span>💬</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>WhatsApp Marketing</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px", margin: 0 }}>
            Marketing That <em style={{ color: "#4ade80" }}>Runs Itself</em>
          </h2>
        </div>
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 2 }}>
          {WA_FEATS.map((f, i) => {
            const tr = useTilt(6);
            return (
              <div key={f.t} ref={tr} style={{
                background: "rgba(74,222,128,0.02)", border: "1px solid rgba(74,222,128,0.08)",
                borderRadius: 0, padding: 28, cursor: "default",
                opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)",
                transition: `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`,
                willChange: "transform",
                borderRadius: i === 0 ? "16px 0 0 0" : i === 2 ? "0 16px 0 0" : i === 3 ? "0 0 0 16px" : i === 5 ? "0 0 16px 0" : 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.05)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(74,222,128,0.02)"; e.currentTarget.style.borderColor = "rgba(74,222,128,0.08)"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#4ade80", fontSize: 18, margin: "0 0 8px", letterSpacing: "-0.2px" }}>{f.t}</h4>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <button onClick={() => openModal("WhatsApp Marketing Software")} style={{
            padding: "14px 36px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#16a34a,#4ade80)",
            color: "#0d1117", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 8px 32px rgba(74,222,128,0.25)",
            display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(74,222,128,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(74,222,128,0.25)"; }}
          >
            💬 Book Live Demo
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTI = [
  { name: "Ramesh Patel", role: "Owner, PatelMart Superstore", av: "RP", text: "AARTI JEWELLERS's ERP transformed our 5-branch retail chain. Real-time inventory and GST billing saved us 20+ hours per week. Incredible support team.", color: "#C9A84C" },
  { name: "Sunita Sharma", role: "Director, Sharma Distributors", av: "SS", text: "The WhatsApp marketing software is a game changer. Reached 12,000 customers in one afternoon without a single ban. Bulk roll pricing is unbeatable.", color: "#4ade80" },
  { name: "Ajay Mehta", role: "MD, Mehta Pharma Wholesale", av: "AM", text: "Thermal printers work flawlessly with the billing software. The compatibility matrix made ordering so simple. Zero downtime in 2 years of use.", color: "#a78bfa" },
  { name: "Priya Nair", role: "CEO, Kerala Textile Hub", av: "PN", text: "We process 500+ invoices daily with zero errors. Cloud sync keeps all 3 branches in sync. Best ROI investment we've made in a decade.", color: "#38bdf8" },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(false);
  const [ref, vis] = useInView(0.1);
  const go = (d) => { if (anim) return; setAnim(true); setTimeout(() => { setIdx(i => (i + d + TESTI.length) % TESTI.length); setAnim(false); }, 300); };
  useEffect(() => { const t = setInterval(() => go(1), 5500); return () => clearInterval(t); }, []);
  const t = TESTI[idx];
  return (
    <section ref={ref} style={{ padding: "100px 2rem", background: "radial-gradient(ellipse 70% 60% at 50% 100%, #0d0a00 0%, #06080c 60%)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>— Client Stories</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
            Trusted by <em style={{ color: "#C9A84C" }}>5,000+</em> Businesses
          </h2>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "48px 48px 40px",
          boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
          opacity: vis ? (anim ? 0 : 1) : 0, transform: vis ? (anim ? "translateY(8px)" : "none") : "translateY(24px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 20, right: 40, fontFamily: "'Cormorant Garamond',serif", fontSize: 100, color: t.color, opacity: 0.07, lineHeight: 1, userSelect: "none" }}>"</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
            {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#C9A84C", fontSize: 16 }}>★</span>)}
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.15rem,2vw,1.35rem)", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 36, fontStyle: "italic", fontWeight: 400 }}>"{t.text}"</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${t.color}20`, border: `1.5px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: t.color, fontSize: 14, boxShadow: `0 4px 18px ${t.color}25` }}>{t.av}</div>
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: "#f1f5f9", fontSize: 14 }}>{t.name}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{t.role}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => go(-1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "rgba(255,255,255,0.55)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.68)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>‹</button>
              <div style={{ display: "flex", gap: 5 }}>
                {TESTI.map((_, i) => <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, background: i === idx ? "#C9A84C" : "rgba(255,255,255,0.68)", transition: "all 0.3s", cursor: "pointer" }} />)}
              </div>
              <button onClick={() => go(1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "rgba(255,255,255,0.55)", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.68)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>›</button>
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
    <section id="contact" ref={ref} style={{ padding: "100px 2rem", background: "#06080c" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(-24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#C9A84C", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>— Contact</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-1px", margin: "0 0 18px", lineHeight: 1 }}>
              Let's Build<br />Something <em style={{ color: "#C9A84C" }}>Together</em>
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.75, marginBottom: 40 }}>
              Whether you need a quick quote on barcode rolls or a full ERP implementation — our team responds within 2 hours on WhatsApp.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { icon: "💬", l: "WhatsApp Direct", v: "+91 95792 39700", href: `https://wa.me/${WA_NUMBER}` },
                { icon: "📧", l: "Email", v: "avJEWELLERS07@gmail.com" },
                { icon: "📍", l: "Head Office", v: "Parshwanath Heights, Tilekar Nagar, Kondwa Bk., Pune - 411048" },
              ].map(c => (
                <a key={c.l} href={c.href || "#"} target={c.href ? "_blank" : undefined} rel="noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 16, textDecoration: "none" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.51)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.l}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.65)", fontWeight: 500, lineHeight: 1.5 }}>{c.v}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 24, padding: 40,
            boxShadow: "0 20px 80px rgba(0,0,0,0.4)",
            opacity: vis ? 1 : 0, transform: vis ? "none" : "translateX(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#f1f5f9", fontSize: 22, margin: "0 0 8px" }}>Request a Free Quote</h3>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 26 }}>Fill in your details — we'll reply on WhatsApp within 2 hours.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Full Name *", "text"], ["Phone / WhatsApp *", "tel"], ["Email (optional)", "email"]].map(([ph, type]) => (
                <input key={ph} placeholder={ph} type={type} style={{
                  width: "100%", padding: "13px 16px", borderRadius: 12, boxSizing: "border-box",
                  border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#f1f5f9",
                  fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border 0.2s",
                }}
                  onFocus={e => e.target.style.borderColor = "rgba(201,168,76,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              ))}
              <select defaultValue="" style={{
                width: "100%", padding: "13px 16px", borderRadius: 12, boxSizing: "border-box",
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)",
                fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer",
              }}>
                <option value="" disabled style={{ background: "#0d1117" }}>Select a Service</option>
                {["Billing / ERP Software","WhatsApp Marketing Software","Barcode / Billing Printers","Barcode / Billing Rolls","Computer Sales & Service","Complete Bundle"].map(s => <option key={s} style={{ background: "#0d1117" }}>{s}</option>)}
              </select>
              <button onClick={() => openModal("")} style={{
                padding: "14px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#C9A84C,#F5D073)",
                color: "#0d1117", fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(201,168,76,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(201,168,76,0.3)"; }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#0d1117"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Submit & Get Quote →
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
    <footer id="about" style={{ background: "#030507", padding: "64px 2rem 32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, overflow: "hidden", border: "1px solid rgba(201,168,76,0.25)", flexShrink: 0 }}>
                <img src={av} alt="AV JEWELLERS" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", display: "block", lineHeight: 1.1 }}>AARTI<span style={{ color: "#C9A84C" }}>JEWELLERS</span></span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>Business Automation</span>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.51)", lineHeight: 1.75, maxWidth: 230, marginBottom: 22 }}>
              Complete automation, billing, and marketing solutions for modern Indian businesses.
            </p>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9,
              background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", color: "#4ade80",
              fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#4ade80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp Chat
            </a>
          </div>

          {[
            { t: "Products", ls: ["Billing Printers", "Barcode Rolls", "ERP Software", "WhatsApp Suite", "Computer Sales"] },
            { t: "Company", ls: ["About Us", "Our Story", "Partners", "Careers"] },
            { t: "Support", ls: ["Driver Downloads", "Documentation", "Live Chat", "Contact Us"] },
          ].map(col => (
            <div key={col.t}>
              <h4 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 18, letterSpacing: "0.04em" }}>{col.t}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {col.ls.map(l => (
                  <a key={l} href="#" onClick={() => openModal("")} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.51)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#C9A84C"}
                    onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.51)"}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Gold divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)", marginBottom: 24 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.15)" }}>
            © 2025 AARTI JEWELLERS. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <button onClick={() => setPage("privacy")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.59)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.59)"}>Privacy Policy</button>
            <span style={{ color: "rgba(255,255,255,0.54)" }}>•</span>
            <button onClick={() => setPage("terms")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.59)", fontSize: 12, fontFamily: "'DM Sans',sans-serif", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#C9A84C"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.59)"}>Terms & Conditions</button>
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
  useEffect(() => { const t = setTimeout(() => setPulse(false), 5000); return () => clearTimeout(t); }, []);
  return (
    <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi! I'd like to know more about AARTI JEWELLERS solutions.")}`}
      target="_blank" rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "fixed", bottom: 30, right: 30, zIndex: 9998,
        width: 58, height: 58, borderRadius: "50%",
        background: "linear-gradient(135deg,#25d366,#128c7e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: hov ? "0 8px 36px rgba(37,211,102,0.7)" : "0 4px 22px rgba(37,211,102,0.45)",
        transform: hov ? "scale(1.1)" : "scale(1)",
        transition: "all 0.3s", textDecoration: "none",
      }}>
      {pulse && <span style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "2px solid #25d366", animation: "ping 1.5s ease-out infinite", opacity: 0.5 }} />}
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
    </a>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{background:#06080c;color:#f1f5f9;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
@keyframes popIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}
@keyframes ping{from{transform:scale(1);opacity:0.5;}to{transform:scale(1.8);opacity:0;}}
@keyframes shimmer{0%{background-position:0% 50%;}100%{background-position:200% 50%;}}
input[type=range]{-webkit-appearance:none;appearance:none;background:linear-gradient(90deg,#C9A84C,rgba(255,255,255,0.08));border-radius:4px;height:4px;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#F5D073);cursor:pointer;box-shadow:0 2px 12px rgba(201,168,76,0.5);border:2px solid #06080c;}
::placeholder{color:rgba(255,255,255,0.25);}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#06080c;}
::-webkit-scrollbar-thumb{background:#C9A84C44;border-radius:3px;}
select option{background:#0d1117;color:#f1f5f9;}
a{text-decoration:none;}
`;

// ─── Static pages ─────────────────────────────────────────────────────────────
function StaticPage({ title, setPage, children }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>
        <button onClick={() => setPage("home")} style={{
          padding: "10px 22px", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 10,
          cursor: "pointer", marginBottom: 36, background: "rgba(201,168,76,0.08)", color: "#C9A84C",
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600,
        }}>← Back</button>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: "#f1f5f9", marginBottom: 32, letterSpacing: "-1px" }}>{title}</h1>
        <div style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.9 }}>{children}</div>
      </div>
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState("");
  const [page, setPage] = useState("home");

  const openModal = (service = "") => { setModalService(service); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  if (page === "privacy") {
    return (
      <StaticPage title="Privacy Policy" setPage={setPage}>
        <p style={{ marginBottom: 20 }}>At AARTI JEWELLERS, we respect your privacy and are committed to protecting your personal information.</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#C9A84C", marginBottom: 12 }}>Information We Collect</h2>
        <p style={{ marginBottom: 20 }}>Name, email, phone number and business details submitted through our website.</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#C9A84C", marginBottom: 12 }}>How We Use Information</h2>
        <p>We use your information to provide services, support and business communication.</p>
      </StaticPage>
    );
  }

  if (page === "terms") {
    return (
      <StaticPage title="Terms & Conditions" setPage={setPage}>
        <p style={{ marginBottom: 20 }}>By using AARTI JEWELLERS services, you agree to our terms and conditions.</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#C9A84C", marginBottom: 12 }}>Services</h2>
        <p style={{ marginBottom: 20 }}>We provide ERP software, billing software, WhatsApp marketing, barcode printers, computer sales and related business solutions.</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#C9A84C", marginBottom: 12 }}>Limitation of Liability</h2>
        <p>AARTI JEWELLERS shall not be liable for indirect or consequential damages arising from the use of our services.</p>
      </StaticPage>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <Navbar openModal={openModal} />
      <ContactModal open={modalOpen} onClose={closeModal} defaultService={modalService} />
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
      <Footer openModal={openModal} setPage={setPage} />
      <WAFloat />
    </>
  );
}
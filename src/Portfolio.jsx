import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const emailConfig = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
};

const isEmailConfigured = Object.values(emailConfig).every(Boolean);

const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.8 + 0.2,
  twinkleDelay: Math.random() * 4,
  twinkleDuration: Math.random() * 2 + 2,
}));

const NEBULA_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 200 + 80,
  color: ["#7B2FBE22", "#00D4FF15", "#00FF8811", "#FF444410"][Math.floor(Math.random() * 4)],
  delay: Math.random() * 3,
}));

const projects = [
  {
    name: "E-Commerce Galaxy",
    desc: "Full-stack online store with Spring Boot backend, React frontend, JWT auth, Stripe payments & real-time inventory.",
    stack: ["Spring Boot", "React", "MySQL", "REST API"],
    color: "#7B2FBE",
    glow: "#7B2FBE",
    icon: "🛒",
  },
  {
    name: "Restaurant Orbit",
    desc: "Digital menu & ordering system for local restaurants. Table management, order tracking, and live kitchen dashboard.",
    stack: ["Spring Boot", "React", "WebSocket", "PostgreSQL"],
    color: "#00D4FF",
    glow: "#00D4FF",
    icon: "🍽️",
  },
  {
    name: "Salon Nebula",
    desc: "Appointment booking system for beauty salons. Online scheduling, staff management, SMS reminders.",
    stack: ["React", "REST API", "Spring Boot", "MySQL"],
    color: "#00FF88",
    glow: "#00FF88",
    icon: "✂️",
  },
  {
    name: "Business Dashboard Pulsar",
    desc: "Analytics dashboard for small businesses. Sales reports, customer insights, inventory and expense tracking.",
    stack: ["React", "Chart.js", "Spring Boot", "REST API"],
    color: "#FF8C42",
    glow: "#FF8C42",
    icon: "📊",
  },
];

const services = [
  { icon: "🌐", title: "Business Websites", desc: "Professional, fast-loading websites that represent your brand and attract customers 24/7.", price: "Starting at ₹8,000" },
  { icon: "🛒", title: "E-Commerce Stores", desc: "Sell your products online with secure payments, inventory, and order tracking built in.", price: "Starting at ₹15,000" },
  { icon: "📱", title: "Web Applications", desc: "Custom apps — booking systems, dashboards, portals — tailored to your business workflow.", price: "Starting at ₹20,000" },
  { icon: "🔗", title: "REST API Development", desc: "Powerful backends and APIs that connect your apps, automate tasks, and scale with you.", price: "Starting at ₹12,000" },
];

const chatbotIntents = [
  {
    keywords: ["service", "services", "offer", "make", "build", "website", "ecommerce", "e-commerce", "app", "application", "api", "business"],
    answers: [
      "I build business websites, e-commerce stores, custom web apps, and REST APIs for small businesses.",
      "ParaTech can help with websites, online stores, booking systems, dashboards, portals, and backend APIs.",
    ],
  },
  {
    keywords: ["price", "pricing", "cost", "charge", "budget", "quote", "package", "rate"],
    answers: [
      "Websites start at Rs. 8,000, e-commerce at Rs. 15,000, web apps at Rs. 20,000, and APIs at Rs. 12,000. Final pricing depends on your exact features.",
      "For a quick estimate: basic website Rs. 8,000+, e-commerce Rs. 15,000+, custom app Rs. 20,000+, API Rs. 12,000+.",
    ],
  },
  {
    keywords: ["time", "timeline", "duration", "long", "days", "weeks", "deliver", "deadline", "finish"],
    answers: [
      "Most projects take around 2-4 weeks, depending on pages, features, content readiness, and revisions.",
      "A simple website can be faster, while e-commerce or custom apps usually need 2-4 weeks for a polished launch.",
    ],
  },
  {
    keywords: ["support", "maintenance", "update", "updates", "after", "launch", "bug", "fix"],
    answers: [
      "Yes, I provide post-launch support, updates, fixes, and improvements so the site keeps running smoothly.",
      "Support is available after launch. We can also set up a maintenance plan if you want regular updates.",
    ],
  },
  {
    keywords: ["technology", "technologies", "tech", "stack", "react", "spring", "boot", "mysql", "postgres", "database"],
    answers: [
      "My main stack is React for frontend, Spring Boot for backend, MySQL/PostgreSQL for databases, and REST APIs.",
      "I usually use React, Spring Boot, SQL databases, REST APIs, Git, and modern responsive frontend practices.",
    ],
  },
  {
    keywords: ["existing", "old", "redesign", "improve", "repair", "broken", "slow", "current"],
    answers: [
      "Yes, I can fix, improve, speed up, or redesign an existing website. Share what is not working and I can suggest the next step.",
      "Absolutely. Existing websites can be upgraded with better UI, performance, mobile layout, SEO basics, or new features.",
    ],
  },
  {
    keywords: ["payment", "installment", "emi", "advance", "milestone", "plan"],
    answers: [
      "Yes, flexible payment terms are possible. We can split payment by milestones like start, preview, and launch.",
      "Payment plans can be discussed based on project size. Milestone-based payments usually work well.",
    ],
  },
  {
    keywords: ["start", "started", "contact", "whatsapp", "call", "hire", "meeting", "discuss"],
    answers: [
      "To get started, send your project idea through the contact form or WhatsApp. I will reply with next steps and a quote.",
      "Share your business type, required pages/features, and target launch date. Then we can plan the scope and pricing.",
    ],
  },
];

const fallbackAnswers = [
  "I can help with services, pricing, timelines, tech stack, support, existing website fixes, and how to get started. What would you like to know?",
  "That sounds project-specific. Tell me whether it is about cost, features, timeline, or support, and I will guide you.",
  "I may need a little more detail. You can ask about website pricing, e-commerce, web apps, APIs, delivery time, or support.",
];

const normalizeChatInput = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const getChatbotResponse = (text) => {
  const normalized = normalizeChatInput(text).join(" ");
  const bestIntent = chatbotIntents
    .map((intent) => ({
      ...intent,
      score: intent.keywords.reduce(
        (score, keyword) => score + (normalized.includes(keyword) ? 1 : 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];

  const answerPool = bestIntent?.score > 0 ? bestIntent.answers : fallbackAnswers;
  return answerPool[Math.floor(Math.random() * answerPool.length)];
};

const techStack = [
  { name: "Spring Boot", icon: "🍃", category: "Backend", color: "#6DB33F" },
  { name: "React", icon: "⚛️", category: "Frontend", color: "#00D4FF" },
  { name: "REST API", icon: "🔗", category: "Architecture", color: "#FF8C42" },
  { name: "MySQL", icon: "🐬", category: "Database", color: "#00758F" },
  { name: "JavaScript", icon: "⚡", category: "Language", color: "#F7DF1E" },
  { name: "Java", icon: "☕", category: "Language", color: "#ED8B00" },
  { name: "Git", icon: "🔀", category: "DevOps", color: "#F05032" },
  { name: "HTML/CSS", icon: "🎨", category: "Frontend", color: "#E34F26" },
];

function StarField() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {NEBULA_PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${p.color}, transparent 70%)`,
            animation: `nebulaPulse ${4 + p.delay}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {STARS.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background: "#E8F4FD",
            opacity: star.opacity,
            animation: `twinkle ${star.twinkleDuration}s ease-in-out infinite alternate`,
            animationDelay: `${star.twinkleDelay}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingPlanet({ size, color, style, rings = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }}>
      {rings && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotateX(75deg)",
          width: size * 2.2,
          height: size * 2.2,
          borderRadius: "50%",
          border: `2px solid ${color}55`,
          boxShadow: `0 0 20px ${color}33`,
          pointerEvents: "none",
        }} />
      )}
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}44 60%, #050510)`,
        boxShadow: `0 0 ${size * 0.6}px ${color}66, 0 0 ${size * 1.2}px ${color}22`,
        animation: "planetFloat 6s ease-in-out infinite alternate",
      }} />
    </div>
  );
}

function NavBar({ scrollY }) {
  const nav = ["Home", "About", "Services", "Projects", "Tech Stack", "Contact"];
  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase().replace(" ", "-"))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: "0 2rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: scrollY > 60 ? "rgba(5,5,16,0.92)" : "transparent",
      backdropFilter: scrollY > 60 ? "blur(20px)" : "none",
      borderBottom: scrollY > 60 ? "1px solid rgba(123,47,190,0.3)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }} onClick={() => scrollTo("home")}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #00D4FF, #7B2FBE)",
          boxShadow: "0 0 20px #7B2FBE88",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🪐</div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1.15rem", letterSpacing: "0.05em", color: "#E8F4FD" }}>
          PARA<span style={{ color: "#7B2FBE" }}>TECH</span>
        </span>
      </div>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {nav.map((item) => (
          <button
            key={item}
            onClick={() => scrollTo(item)}
            style={{
              background: "none", border: "none", color: "#9BAAB8",
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.85rem",
              letterSpacing: "0.08em", cursor: "pointer",
              transition: "color 0.2s",
              padding: "4px 0",
            }}
            onMouseEnter={e => e.target.style.color = "#00D4FF"}
            onMouseLeave={e => e.target.style.color = "#9BAAB8"}
          >
            {item.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => scrollTo("contact")}
          style={{
            background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
            border: "none", borderRadius: "20px",
            color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.82rem", fontWeight: 600,
            padding: "8px 20px", cursor: "pointer",
            letterSpacing: "0.06em",
            boxShadow: "0 0 20px #7B2FBE55",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 0 30px #7B2FBE88"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 20px #7B2FBE55"; }}
        >
          HIRE ME
        </button>
      </div>
    </nav>
  );
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! 👋 I'm ParaTech's AI Assistant. Ask me anything about services, pricing, or how we can help!" }
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { type: "user", text: input }]);

    const response = getChatbotResponse(input);

    setTimeout(() => {
      setMessages(prev => [...prev, { type: "bot", text: response }]);
    }, 300);

    setInput("");
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "100px",
          right: "30px",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          boxShadow: "0 4px 20px rgba(123, 47, 190, 0.5)",
          zIndex: 98,
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.15)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(123, 47, 190, 0.7)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(123, 47, 190, 0.5)";
        }}
        title="Chat with AI"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "100px",
            width: 350,
            height: 500,
            borderRadius: "20px",
            background: "rgba(5, 5, 16, 0.95)",
            border: "1px solid rgba(123, 47, 190, 0.3)",
            boxShadow: "0 8px 40px rgba(123, 47, 190, 0.3)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            zIndex: 98,
            animation: "slideInUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "15px 20px",
            borderBottom: "1px solid rgba(123, 47, 190, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", color: "#E8F4FD" }}>ParaTech AI</h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#9BAAB8" }}>Always here to help!</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#9BAAB8",
                fontSize: "1.2rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: msg.type === "user"
                      ? "linear-gradient(135deg, #7B2FBE, #00D4FF)"
                      : "rgba(123, 47, 190, 0.2)",
                    color: "#E8F4FD",
                    padding: "10px 14px",
                    borderRadius: msg.type === "user" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                    border: msg.type === "bot" ? "1px solid rgba(123, 47, 190, 0.3)" : "none",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid rgba(123, 47, 190, 0.2)",
            display: "flex",
            gap: "8px",
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me..."
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(123, 47, 190, 0.2)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#E8F4FD",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                cursor: "pointer",
                padding: "8px 12px",
                fontSize: "1rem",
              }}
            >
              📤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default function Portfolio() {
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState({});
  const [formData, setFormData] = useState({ name: "", email: "", project: "", message: "" });
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const fadeIn = (id, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? "translateY(0)" : "translateY(40px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  useEffect(() => {
    if (emailConfig.publicKey) {
      emailjs.init(emailConfig.publicKey);
    }
  }, []);

  const handleSubmit = async () => {
    if (formData.name && formData.email) {
      if (!isEmailConfigured) {
        console.error("Missing EmailJS environment variables.");
        alert("Contact form is not configured yet. Please message me on WhatsApp.");
        return;
      }

      try {
        const response = await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          {
            from_name: formData.name,
            from_email: formData.email,
            project_type: formData.project,
            message: formData.message,
          }
        );
        console.log("Email sent successfully!", response);
        setSent(true);
        setFormData({ name: "", email: "", project: "", message: "" });
      } catch (error) {
        console.error("Email send error:", error);
        console.error("Error details:", error.text || error.message);
        alert("Error sending message. Please try again.");
      }
    }
  };

  const techCategories = ["All", ...new Set(techStack.map(t => t.category))];
  const filteredTech = activeTab === "All" ? techStack : techStack.filter(t => t.category === activeTab);

  return (
    <div style={{
      background: "#050510",
      minHeight: "100vh",
      color: "#E8F4FD",
      fontFamily: "'Space Grotesk', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050510; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#7B2FBE, #00D4FF); border-radius: 2px; }

        @keyframes twinkle {
          from { opacity: 0.2; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.2); }
        }
        @keyframes nebulaPulse {
          from { transform: scale(0.9) rotate(0deg); opacity: 0.6; }
          to { transform: scale(1.15) rotate(10deg); opacity: 1; }
        }
        @keyframes planetFloat {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-18px) rotate(5deg); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          from { box-shadow: 0 0 20px #7B2FBE55; }
          to { box-shadow: 0 0 50px #7B2FBE99, 0 0 80px #00D4FF33; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes meteorShower {
          from { transform: translateX(-10px) translateY(-10px); opacity: 0; }
          20% { opacity: 1; }
          to { transform: translateX(150px) translateY(150px); opacity: 0; }
        }

        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02) !important;
        }
        .tech-badge:hover {
          transform: scale(1.1) !important;
        }
      `}</style>

      <StarField />
      <NavBar scrollY={scrollY} />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/917667151925?text=Hi%20ParaTech%2C%20I%20am%20interested%20in%20your%20services."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "30px",
          left: "30px",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
          zIndex: 99,
          cursor: "pointer",
          transition: "all 0.3s ease",
          textDecoration: "none",
          color: "#fff",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.15)";
          e.currentTarget.style.boxShadow = "0 6px 30px rgba(37, 211, 102, 0.6)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4)";
        }}
        title="Chat on WhatsApp"
      >
        💬
      </a>

      {/* Chatbot */}
      <Chatbot />

      {/* ── HERO ── */}
      <section
        id="home"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 2rem 4rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orbit rings */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          border: "1px solid #7B2FBE22",
          animation: "orbitSpin 40s linear infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: -6, left: "50%",
            width: 12, height: 12, borderRadius: "50%",
            background: "#00D4FF",
            boxShadow: "0 0 15px #00D4FF",
            transform: "translateX(-50%)",
          }} />
        </div>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800, height: 800,
          borderRadius: "50%",
          border: "1px solid #00D4FF11",
          animation: "orbitSpin 70s linear infinite reverse",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", bottom: -5, right: "20%",
            width: 10, height: 10, borderRadius: "50%",
            background: "#7B2FBE",
            boxShadow: "0 0 12px #7B2FBE",
          }} />
        </div>

        {/* Floating planet */}
        <FloatingPlanet
          size={160}
          color="#7B2FBE"
          glow="#7B2FBE"
          rings
          style={{ position: "absolute", right: "12%", top: "20%", opacity: 0.85 }}
        />
        <FloatingPlanet
          size={80}
          color="#00D4FF"
          style={{ position: "absolute", left: "8%", bottom: "25%", opacity: 0.7 }}
        />
        <FloatingPlanet
          size={40}
          color="#00FF88"
          style={{ position: "absolute", right: "28%", bottom: "18%", opacity: 0.6 }}
        />

        <div style={{ textAlign: "center", zIndex: 1, maxWidth: 800 }}>
          <div style={{
            display: "inline-block",
            background: "rgba(123,47,190,0.15)",
            border: "1px solid rgba(123,47,190,0.4)",
            borderRadius: "50px",
            padding: "6px 20px",
            fontSize: "0.78rem",
            letterSpacing: "0.15em",
            color: "#00D4FF",
            marginBottom: "2rem",
            animation: "slideInLeft 1s ease 0.2s both",
          }}>
            🛸 AVAILABLE FOR PROJECTS · INDIA
          </div>

          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: "0.4rem",
            animation: "slideInLeft 1s ease 0.4s both",
          }}>
            <span style={{ color: "#E8F4FD" }}>PARA</span>
            <span style={{
              background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}> TECH</span>
          </h1>

          <p style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
            letterSpacing: "0.3em",
            color: "#9BAAB8",
            marginBottom: "2rem",
            animation: "slideInLeft 1s ease 0.6s both",
          }}>
            FULL STACK DEVELOPER · WEB SOLUTIONS
          </p>

          <p style={{
            fontSize: "1.15rem",
            color: "#B8C8D8",
            lineHeight: 1.8,
            maxWidth: 580,
            margin: "0 auto 3rem",
            fontWeight: 300,
            animation: "slideInLeft 1s ease 0.8s both",
          }}>
            I build powerful websites and web applications for local businesses — from e-commerce stores to booking systems, all engineered to grow your revenue.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", animation: "slideInLeft 1s ease 1s both" }}>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                border: "none", borderRadius: "30px",
                color: "#fff", fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem", fontWeight: 600,
                padding: "14px 36px", cursor: "pointer",
                letterSpacing: "0.08em",
                boxShadow: "0 0 40px #7B2FBE55",
                animation: "glowPulse 2.5s ease-in-out infinite alternate",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
            >
              🚀 START A PROJECT
            </button>
            <button
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "transparent",
                border: "1px solid rgba(123,47,190,0.5)",
                borderRadius: "30px",
                color: "#E8F4FD", fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem", fontWeight: 500,
                padding: "14px 36px", cursor: "pointer",
                letterSpacing: "0.08em",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#00D4FF"; e.target.style.color = "#00D4FF"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(123,47,190,0.5)"; e.target.style.color = "#E8F4FD"; }}
            >
              VIEW MY WORK
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "3rem", justifyContent: "center",
            marginTop: "5rem", flexWrap: "wrap",
            animation: "slideInLeft 1s ease 1.2s both",
          }}>
            {[
              { num: "20+", label: "Projects Built" },
              { num: "15+", label: "Happy Clients" },
              { num: "2+", label: "Years Experience" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "2.2rem", fontWeight: 900,
                  background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{s.num}</div>
                <div style={{ color: "#9BAAB8", fontSize: "0.82rem", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        style={{ padding: "8rem 2rem", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <div style={fadeIn("about", 0)}>
            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ ABOUT ME</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900, lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}>
              YOUR LOCAL<br />
              <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>TECH PARTNER</span>
            </h2>
            <p style={{ color: "#B8C8D8", lineHeight: 1.9, marginBottom: "1.5rem", fontSize: "1.05rem" }}>
              Hi, I'm a full-stack developer with a passion for helping local businesses go digital. I specialize in building clean, fast, and functional websites that actually bring in customers.
            </p>
            <p style={{ color: "#9BAAB8", lineHeight: 1.9, marginBottom: "2.5rem" }}>
              Whether you're a restaurant, salon, shop, or startup — I build your online presence with the same quality and care I'd want for my own business.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              {["On-Time Delivery", "Clean Code", "Post-Launch Support"].map((tag) => (
                <span key={tag} style={{
                  background: "rgba(123,47,190,0.12)",
                  border: "1px solid rgba(123,47,190,0.3)",
                  borderRadius: "20px", padding: "6px 14px",
                  fontSize: "0.8rem", color: "#00D4FF",
                  letterSpacing: "0.05em",
                }}>{tag}</span>
              ))}
            </div>
          </div>

          <div style={{ ...fadeIn("about", 0.3), position: "relative" }}>
            <div style={{
              background: "rgba(123,47,190,0.08)",
              border: "1px solid rgba(123,47,190,0.25)",
              borderRadius: "24px",
              padding: "2.5rem",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 200, height: 200,
                background: "radial-gradient(circle, #7B2FBE22, transparent 70%)",
                borderRadius: "50%",
                transform: "translate(40%, -40%)",
              }} />
              <FloatingPlanet size={120} color="#7B2FBE" rings style={{ margin: "0 auto 2rem" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                {[
                  { label: "Backend", value: "Spring Boot + Java" },
                  { label: "Frontend", value: "React + JavaScript" },
                  { label: "API Design", value: "RESTful APIs" },
                  { label: "Database", value: "MySQL / PostgreSQL" },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: "rgba(0,212,255,0.05)",
                    border: "1px solid rgba(0,212,255,0.15)",
                    borderRadius: "12px", padding: "1rem",
                  }}>
                    <div style={{ color: "#9BAAB8", fontSize: "0.72rem", letterSpacing: "0.1em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ color: "#E8F4FD", fontSize: "0.88rem", fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section
        id="services"
        style={{ padding: "8rem 2rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem", ...fadeIn("services", 0) }}>
            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ WHAT I BUILD</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
            }}>
              SERVICES <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>& PRICING</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
            {services.map((s, i) => (
              <div
                key={s.title}
                className="card-hover"
                style={{
                  ...fadeIn("services", i * 0.15),
                  background: "rgba(123,47,190,0.07)",
                  border: "1px solid rgba(123,47,190,0.2)",
                  borderRadius: "20px",
                  padding: "2rem",
                  backdropFilter: "blur(20px)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 100, height: 100,
                  background: "radial-gradient(circle, #7B2FBE15, transparent 70%)",
                  borderRadius: "50%",
                  transform: "translate(30%, -30%)",
                }} />
                <div style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.95rem", marginBottom: "0.8rem", letterSpacing: "0.05em" }}>{s.title}</h3>
                <p style={{ color: "#9BAAB8", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{s.desc}</p>
                <div style={{
                  background: "rgba(0,212,255,0.1)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  borderRadius: "10px", padding: "8px 14px",
                  color: "#00D4FF", fontSize: "0.85rem", fontWeight: 600,
                  display: "inline-block",
                }}>{s.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section
        id="projects"
        style={{ padding: "8rem 2rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem", ...fadeIn("projects", 0) }}>
            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ MY WORK</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
            }}>
              PROJECTS <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>IN ORBIT</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {projects.map((p, i) => (
              <div
                key={p.name}
                className="card-hover"
                style={{
                  ...fadeIn("projects", i * 0.15),
                  background: "rgba(5,5,16,0.7)",
                  border: `1px solid ${p.color}33`,
                  borderRadius: "20px",
                  padding: "2rem",
                  backdropFilter: "blur(20px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(circle at 80% 20%, ${p.color}12, transparent 60%)`,
                  pointerEvents: "none",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, ${p.color}cc, ${p.color}33)`,
                    boxShadow: `0 0 20px ${p.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem",
                  }}>{p.icon}</div>
                  <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.9rem", letterSpacing: "0.04em", lineHeight: 1.3 }}>{p.name}</h3>
                </div>
                <p style={{ color: "#9BAAB8", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{p.desc}</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {p.stack.map((tech) => (
                    <span key={tech} style={{
                      background: `${p.color}15`,
                      border: `1px solid ${p.color}33`,
                      borderRadius: "20px", padding: "4px 12px",
                      fontSize: "0.75rem", color: p.color,
                      fontWeight: 600, letterSpacing: "0.05em",
                    }}>{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section
        id="tech-stack"
        style={{ padding: "8rem 2rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem", ...fadeIn("tech-stack", 0) }}>
            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ MY ARSENAL</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
            }}>
              TECH <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>STACK</span>
            </h2>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", marginBottom: "3rem", flexWrap: "wrap" }}>
            {techCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  background: activeTab === cat ? "linear-gradient(135deg, #7B2FBE, #00D4FF)" : "rgba(123,47,190,0.1)",
                  border: activeTab === cat ? "none" : "1px solid rgba(123,47,190,0.3)",
                  borderRadius: "20px",
                  color: "#E8F4FD",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.82rem",
                  padding: "7px 18px",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  transition: "all 0.3s",
                  fontWeight: activeTab === cat ? 600 : 400,
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {filteredTech.map((tech, i) => (
              <div
                key={tech.name}
                className="tech-badge"
                style={{
                  ...fadeIn("tech-stack", i * 0.08),
                  background: "rgba(123,47,190,0.07)",
                  border: `1px solid ${tech.color}33`,
                  borderRadius: "16px",
                  padding: "1.5rem",
                  textAlign: "center",
                  cursor: "default",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${tech.color}44`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.6rem" }}>{tech.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.3rem" }}>{tech.name}</div>
                <div style={{ color: tech.color, fontSize: "0.72rem", letterSpacing: "0.1em" }}>{tech.category.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ME ── */}
      <section
        id="why"
        style={{ padding: "6rem 2rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(123,47,190,0.12), rgba(0,212,255,0.08))",
            border: "1px solid rgba(123,47,190,0.25)",
            borderRadius: "28px",
            padding: "4rem",
            ...fadeIn("why", 0),
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 300, height: 300,
              background: "radial-gradient(circle, #7B2FBE15, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
            }} />
            <FloatingPlanet size={100} color="#00D4FF" style={{ position: "absolute", right: "5%", bottom: "-10%" }} />

            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ WHY PARA TECH</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 900, marginBottom: "3rem",
            }}>
              WHY CHOOSE <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>ME?</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
              {[
                { icon: "🎯", title: "Business-First Thinking", desc: "I don't just write code. I understand your business goals and build accordingly." },
                { icon: "⚡", title: "Fast Turnaround", desc: "Most projects delivered in 2–4 weeks. No endless delays." },
                { icon: "🛡️", title: "Reliable & Secure", desc: "Secure login, proper API design, and stable hosting guidance." },
                { icon: "🤝", title: "Ongoing Support", desc: "Post-launch support and updates so you're never left stranded." },
                { icon: "💰", title: "Local-Friendly Pricing", desc: "Competitive rates built for Indian small businesses, not Silicon Valley budgets." },
                { icon: "📞", title: "Direct Communication", desc: "You talk to me directly, not a team of account managers." },
              ].map((item) => (
                <div key={item.title}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>{item.icon}</div>
                  <h4 style={{ fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.95rem" }}>{item.title}</h4>
                  <p style={{ color: "#9BAAB8", fontSize: "0.88rem", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="contact"
        style={{ padding: "8rem 2rem 6rem", position: "relative", zIndex: 1 }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem", ...fadeIn("contact", 0) }}>
            <div style={{ color: "#7B2FBE", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>◈ LET'S BUILD TOGETHER</div>
            <h2 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
            }}>
              START YOUR <span style={{
                background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>PROJECT</span>
            </h2>
            <p style={{ color: "#9BAAB8", marginTop: "1rem", lineHeight: 1.7 }}>
              Got a business idea? I'll turn it into a website that works.
            </p>
          </div>

          {sent ? (
            <div style={{
              ...fadeIn("contact", 0),
              textAlign: "center",
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.3)",
              borderRadius: "20px",
              padding: "4rem",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
              <h3 style={{ fontFamily: "'Orbitron', monospace", marginBottom: "0.8rem", color: "#00FF88" }}>MESSAGE SENT!</h3>
              <p style={{ color: "#9BAAB8" }}>I'll get back to you within 24 hours. Let's build something great!</p>
            </div>
          ) : (
            <div style={{
              ...fadeIn("contact", 0.2),
              background: "rgba(123,47,190,0.07)",
              border: "1px solid rgba(123,47,190,0.2)",
              borderRadius: "24px",
              padding: "3rem",
              backdropFilter: "blur(20px)",
            }}>
              {[
                { key: "name", label: "YOUR NAME", type: "text", placeholder: "Raj Kumar" },
                { key: "email", label: "EMAIL ADDRESS", type: "email", placeholder: "raj@example.com" },
                { key: "project", label: "PROJECT TYPE", type: "text", placeholder: "E-Commerce / Restaurant / Salon / Other" },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block", color: "#7B2FBE",
                    fontSize: "0.72rem", letterSpacing: "0.15em",
                    marginBottom: "0.5rem", fontWeight: 600,
                  }}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{
                      width: "100%", background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(123,47,190,0.3)",
                      borderRadius: "12px", padding: "14px 18px",
                      color: "#E8F4FD",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "border-color 0.3s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#7B2FBE"}
                    onBlur={e => e.target.style.borderColor = "rgba(123,47,190,0.3)"}
                  />
                </div>
              ))}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{
                  display: "block", color: "#7B2FBE",
                  fontSize: "0.72rem", letterSpacing: "0.15em",
                  marginBottom: "0.5rem", fontWeight: 600,
                }}>YOUR MESSAGE</label>
                <textarea
                  rows={4}
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(123,47,190,0.3)",
                    borderRadius: "12px", padding: "14px 18px",
                    color: "#E8F4FD",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.95rem",
                    outline: "none", resize: "vertical",
                    transition: "border-color 0.3s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7B2FBE"}
                  onBlur={e => e.target.style.borderColor = "rgba(123,47,190,0.3)"}
                />
              </div>
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #7B2FBE, #00D4FF)",
                  border: "none", borderRadius: "14px",
                  color: "#fff", fontFamily: "'Orbitron', monospace",
                  fontSize: "0.9rem", fontWeight: 700,
                  padding: "16px", cursor: "pointer",
                  letterSpacing: "0.1em",
                  boxShadow: "0 0 40px #7B2FBE55",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  animation: "glowPulse 2.5s ease-in-out infinite alternate",
                }}
                onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = "0 0 60px #7B2FBE99"; }}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 40px #7B2FBE55"; }}
              >
                🚀 LAUNCH MY PROJECT
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(123,47,190,0.2)",
        padding: "2.5rem",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        background: "rgba(5,5,16,0.8)",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #00D4FF, #7B2FBE)",
            boxShadow: "0 0 15px #7B2FBE66",
          }} />
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "1rem", color: "#E8F4FD" }}>
            PARA<span style={{ color: "#7B2FBE" }}>TECH</span>
          </span>
        </div>
        <p style={{ color: "#9BAAB8", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
          © 2025 Para Tech Developer · Full Stack Web Solutions · India
        </p>
        <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.4rem" }}>
          Built with React · Spring Boot · REST API
        </p>
      </footer>
    </div>
  );
}

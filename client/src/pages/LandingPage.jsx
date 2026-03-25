import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

// SVG icon components
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63 6.165-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GooglePlayIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3.18 23.72a2.07 2.07 0 001.07-.31l9.94-5.66-2.29-2.29-8.72 8.26zM.06 1.23A1.82 1.82 0 000 1.78v20.44a1.82 1.82 0 00.06.55L.2 22.9l11.45-11.45v-.27L.2 1.1.06 1.23zM20.35 10.48l-2.83-1.61-2.56 2.56 2.56 2.56 2.85-1.62a1.83 1.83 0 000-3.19l-.02.3zM4.25.59L14.18 6.25l-2.29 2.29L4.25.59z" />
  </svg>
);

const CONTACT_EMAIL = "christinejade.duranc@gws.ctu.edu.ph";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState("idle"); // "idle" | "sent" | "error" | "invalid"

  const handleContactField = (e) => {
    const { id, value } = e.target;
    const key = id === "cname" ? "name" : id === "cemail" ? "email" : "message";
    setContactForm((prev) => ({ ...prev, [key]: value }));
    if (contactStatus !== "idle") setContactStatus("idle");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = contactForm;

    // Basic presence validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setContactStatus("error");
      return;
    }

    // Basic email format check
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setContactStatus("invalid");
      return;
    }

    // Build mailto: URL — opens user's default email client pre-filled
    const subject = encodeURIComponent(`Chickify Inquiry from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nFrom: ${email.trim()}\n\nMessage:\n${message.trim()}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    // Reset and show success feedback
    setContactForm({ name: "", email: "", message: "" });
    setContactStatus("sent");
  };

  const navbarRef = useRef(null);
  const heroCircleRef = useRef(null);
  const heroMascotRef = useRef(null);
  const progressBarRef = useRef(null);
  const backToTopRef = useRef(null);
  const navigate = useNavigate();

  const scrollToSection = useCallback((e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Scroll reveal observer
    const revealEls = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right",
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );
    revealEls.forEach((el) => io.observe(el));

    // Parallax + scroll effects
    let ticking = false;
    function updateParallax() {
      const sy = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBarRef.current)
        progressBarRef.current.style.width = (sy / docH) * 100 + "%";
      if (backToTopRef.current)
        backToTopRef.current.classList.toggle("show", sy > 400);
      if (navbarRef.current)
        navbarRef.current.classList.toggle("scrolled", sy > 60);
      if (heroCircleRef.current)
        heroCircleRef.current.style.transform = `translateY(${sy * 0.38}px)`;
      if (heroMascotRef.current)
        heroMascotRef.current.style.transform = `translateY(${sy * 0.16}px)`;

      const floatEggs = document.querySelectorAll(".float-egg");
      floatEggs.forEach((egg) => {
        const speed = parseFloat(egg.dataset.speed) || 0.1;
        egg.style.transform = `translateY(${sy * speed}px) rotate(${sy * speed * 0.6}deg)`;
      });

      ticking = false;
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <div id="progress-bar" ref={progressBarRef}></div>

      <button
        id="back-to-top"
        ref={backToTopRef}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
      </button>

      {/* NAVBAR */}
      <nav className={`navbar${menuOpen ? " menu-open" : ""}`} ref={navbarRef}>
        <div className="logo">
          <img src="/chickify-primarylogo.png" alt="Chickify" />
        </div>
        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        {menuOpen && (
          <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
        )}
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li>
            <a
              onClick={(e) => {
                scrollToSection(e, "home");
                setMenuOpen(false);
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              onClick={(e) => {
                scrollToSection(e, "service");
                setMenuOpen(false);
              }}
            >
              Service
            </a>
          </li>
          <li>
            <a
              onClick={(e) => {
                scrollToSection(e, "about");
                setMenuOpen(false);
              }}
            >
              About Us
            </a>
          </li>
          <li>
            <a
              onClick={(e) => {
                scrollToSection(e, "contact");
                setMenuOpen(false);
              }}
            >
              Contact
            </a>
          </li>
        </ul>
        <div className="auth-btns">
          <button className="btn-signin" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" id="home">
        <div className="hero-circle" ref={heroCircleRef}></div>
        <div className="float-egg fe1" data-speed="0.08"></div>
        <div className="float-egg fe2" data-speed="0.14"></div>
        <div className="float-egg fe3" data-speed="0.06"></div>
        <div className="float-egg fe4" data-speed="0.12"></div>
        <div className="float-egg fe5" data-speed="0.1"></div>
        <div className="hero-content">
          <div className="hero-text reveal-left">
            <h1>
              Order <span className="highlight">Fresh Eggs</span>
              <br />
              Straight from{" "}
              <span className="italic-highlight">
                Local
                <br />
                Farmers!
              </span>
            </h1>
            <p>
              Supporting Local Farmers, Delivering Quality
              <br />
              Eggs to Your Doorstep.
            </p>
            <button className="btn-download">Download Now</button>
          </div>
          <div className="hero-mascot" ref={heroMascotRef}>
            <img
              src="/chickify-brandmark.png"
              alt="Chickify egg mascot holding egg tray"
              className="reveal-right"
            />
          </div>
        </div>
        <div className="social-bar reveal">
          <a href="#" aria-label="Twitter">
            <TwitterIcon />
          </a>
          <a href="#" aria-label="Facebook">
            <FacebookIcon />
          </a>
          <a href="#" aria-label="Instagram">
            <InstagramIcon />
          </a>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="service">
        <p className="section-label reveal">OUR SERVICE</p>
        <h2 className="reveal">How Does it Works?</h2>
        <div className="cards-row">
          <div className="card reveal" style={{ transitionDelay: ".05s" }}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24">
                <ellipse cx="12" cy="13" rx="7" ry="9" />
                <circle
                  cx="10.5"
                  cy="11"
                  r="1.8"
                  fill="#FACC15"
                  stroke="none"
                />
              </svg>
            </div>
            <h3>Egg Quality</h3>
            <p>
              Fresh, high-quality eggs sourced from trusted farmers and checked
              for freshness before delivery.
            </p>
          </div>
          <div className="card reveal" style={{ transitionDelay: ".15s" }}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24">
                <path d="M6 2h12l2 6H4L6 2z" />
                <path d="M4 8v12a2 2 0 002 2h12a2 2 0 002-2V8" />
                <path d="M9 13h6M12 10v6" />
              </svg>
            </div>
            <h3>Easy to Order</h3>
            <p>
              A hassle-free platform where you can browse, add to cart, and
              order in just a few clicks.
            </p>
          </div>
          <div className="card reveal" style={{ transitionDelay: ".25s" }}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24">
                <path d="M17 11c0 4-5 9-5 9s-5-5-5-9a5 5 0 0110 0z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
            </div>
            <h3>Farm Direct</h3>
            <p>
              Sourced directly from Bantayan Island&#39;s egg farmers, ensuring
              top quality at every order.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div
          style={{
            background: "#fff",
            textAlign: "center",
            padding: "40px 60px 13px",
            marginTop: "-1px",
          }}
        >
          <p className="section-label reveal">WHO WE ARE</p>
          <h2
            className="reveal"
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#222",
              marginBottom: "20px",
            }}
          >
            About Us
          </h2>
        </div>

        <div className="wave-into-about">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            style={{ display: "block", width: "100%" }}
          >
            <path
              fill="#FACC15"
              fillOpacity="1"
              d="M0,256L8,224C16,192,32,128,48,106.7C64,85,80,107,96,106.7C112,107,128,85,144,101.3C160,117,176,171,192,197.3C208,224,224,224,240,224C256,224,272,224,288,208C304,192,320,160,336,154.7C352,149,368,171,384,165.3C400,160,416,128,432,144C448,160,464,224,480,240C496,256,512,224,528,181.3C544,139,560,85,576,85.3C592,85,608,139,624,165.3C640,192,656,192,672,165.3C688,139,704,85,720,64C736,43,752,53,768,64C784,75,800,85,816,96C832,107,848,117,864,112C880,107,896,85,912,101.3C928,117,944,171,960,170.7C976,171,992,117,1008,122.7C1024,128,1040,192,1056,224C1072,256,1088,256,1104,245.3C1120,235,1136,213,1152,213.3C1168,213,1184,235,1200,224C1216,213,1232,171,1248,176C1264,181,1280,235,1296,213.3C1312,192,1328,96,1344,85.3C1360,75,1376,149,1392,197.3C1408,245,1424,267,1432,277.3L1440,288L1440,320L1432,320C1424,320,1408,320,1392,320C1376,320,1360,320,1344,320C1328,320,1312,320,1296,320C1280,320,1264,320,1248,320C1232,320,1216,320,1200,320C1184,320,1168,320,1152,320C1136,320,1120,320,1104,320C1088,320,1072,320,1056,320C1040,320,1024,320,1008,320C992,320,976,320,960,320C944,320,928,320,912,320C896,320,880,320,864,320C848,320,832,320,816,320C800,320,784,320,768,320C752,320,736,320,720,320C704,320,688,320,672,320C656,320,640,320,624,320C608,320,592,320,576,320C560,320,544,320,528,320C512,320,496,320,480,320C464,320,448,320,432,320C416,320,400,320,384,320C368,320,352,320,336,320C320,320,304,320,288,320C272,320,256,320,240,320C224,320,208,320,192,320C176,320,160,320,144,320C128,320,112,320,96,320C80,320,64,320,48,320C32,320,16,320,8,320L0,320Z"
            />
          </svg>
        </div>

        <div className="about-top">
          <img
            src="/chickify-brandmark.png"
            alt="Chickify Mascot"
            className="reveal-left"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="about-right reveal-right">
            <h3>
              Bringing Freshness Straight from <span>Bantayan Island</span>
            </h3>
            <p>
              Our eggs come straight from the dedicated farmers of Bantayan
              Island, guaranteeing freshness, quality, and fair pricing. By
              sourcing directly, we support local farmers while bringing you the
              best eggs — fresh from farm to table!
            </p>
          </div>
        </div>
        <div className="mission-box reveal">
          <div className="mission-text">
            <h3>Our Mission</h3>
            <p>
              At Chickify, we aim to create a sustainable marketplace where
              local egg farmers can thrive while customers enjoy high-quality
              eggs at affordable prices. We believe in fair trade, transparency,
              and empowering small-scale farmers.
            </p>
          </div>
          <img
            src="/eggtray.png"
            alt="Tray of fresh eggs"
            style={{ boxShadow: "none" }}
          />
        </div>
      </section>

      {/* WAVE yellow → white */}
      <div className="wave-out-about">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          style={{ display: "block", width: "100%" }}
        >
          <path
            fill="#ffffff"
            d="M0,64L60,72C120,80,240,96,360,90.7C480,85,600,59,720,53.3C840,48,960,64,1080,74.7C1200,85,1320,91,1380,93.3L1440,96L1440,120L0,120Z"
          />
        </svg>
      </div>

      {/* TESTIMONIALS */}
      <section className="testi-section">
        <p className="section-label reveal">TESTIMONIES</p>
        <h2 className="reveal">What Our Customers Says?</h2>
        <div className="testi-cards">
          <div
            className="testi-card reveal"
            style={{ transitionDelay: ".05s" }}
          >
            <div className="quote-icon">&ldquo;</div>
            <p>
              The eggs arrived so fresh — you can really taste the difference
              when they come straight from the farm. Will order again!
            </p>
            <div className="testi-name">Maria Santos</div>
            <div className="testi-email">maria.santos@gmail.com</div>
            <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          </div>
          <div
            className="testi-card reveal"
            style={{ transitionDelay: ".15s" }}
          >
            <div className="quote-icon">&ldquo;</div>
            <p>
              Super convenient and the quality is outstanding. My family loves
              the Bantayan Island eggs — absolutely delicious!
            </p>
            <div className="testi-name">Jade, Jadii</div>
            <div className="testi-email">jadii@gmail.com</div>
            <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9734;</div>
          </div>
          <div
            className="testi-card reveal"
            style={{ transitionDelay: ".25s" }}
          >
            <div className="quote-icon">&ldquo;</div>
            <p>
              Ordering was so easy and delivery was fast. Love that I&#39;m
              supporting local farmers with every purchase!
            </p>
            <div className="testi-name">Carlo Reyes</div>
            <div className="testi-email">carlo.reyes@gmail.com</div>
            <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          </div>
        </div>
      </section>

      {/* APP SECTION */}
      <section className="app-section">
        <div className="app-phones reveal-left">
          <div className="phone-frame">
            <div className="phone-screen phone-screen-1">
              <img src="/1.png" alt="Chickify App Screen 1" />
            </div>
          </div>
          <div className="phone-frame phone-frame-front">
            <div className="phone-screen phone-screen-2">
              <img src="/2.jpg" alt="Chickify App Screen 2" />
            </div>
          </div>
        </div>
        <div className="app-info reveal-right">
          <h2>Chickify App is Now Available!</h2>
          <p>
            Get fresh eggs anytime, anywhere! The Chickify app makes ordering
            farm-fresh eggs quick and easy.
          </p>
          <div className="store-btns">
            
            <a href="#" className="store-btn">
              <GooglePlayIcon /> Google Play
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <div className="contact-section" id="contact">
        <div className="map-placeholder">
          <div className="contact-address">
            chickify.notifications@gmail.com
            <br />
            {/* 09876787878 */}
          </div>
          <div className="contact-us-title">Contact Us</div>
        </div>
        <form className="contact-card reveal-right" onSubmit={handleContactSubmit} noValidate>
          <label htmlFor="cname">Name</label>
          <input
            type="text"
            id="cname"
            placeholder="Your name"
            value={contactForm.name}
            onChange={handleContactField}
          />
          <label htmlFor="cemail">Email</label>
          <input
            type="email"
            id="cemail"
            placeholder="your@email.com"
            value={contactForm.email}
            onChange={handleContactField}
          />
          <label htmlFor="cmessage">Message</label>
          <textarea
            id="cmessage"
            placeholder="Your message..."
            value={contactForm.message}
            onChange={handleContactField}
          ></textarea>

          {/* Inline feedback messages */}
          {contactStatus === "error" && (
            <div className="contact-feedback contact-feedback--error">
              Please fill in all fields before sending.
            </div>
          )}
          {contactStatus === "invalid" && (
            <div className="contact-feedback contact-feedback--error">
              Please enter a valid email address.
            </div>
          )}
          {contactStatus === "sent" && (
            <div className="contact-feedback contact-feedback--success">
              Your email client opened! Send the pre-filled email to complete.
            </div>
          )}

          <button className="btn-send" type="submit">Send Message</button>
        </form>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-left">
          <p style={{ marginTop: "6px", color: "#555" }}>
            ©2025 Developed by Team IT-Log
          </p>
        </div>
        <div className="footer-right">
          <a href="#" className="footer-store">
            <GooglePlayIcon /> Google Play
          </a>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="#" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback, useContext, createContext, useId } from "react";
import logoFullWhite from "./assets/brand/logo-full-white.png";
import {
  Mic, UserCheck, Route, CalendarClock, Repeat, TrendingUp,
  Star, Check, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, ArrowUp,
  BookOpen, Feather, Baby,
  GraduationCap, Globe, Sparkles, Menu, X, Award, Quote,
  Instagram, Facebook, Youtube, Linkedin, Video, Clock,
  Mail, Phone, MapPin, Send, Users, Compass, Heart, MessageCircle,
  Calendar, ShieldCheck
} from "lucide-react";

/* ================================================================== *
 *  Speak in Urdu — multi-route site
 *  Routes:  /  ·  /courses  ·  /courses/<slug>  ·  /pricing  ·  /blog (PHP)
 *  Shared styles live in public/site.css, linked from index.html.
 * ================================================================== */


/* ================= data ================= */
const STATS = [
  { n: "5,000+", l: "lessons delivered" },
  { n: "40+", l: "countries" },
  { n: "4.9★", l: "average rating" },
  { n: "100%", l: "native teachers" },
];

const WHY = [
  { icon: Mic, t: "Native Urdu Teachers", d: "Learn authentic pronunciation and real conversational Urdu from teachers who grew up speaking it." },
  { icon: UserCheck, t: "Truly 1-on-1", d: "Lessons adapt to your pace and goals, with personal attention every class." },
  { icon: Route, t: "Structured Curriculum", d: "From your first letter to reading poetry, follow a clear path — no guesswork." },
  { icon: CalendarClock, t: "Flexible Scheduling", d: "Book classes around your timezone, whether you're in Toronto or Dubai." },
  { icon: Repeat, t: "Practice That Sticks", d: "Homework, worksheets, and recordings keep progress going between classes." },
  { icon: TrendingUp, t: "Weekly Progress Reports", d: "See exactly what you've mastered and what's next." },
];

const COURSES = [
  {
    slug: "kids-1-1", icon: Baby, name: "Kids 1:1 Urdu Classes",
    meta: "Ages 5+ · 30 min · Live 1:1", format: "Live 1:1", lessonLength: "30 minutes",
    desc: "Perfect for children learning Urdu as a second language.",
    pricingType: "tiered",
    tiers: [{ lessons: 4, price: 32 }, { lessons: 8, price: 64 }, { lessons: 12, price: 96 }],
    price: "$32", unit: "/mo",
    featuresLabel: "Features",
    features: ["Personalized lessons", "Speaking practice", "Reading", "Writing", "Games", "Worksheets", "Homework support"],
    ctaLabel: "Book Trial", ctaKind: "trial",
  },
  {
    slug: "women-1-1", icon: Users, name: "Women 1:1 Urdu Classes",
    meta: "Adults · 50 min · Live 1:1", format: "Live 1:1", lessonLength: "50 minutes",
    desc: "Designed for adult women who want to confidently communicate in Urdu.",
    pricingType: "tiered",
    tiers: [{ lessons: 4, price: 48 }, { lessons: 8, price: 96 }, { lessons: 12, price: 144 }],
    price: "$48", unit: "/mo",
    featuresLabel: "Focus",
    features: ["Conversation", "Grammar", "Reading", "Writing", "Vocabulary", "Pronunciation", "Cultural understanding"],
    ctaLabel: "Book Trial", ctaKind: "trial",
  },
  {
    slug: "gcse-urdu-exam-prep", icon: GraduationCap, name: "GCSE Urdu Exam Preparation",
    meta: "16 weeks · 1x/week · 60 min", format: "Live 1:1", lessonLength: "60 minutes",
    desc: "Exam-focused Urdu preparation for GCSE success, built around the real syllabus.",
    pricingType: "flat",
    duration: "16 Weeks", frequency: "1 session per week", fee: 79,
    price: "$79", unit: " total",
    featuresLabel: "Includes",
    features: ["Speaking", "Listening", "Reading", "Writing", "Exam strategies", "Past paper practice", "Vocabulary", "Mock exams"],
    ctaLabel: "Enroll Now", ctaKind: "enroll",
  },
  {
    slug: "read-write-urdu", icon: BookOpen, name: "Read & Write Urdu Course",
    meta: "12 weeks · 1x/week · 40 min", format: "Live 1:1", lessonLength: "40 minutes",
    desc: "Go from the Urdu alphabet to confident reading and writing in three months.",
    pricingType: "flat",
    duration: "12 Weeks", frequency: "1 session per week", fee: 60,
    price: "$60", unit: " total",
    featuresLabel: "Students Learn",
    features: ["Urdu alphabet", "Reading fluency", "Writing skills", "Vocabulary", "Sentence building", "Reading practice"],
    ctaLabel: "Enroll Now", ctaKind: "enroll",
  },
  {
    slug: "summer-urdu-course", icon: Calendar, name: "Summer Urdu Course",
    meta: "Jul – Mid Aug · 6 weeks · 30 min", format: "Live 1:1", lessonLength: "30 minutes",
    desc: "Keep the momentum going this summer with playful, focused Urdu practice.",
    pricingType: "flat",
    available: "July – Mid August", duration: "6 Weeks", frequency: "2 sessions per week", fee: 55,
    price: "$55", unit: " total",
    featuresLabel: "Focus",
    features: ["Speaking", "Vocabulary", "Reading", "Writing", "Interactive games", "Cultural activities"],
    ctaLabel: "Enroll Now", ctaKind: "enroll",
  },
  {
    slug: "back-to-school-urdu", icon: Repeat, name: "Back-to-School Urdu Course",
    meta: "Late Aug – Sep · 6 weeks · 30 min", format: "Live 1:1", lessonLength: "30 minutes",
    desc: "Refresh and rebuild Urdu skills before the new school year begins.",
    pricingType: "flat",
    available: "Late August – September", duration: "6 Weeks", frequency: "2 sessions per week", fee: 55,
    price: "$55", unit: " total",
    featuresLabel: "Focus",
    features: ["Maintaining Urdu skills after summer", "Speaking confidence", "Reading", "Writing", "Revision activities"],
    ctaLabel: "Enroll Now", ctaKind: "enroll",
  },
];
const COURSE_BY_SLUG = Object.fromEntries(COURSES.map((c) => [c.slug, c]));

const STEPS = [
  { t: "Book a free trial", d: "Meet a teacher, no card required." },
  { t: "Quick assessment", d: "We find your exact starting level." },
  { t: "Choose your plan & schedule", d: "Pick times that fit your week." },
  { t: "Attend live classes", d: "Learn, practice, get feedback." },
  { t: "Track your progress", d: "Weekly reports and a certificate on completion." },
];

const TESTIMONIALS = [
  { q:"I went from not knowing the alphabet to reading short stories in four months. My teacher is endlessly patient.", a:"Fatima H., Canada" },
  { q:"My kids actually ask for their Urdu class now. That's a miracle.", a:"Omar S., USA" },
  { q:"I finally speak Urdu with my grandparents. Worth every minute.", a:"Zara A., UK" },
  { q:"Flexible timing meant I could learn around my shifts in Dubai.", a:"Hassan M., UAE" },
  { q:"Structured, professional, and genuinely warm. Best language investment I've made.", a:"Aisha B., Australia" },
];

const CLASS_TIERS = [4, 8, 12];

const PRIVATE_PLANS = [
  {
    id: "kids", kind: "private", name: "Kids 1:1", courseSlug: "kids-1-1",
    tagline: "Private lessons for young learners", minutes: 30,
    prices: { 4: 32, 8: 64, 12: 96 }, pop: false,
    cta: "Book Trial",
    incl: [
      "One-to-one with a dedicated teacher",
      "30 minutes per class",
      "Pick 4, 8, or 12 classes a month",
      "Lessons paced around your child",
      "Homework and recordings after class",
    ],
  },
  {
    id: "women", kind: "private", name: "Women 1:1", courseSlug: "women-1-1",
    tagline: "Private lessons for adult women", minutes: 50,
    prices: { 4: 48, 8: 96, 12: 144 }, pop: false,
    cta: "Book Trial",
    incl: [
      "One-to-one with a dedicated teacher",
      "50 minutes per class",
      "Pick 4, 8, or 12 classes a month",
      "Conversation, reading, or exam focus",
      "Homework and recordings after class",
    ],
  },
];

const GROUP_PLANS = [
  {
    id: "gcse", kind: "flat", name: "GCSE Urdu", courseSlug: "gcse-urdu-exam-prep",
    tagline: "Exam-focused preparation course",
    duration: "16 Weeks", frequency: "1 session/week", minutes: 60, fee: 79, pop: false,
    cta: "Enroll Now",
    incl: [
      "16 weeks, one 60-minute session a week",
      "Speaking, listening, reading & writing",
      "Exam strategies & past paper practice",
      "Mock exams before test day",
    ],
  },
  {
    id: "readwrite", kind: "flat", name: "Read & Write Urdu", courseSlug: "read-write-urdu",
    tagline: "Alphabet-to-fluency course",
    duration: "12 Weeks", frequency: "1 session/week", minutes: 40, fee: 60, pop: false,
    cta: "Enroll Now",
    incl: [
      "12 weeks, one 40-minute session a week",
      "Urdu alphabet to reading fluency",
      "Writing skills & sentence building",
      "Guided reading practice",
    ],
  },
  {
    id: "summer", kind: "flat", name: "Summer Course", courseSlug: "summer-urdu-course",
    tagline: "Summer intensive · Jul – Mid Aug",
    duration: "6 Weeks", frequency: "2 sessions/week", minutes: 30, fee: 55, pop: false,
    cta: "Enroll Now",
    incl: [
      "6 weeks, two 30-minute sessions a week",
      "Speaking, vocabulary, reading & writing",
      "Interactive games & cultural activities",
      "Runs July through mid-August",
    ],
  },
  {
    id: "backtoschool", kind: "flat", name: "Back-to-School Course", courseSlug: "back-to-school-urdu",
    tagline: "Refresher course · Late Aug – Sep",
    duration: "6 Weeks", frequency: "2 sessions/week", minutes: 30, fee: 55, pop: false,
    cta: "Enroll Now",
    incl: [
      "6 weeks, two 30-minute sessions a week",
      "Maintains skills after summer break",
      "Speaking confidence & revision activities",
      "Runs late August through September",
    ],
  },
];

const PLANS = [...PRIVATE_PLANS, ...GROUP_PLANS];

const FAQ = [
  { q:"Is the trial really free?", a:"Yes, one full class with a teacher, no credit card required." },
  { q:"How do I book my free trial?", a:"Pick a course, tell us your timezone and a time that suits you, and we'll match you with a teacher for one complete class." },
  { q:"What if I've never seen Urdu before?", a:"Perfect. Most students start from the alphabet; we assess and place you correctly." },
  { q:"Can I choose my class times?", a:"Yes. Tell us your timezone and availability and we schedule around you." },
  { q:"Can I reschedule a class?", a:"Yes. With reasonable notice we'll move a 1:1 class to another slot that suits you. Structured courses like GCSE prep follow a fixed weekly schedule, but every session is recorded so you never miss the material." },
  { q:"When does the GCSE Urdu course run?", a:"It's 16 weeks, one 60-minute session a week, on a fixed day and time agreed with your teacher when you enroll." },
  { q:"How do the 1:1 bundles work?", a:"Pick 4, 8, or 12 classes a month — 30 minutes each for kids, 50 minutes each for women. The more you book, the faster you progress, and your teacher plans each month around your goals." },
  { q:"When do the Summer and Back-to-School courses run?", a:"The Summer Urdu Course runs July through mid-August; the Back-to-School Urdu Course runs late August through September. Both are 6 weeks, two 30-minute sessions a week." },
  { q:"Are classes recorded?", a:"Every class is recorded and saved to your dashboard to rewatch anytime." },
  { q:"What are your teachers' qualifications?", a:"Every teacher is a native Urdu speaker with a formal qualification — in Urdu literature, linguistics, or education — plus years of online teaching experience." },
  { q:"Do I get a certificate?", a:"Yes. We track your progress throughout, and learners receive a certificate on completing their course." },
  { q:"What payment methods do you accept?", a:"We accept major credit and debit cards and popular local options. Kids and Women 1:1 are monthly subscriptions; GCSE, Read & Write, Summer, and Back-to-School are a single course fee paid at enrollment." },
  { q:"Do you offer refunds?", a:"If you're not satisfied after your first paid class, contact us within 7 days and we'll refund your payment in full." },
  { q:"Is there a minimum age to start?", a:"Our Kids course welcomes learners from age 5; other courses have no upper age limit." },
  { q:"Do you teach children?", a:"Yes, from age 5, with teachers who specialize in young learners." },
  { q:"How long does it take to learn Urdu?", a:"Most learners hold simple conversations within 3–4 months of weekly classes. Reading and writing fluency take longer and depend on your goals and practice." },
  { q:"Can I switch teachers or change my plan?", a:"Absolutely. You can request a different teacher, or upgrade, downgrade, or pause your 1:1 plan at any time." },
  { q:"Can I cancel anytime?", a:"Kids and Women 1:1 plans are monthly with no long-term contract. GCSE, Read & Write, Summer, and Back-to-School are a one-time enrollment for the full course." },
];

/* ================= about ================= */
const VALUES = [
  { icon: Heart, t:"Warmth first", d:"Language is personal. Every class is patient, judgment-free, and genuinely encouraging — mistakes are how we learn." },
  { icon: Compass, t:"Structure that guides", d:"No aimless chatter. A clear path from your first letter to reading poetry, with progress you can measure." },
  { icon: Users, t:"Real human teachers", d:"Not apps, not bots — native educators who adapt to you, your pace, and your goals every single lesson." },
  { icon: ShieldCheck, t:"Trust & flexibility", d:"Free trials, transparent pricing, class recordings, and cancel-anytime plans. No pressure, ever." },
  { icon: Globe, t:"Built for the diaspora", d:"Timezones from Toronto to Dubai, heritage learners reconnecting with family, and total beginners alike." },
  { icon: Feather, t:"Love of the language", d:"We teach Urdu as a living, beautiful thing — its sounds, its script, its poetry — not just a syllabus." },
];

const MILESTONES = [
  { y:"2019", t:"A single teacher, a few students", d:"Speak in Urdu began as one ustadha teaching cousins abroad over video calls." },
  { y:"2021", t:"A real curriculum", d:"We rebuilt lessons into a structured path — alphabet to fluency — with worksheets and recordings." },
  { y:"2023", t:"A team of natives", d:"Qualified teachers from across Pakistan joined, each with a specialty from kids to GCSE exam preparation." },
  { y:"2026", t:"Thousands of learners", d:"Students in 20+ countries now read, write, and speak Urdu with confidence." },
];

const FOUNDERS = [
  { initials:"RA", name:"Rabia A.", role:"Founder & Head of Curriculum", line:"Started it all teaching family abroad." },
  { initials:"IM", name:"Imran M.", role:"Co-founder & Operations", line:"Keeps timezones and teachers in sync." },
  { initials:"NF", name:"Nadia F.", role:"Lead Teacher-Trainer", line:"Coaches every new ustaad who joins." },
];


/* ================= imagery ================= */
/* Central Unsplash map of photo IDs — swap any ID freely. <Photo> builds a
   responsive srcset from each one (see unsplashSrcSet below) so a card
   showing an image at ~350px doesn't download the same 1100px file as a
   full-width banner. Degrades to a branded gradient+pattern fallback if the
   image fails to load. */
const IMG = {
  hero: "1503676260728-1c00da094a0b",
  courses: {
    "kids-1-1": "1503454537195-1dcabb73ffb9",
    "women-1-1": "1522202176988-66273c2fd55f",
    "gcse-urdu-exam-prep": "1512820790803-83ca734da794",
    "read-write-urdu": "1455390582262-044cdead277a",
    "summer-urdu-course": "1506905925346-21bda4d32df4",
    "back-to-school-urdu": "1481627834876-b7833e8f5570",
  },
  aboutBanner: "1507842217343-583bb7270b66",
  contact: "1544787219-7f47ccb76574",
};

const UNSPLASH_WIDTHS = [400, 700, 1100, 1600];
const unsplashUrl = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const unsplashSrcSet = (id) => UNSPLASH_WIDTHS.map((w) => `${unsplashUrl(id, w)} ${w}w`).join(", ");

/* Art directions per subject — always renders, photos enhance on top when available. */
const ART = {
  hero: { word: "اردو", variant: "calli" },
  courses: {
    "kids-1-1": { word: "بچے", variant: "star" },
    "women-1-1": { word: "خواتین", variant: "waves" },
    "gcse-urdu-exam-prep": { word: "امتحان", variant: "geo" },
    "read-write-urdu": { word: "پڑھنا", variant: "arch" },
    "summer-urdu-course": { word: "گرمی", variant: "rays" },
    "back-to-school-urdu": { word: "اسکول", variant: "calli" },
  },
  aboutBanner: { word: "ہماری کہانی", variant: "calli" },
  contact: { word: "رابطہ", variant: "rays" },
};

const starPts = (cx, cy, ro, ri, n = 8) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 ? ri : ro;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");


const NAV = [
  { label:"Home", type:"route", target:"home" },
  { label:"Courses", type:"route", target:"courses" },
  { label:"Pricing", type:"route", target:"pricing" },
  { label:"How to Pay", type:"route", target:"payment" },
  { label:"Blog", type:"external", target:"/blog" },
  { label:"About", type:"route", target:"about" },
  { label:"Contact", type:"route", target:"contact" },
];

/* ================= routing ================= *
 * The blog lives outside this router entirely — /blog and /blog/<slug> are
 * PHP pages rendered straight from the database (see public/blog.php),
 * intercepted by Apache before they ever reach this SPA. That's what lets a
 * client publish a post from /admin.php and have it live immediately,
 * without a rebuild. See NAV above: the Blog link is a real page load. */
const Nav = createContext(null);
const useNav = () => useContext(Nav);

const ROUTE_PATH = { home: "/", courses: "/courses", pricing: "/pricing", payment: "/payment", about: "/about", contact: "/contact" };
const routePath = (name) => ROUTE_PATH[name] || "/";
const coursePath = (slug) => `/courses/${slug}`;

function parsePath(pathname) {
  const p = ((pathname || "/").split("?")[0].split("#")[0]).replace(/\/+$/, "") || "/";
  if (p.startsWith("/courses/")) return { name: "course", slug: p.slice("/courses/".length) };
  if (p === "/courses") return { name: "courses" };
  if (p === "/pricing") return { name: "pricing" };
  if (p === "/payment") return { name: "payment" };
  if (p === "/about") return { name: "about" };
  if (p === "/contact") return { name: "contact" };
  return { name: "home" };
}
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ================= primitives ================= */
function Pattern() {
  return (
    <svg className="mu-pattern" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="mu-geo" width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <rect x="19" y="19" width="26" height="26" />
            <rect x="19" y="19" width="26" height="26" transform="rotate(45 32 32)" />
            <circle cx="32" cy="32" r="4.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mu-geo)" />
    </svg>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`mu-reveal ${inView ? "is-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Stars({ size = 15, animate = false, label }) {
  return (
    <span className="mu-stars" role="img" aria-label={label || "5 out of 5 stars"}>
      {[0,1,2,3,4].map((i) => (
        <Star key={i} size={size} strokeWidth={0}
          className={animate ? "mu-anim-star" : ""}
          style={animate ? { animationDelay: `${i * 90}ms` } : undefined} />
      ))}
    </span>
  );
}

function SectionHeader({ eyebrow, title, lead, center = true, id }) {
  return (
    <Reveal className={center ? "mu-center" : ""}>
      <span className="mu-eyebrow">{eyebrow}</span>
      <h2 className="mu-h2" id={id} style={{ marginTop: 14 }}>{title}</h2>
      {lead && <p className="mu-lead">{lead}</p>}
    </Reveal>
  );
}

/* shared PlanCard used on landing + pricing page */
function PlanCard({ plan, classes = 8, from = false, onCta, headingTag = "h3" }) {
  const Tag = headingTag;
  const flat = plan.kind === "flat";
  let price, note;
  if (flat) {
    price = plan.fee;
    note = `${plan.duration} · ${plan.frequency} · ${plan.minutes} min`;
  } else {
    const perClass = Math.round(plan.prices[4] / 4);
    price = from ? plan.prices[4] : plan.prices[classes];
    note = from
      ? `From $${perClass}/class · ${plan.minutes} min each`
      : `${classes} classes/month · $${perClass}/class · ${plan.minutes} min`;
  }
  return (
    <div className={`mu-plan ${plan.pop ? "pop" : ""}`}>
      {plan.pop && <span className="mu-popbadge"><Sparkles size={13} /> Most Popular</span>}
      <Tag>{plan.name}</Tag>
      <p className="tagline">{plan.tagline}</p>
      <div className="mu-planprice">
        {from && !flat && <span className="mu-fromlbl">from</span>}
        ${price}<small className="mu-currency"> USD</small>{!flat && <small>/mo</small>}
      </div>
      <p className="mu-annnote">{note}</p>
      <ul className="incl">
        {plan.incl.map((x) => <li key={x}><Check size={17} strokeWidth={2.4} /> {x}</li>)}
      </ul>
      <div className="btnwrap">
        <button className={`mu-btn mu-btn-md mu-btn-block ${plan.pop ? "mu-btn-primary" : "mu-btn-ghost"}`} onClick={onCta}>{plan.cta}</button>
        <p className="subnote">{flat ? "Free trial · One-time course fee" : "Free trial · Cancel anytime"}</p>
      </div>
    </div>
  );
}

/* ================= header ================= */
function Header() {
  const { route, goSection, goRoute, goHomeTop, goTrial } = useNav();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handle = (e, item) => {
    if (item.type === "external") { setOpen(false); return; } // let the browser navigate normally
    e.preventDefault();
    setOpen(false);
    item.type === "route" ? goRoute(item.target) : goSection(item.target);
  };
  const isActive = (item) =>
    item.type === "route" && (
      route.name === item.target ||
      (item.target === "courses" && route.name === "course")
    );
  const hrefFor = (item) => item.type === "route" ? routePath(item.target) : (item.type === "external" ? item.target : "/");
  return (
    <header className={`mu-header ${stuck ? "is-stuck" : ""}`}>
      <div className="mu-wrap">
        <nav className="mu-nav" aria-label="Primary">
          <a className="mu-brand" href="/" onClick={(e) => { e.preventDefault(); setOpen(false); goHomeTop(); }}>
            <img className="mu-brand-full" src={logoFullWhite} alt="Speak in Urdu" width="79" height="44" />
          </a>
          <div className="mu-navlinks">
            {NAV.map((n) => (
              <a key={n.label} className={isActive(n) ? "active" : ""}
                href={hrefFor(n)}
                onClick={(e) => handle(e, n)}
                aria-current={isActive(n) ? "page" : undefined}>{n.label}</a>
            ))}
          </div>
          <div className="mu-navright">
            <button className="mu-btn mu-btn-md mu-btn-gold mu-desktop-cta" onClick={goTrial}>Book Free Trial</button>
            <button className="mu-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(v => !v)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        <div className={`mu-mobile ${open ? "open" : ""}`}>
          {NAV.map((n) => (
            <a key={n.label} className="ml" href={hrefFor(n)} onClick={(e) => handle(e, n)}>{n.label}</a>
          ))}
          <button className="mu-btn mu-btn-md mu-btn-gold mu-btn-block" onClick={() => { setOpen(false); goTrial(); }}>Book Free Trial</button>
        </div>
      </div>
    </header>
  );
}

/* ================= landing sections ================= */
const ART_GRADS = {
  calli: ["#3F562E", "#52713D"],
  arch: ["#33461F", "#5E7A45"],
  rays: ["#4A6238", "#6B8A4A"],
  waves: ["#2C3D1E", "#52713D"],
  star: ["#3F562E", "#6B8A4A"],
  geo: ["#33461F", "#52713D"],
};

function ArtScene({ word = "اردو", variant = "geo", icon: Ico }) {
  const gid = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [c1, c2] = ART_GRADS[variant] || ART_GRADS.geo;
  return (
    <span className="mu-art" aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${gid})`} />
        {variant === "calli" && (
          <g fill="none" strokeLinecap="round">
            <path d="M-20 210 C 90 150, 150 260, 260 190 S 420 140, 430 170" stroke="rgba(255,255,255,.13)" strokeWidth="26" />
            <path d="M-20 140 C 120 84, 220 196, 420 104" stroke="rgba(255,255,255,.09)" strokeWidth="10" />
            <path d="M-20 248 C 140 202, 260 282, 430 222" stroke="rgba(201,162,39,.5)" strokeWidth="3" />
          </g>
        )}
        {variant === "arch" && (
          <g fill="none" strokeWidth="2">
            <path d="M120 300 V 176 Q 120 104 200 94 Q 280 104 280 176 V 300" stroke="rgba(255,255,255,.18)" />
            <path d="M88 300 V 168 Q 88 76 200 64 Q 312 76 312 168 V 300" stroke="rgba(255,255,255,.12)" />
            <path d="M56 300 V 160 Q 56 48 200 34 Q 344 48 344 160 V 300" stroke="rgba(201,162,39,.45)" />
          </g>
        )}
        {variant === "rays" && (
          <g>
            <g stroke="rgba(255,255,255,.11)" strokeWidth="2">
              <line x1="400" y1="0" x2="0" y2="36" /><line x1="400" y1="0" x2="0" y2="120" />
              <line x1="400" y1="0" x2="0" y2="216" /><line x1="400" y1="0" x2="40" y2="300" />
              <line x1="400" y1="0" x2="150" y2="300" /><line x1="400" y1="0" x2="255" y2="300" />
              <line x1="400" y1="0" x2="345" y2="300" />
            </g>
            <circle cx="400" cy="0" r="74" fill="rgba(201,162,39,.28)" />
            <circle cx="400" cy="0" r="110" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="2" />
          </g>
        )}
        {variant === "waves" && (
          <g fill="none" strokeWidth="2.5">
            <path d="M-10 198 Q 100 166 200 198 T 410 198" stroke="rgba(255,255,255,.2)" />
            <path d="M-10 230 Q 100 198 200 230 T 410 230" stroke="rgba(255,255,255,.13)" />
            <path d="M-10 262 Q 100 230 200 262 T 410 262" stroke="rgba(201,162,39,.5)" />
          </g>
        )}
        {variant === "star" && (
          <g fill="none" strokeWidth="2">
            <polygon points={starPts(320, 84, 82, 54)} stroke="rgba(255,255,255,.2)" />
            <polygon points={starPts(320, 84, 48, 31)} stroke="rgba(201,162,39,.45)" />
            <circle cx="66" cy="236" r="4" fill="rgba(255,255,255,.3)" />
            <circle cx="104" cy="262" r="3" fill="rgba(201,162,39,.5)" />
            <circle cx="46" cy="196" r="2.5" fill="rgba(255,255,255,.24)" />
          </g>
        )}
        {variant === "geo" && (
          <g fill="none" strokeWidth="2">
            <line x1="-20" y1="300" x2="420" y2="30" stroke="rgba(255,255,255,.07)" strokeWidth="42" />
            <polygon points={starPts(88, 232, 62, 41)} stroke="rgba(255,255,255,.15)" />
            <polygon points={starPts(330, 68, 46, 30)} stroke="rgba(201,162,39,.4)" />
          </g>
        )}
      </svg>
      <span className="mu-art-word mu-urdu">{word}</span>
      {Ico && <span className="mu-art-ico"><Ico size={15} strokeWidth={2} /></span>}
    </span>
  );
}

function Photo({ id, alt = "", ratio, className = "", overlay = false, eager = false, icon: Ico, art, sizes = "100vw" }) {
  const [ok, setOk] = useState(false);
  return (
    <div className={`mu-photo ${ok ? "is-ok" : ""} ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}>
      <ArtScene word={art?.word} variant={art?.variant} icon={Ico} />
      {id && (
        <img src={unsplashUrl(id, 1100)} srcSet={unsplashSrcSet(id)} sizes={sizes}
          alt={alt} loading={eager ? "eager" : "lazy"} decoding="async"
          onLoad={() => setOk(true)} onError={() => setOk(false)} />
      )}
      {overlay && ok && <span className="mu-photo-ov" aria-hidden="true" />}
    </div>
  );
}

function Hero() {
  const { goTrial, goRoute } = useNav();
  return (
    <section className="mu-hero" id="home">
      <Pattern />
      <div className="mu-wrap">
        <div className="mu-hero-inner">
          <Reveal>
            <span className="mu-eyebrow">Live 1-on-1 online classes • Native teachers</span>
            <h1>Learn Urdu the way it's meant to be spoken.</h1>
            <p className="mu-lead">Read, write, and speak beautiful Urdu with native teachers — structured courses, live classes, and weekly progress you can actually feel.</p>
            <div className="mu-hero-ctas">
              <button className="mu-btn mu-btn-lg mu-btn-primary" onClick={goTrial}>Book a Free Trial <ArrowRight size={18} /></button>
              <a className="mu-btn mu-btn-lg mu-btn-ghost" href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}>Explore Courses</a>
            </div>
            <div className="mu-trustrow">
              <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                <Stars size={15} animate label="Rated 4.9 out of 5" /> 4.9/5 from 1,200+ learners
              </span>
              <span className="dot" aria-hidden="true" />
              <span>Students in 40+ countries</span>
              <span className="dot" aria-hidden="true" />
              <span>100% native teachers</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mu-visual" aria-hidden="true">
              <Photo className="mu-visual-photo" id={IMG.hero} art={ART.hero} ratio="4 / 5" overlay eager icon={BookOpen} sizes="300px" />
              <span className="mu-visual-urdu mu-urdu">اردو</span>
              <div className="mu-vcard">
                <div className="row1">
                  <span className="label">Today's lesson</span>
                  <span className="mu-live"><span className="pulse" /> Live class</span>
                </div>
                <h3 style={{ fontSize:20, marginBottom:4 }}>The Urdu Alphabet</h3>
                <p style={{ color:"var(--muted)", fontSize:14 }}>Lesson 3 of 12 · Reading foundations</p>
                <div className="mu-letters">
                  <span className="mu-letter">ا</span><span className="mu-letter">ب</span>
                  <span className="mu-letter hot">پ</span><span className="mu-letter">ت</span>
                </div>
                <div className="mu-prog"><span /></div>
                <div className="progmeta"><span>Progress this week</span><span>68%</span></div>
              </div>
              <div className="mu-chip rating">
                <span className="big">4.9</span>
                <span>
                  <Stars size={13} label="4.9 star rating" />
                  <span style={{ display:"block", fontSize:12, color:"var(--muted)", marginTop:2 }}>1,200+ reviews</span>
                </span>
              </div>
              <div className="mu-chip wk">
                <span className="t">This week</span>
                <span className="v"><Award size={15} /> 3 lessons</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="mu-trustbar" aria-label="Academy at a glance">
      <div className="mu-wrap">
        <div className="grid">
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 60}>
              <div className="mu-stat"><div className="n">{s.n}</div><div className="l">{s.l}</div></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="mu-section" aria-labelledby="why-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="Why Master Urdu" title="A warmer, more human way to learn Urdu."
          lead="Everything is built around live teaching, real feedback, and steady progress you can see." />
        <div className="mu-grid cols3">
          {WHY.map((w, i) => {
            const Icon = w.icon;
            return (
              <Reveal key={w.t} delay={(i % 3) * 90}>
                <article className="mu-card">
                  <div className="mu-ico"><Icon size={24} strokeWidth={1.8} /></div>
                  <h3 id={i===0 ? "why-h" : undefined}>{w.t}</h3>
                  <p>{w.d}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* reusable course card (landing + courses page) */
function CourseCard({ c, showDetail = true, headingTag = "h3" }) {
  const { goCourse, goTrial } = useNav();
  const Icon = c.icon;
  const Tag = headingTag;
  const flat = c.pricingType === "flat";
  return (
    <article className="mu-card mu-course">
      <Photo className="mu-course-media" id={IMG.courses[c.slug]} art={ART.courses[c.slug]} alt="" ratio="16 / 9" overlay icon={Icon} sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 380px" />
      <div className="top">
        <div className="mu-ico" style={{ marginBottom:0 }}><Icon size={22} strokeWidth={1.8} /></div>
        <span className="mu-meta">{c.meta}</span>
      </div>
      <Tag>{c.name}</Tag>
      <p className="desc" style={{ color:"var(--muted)" }}>{c.desc}</p>
      <div className="mu-featlabel">{c.featuresLabel}</div>
      <ul className="mu-bullets">
        {c.features.map((b) => <li key={b}><Check size={16} strokeWidth={2.4} /> {b}</li>)}
      </ul>
      <div className="foot">
        <span className="mu-price">
          {!flat && <small>From</small>}
          {c.price}
          <small className="mu-currency" style={{ display:"inline", textTransform:"none", letterSpacing:0, marginLeft:2 }}> USD{c.unit}</small>
        </span>
        <div className="links">
          {showDetail && <a className="mu-textlink" href={coursePath(c.slug)} onClick={(e) => { e.preventDefault(); goCourse(c.slug); }} aria-label={`Details for ${c.name}`}>Details <ArrowRight size={15} /></a>}
          <button className="mu-btn mu-btn-md mu-btn-ghost" onClick={() => goTrial(c.slug)}>{c.ctaLabel}</button>
        </div>
      </div>
    </article>
  );
}

function CoursesSection() {
  const { goRoute } = useNav();
  return (
    <section className="mu-section" id="courses" style={{ background:"var(--card)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }} aria-labelledby="courses-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="Courses" title="Find the path that fits you."
          lead="Structured tracks for every age and goal — private 1:1 classes plus seasonal and exam-focused courses." />
        <div className="mu-grid cols3">
          {COURSES.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 90}>
              <CourseCard c={c} headingTag={i===0 ? "h3" : "h3"} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mu-center" >
          <div style={{ marginTop:34 }}>
            <a className="mu-btn mu-btn-lg mu-btn-ghost" href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}>
              View all courses & syllabus <ArrowRight size={18} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mu-section" id="how" aria-labelledby="how-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="How it works" title="From first hello to fluent — in five steps."
          lead="A simple, guided start. You'll be in your first live class this week." />
        <div className="mu-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 80}>
              <div className="mu-step">
                <span className="num" aria-hidden="true">{i + 1}</span>
                <h3 id={i===0 ? "how-h" : undefined}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = TESTIMONIALS.length;
  const go = useCallback((next) => setI(((next % n) + n) % n), [n]);
  useEffect(() => {
    if (reducedMotion() || paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);
  const onKey = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
  };
  return (
    <section className="mu-section mu-testi" id="reviews" aria-labelledby="rev-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="Loved by learners" title="Stories from our students." lead={null} />
        <span id="rev-h" className="mu-sr">Student reviews</span>
        <div className="mu-testi-track-wrap" style={{ marginTop: 40 }}
          role="region" aria-roledescription="carousel" aria-label="Student testimonials"
          tabIndex={0} onKeyDown={onKey}
          onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className="mu-testi-track" style={{ transform: `translateX(-${i * 100}%)` }}>
            {TESTIMONIALS.map((t, idx) => (
              <div className="mu-testi-slide" key={t.a} aria-hidden={idx !== i}>
                <figure className="mu-quotecard">
                  <Quote className="qmark" size={30} strokeWidth={0} style={{ fill:"var(--gold)" }} />
                  <blockquote>“{t.q}”</blockquote>
                  <figcaption><cite>— {t.a}</cite></figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
        <div className="mu-testi-controls">
          <button className="mu-arrow" onClick={() => go(i - 1)} aria-label="Previous testimonial"><ChevronLeft size={20} /></button>
          <div className="mu-dots" role="tablist" aria-label="Choose testimonial">
            {TESTIMONIALS.map((t, idx) => (
              <button key={t.a} className={`mu-dot ${idx === i ? "on" : ""}`} onClick={() => go(idx)}
                role="tab" aria-selected={idx === i} aria-label={`Testimonial ${idx + 1} of ${n}`} />
            ))}
          </div>
          <button className="mu-arrow" onClick={() => go(i + 1)} aria-label="Next testimonial"><ChevronRight size={20} /></button>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { goRoute, goTrial } = useNav();
  return (
    <section className="mu-section" id="pricing" style={{ background:"var(--card)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }} aria-labelledby="price-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="Pricing" title="Simple plans, real teachers."
          lead="Private 1:1 tuition for kids and women, plus structured courses like GCSE exam prep — each with a free trial." />
        <div className="mu-pricing-grid">
          {PLANS.slice(0, 3).map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <PlanCard plan={p} from onCta={() => goTrial(p.courseSlug)} headingTag="h3" />
            </Reveal>
          ))}
        </div>
        <Reveal className="mu-center">
          <div style={{ marginTop:32 }}>
            <a className="mu-textlink" href={routePath("pricing")} onClick={(e) => { e.preventDefault(); goRoute("pricing"); }}>See bundles & compare plans <ArrowRight size={16} /></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FaqItem({ item, open, onToggle, id }) {
  return (
    <div className="mu-faq-item">
      <button className="mu-faq-q" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
        {item.q}
        <span className="ic" aria-hidden="true"><ChevronDown size={18} /></span>
      </button>
      <div className={`mu-faq-a ${open ? "open" : ""}`} id={`${id}-a`} role="region" aria-labelledby={`${id}-q`}>
        <div className="inner">{item.a}</div>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mu-section" aria-labelledby="faq-h">
      <div className="mu-wrap">
        <SectionHeader eyebrow="Questions" title="Everything you might be wondering." lead={null} />
        <span id="faq-h" className="mu-sr">Frequently asked questions</span>
        <Reveal>
          <div className="mu-faq">
            {FAQ.map((f, i) => (
              <FaqItem key={f.q} id={`faq-${i}`} item={f} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  const { goTrial } = useNav();
  return (
    <section className="mu-wrap" id="final" style={{ paddingTop: 8 }}>
      <Reveal>
        <div className="mu-final mu-on-dark">
          <Pattern />
          <div className="flourish mu-urdu" aria-hidden="true">اردو</div>
          <h2>Your first Urdu conversation is closer than you think.</h2>
          <p>Book a free trial today — meet your teacher, no card required.</p>
          <button className="mu-btn mu-btn-lg mu-btn-gold" style={{ position:"relative" }} onClick={goTrial}>Book a Free Trial <ArrowRight size={18} /></button>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const { goSection, goRoute, goCourse } = useNav();
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState("idle"); // idle | submitting | done | error
  const subscribe = async () => {
    if (!email.trim() || newsStatus === "submitting") return;
    setNewsStatus("submitting");
    const eventId = newEventId(); // shared with newsletter.php's own CAPI call, for dedup
    try {
      const body = new URLSearchParams({ email, eventId });
      const res = await fetch("/newsletter.php", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      const data = await res.json().catch(() => ({ success: res.ok }));
      if (res.ok && data.success !== false) {
        setNewsStatus("done");
        setEmail("");
        trackEvent("Subscribe", undefined, eventId);
      } else {
        setNewsStatus("error");
      }
    } catch {
      setNewsStatus("error");
    }
  };
  return (
    <footer className="mu-footer mu-on-dark">
      <Pattern />
      <div className="mu-wrap">
        <div className="mu-footcols">
          <div className="mu-footbrand">
            <div className="mu-brand">
              <img className="mu-brand-full" src={logoFullWhite} alt="Speak in Urdu" width="79" height="44" />
            </div>
            <p>Live 1-on-1 Urdu classes with native teachers. Read, write, and speak beautiful Urdu — from your first letter to exam success.</p>
            <div className="mu-socials">
              <a href="https://www.instagram.com/speakinurdu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/profile.php?id=61590513969029" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="https://www.youtube.com/@SpeakinUrdu" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>
          <div className="mu-footcol">
            <h3>Courses</h3>
            {COURSES.map((c) => (
              <a key={c.slug} className="fl" href={coursePath(c.slug)} onClick={(e) => { e.preventDefault(); goCourse(c.slug); }}>{c.name}</a>
            ))}
          </div>
          <div className="mu-footcol">
            <h3>Academy</h3>
            <a className="fl" href={routePath("about")} onClick={(e) => { e.preventDefault(); goRoute("about"); }}>About Us</a>
            <a className="fl" href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}>All Courses</a>
            <a className="fl" href={routePath("pricing")} onClick={(e) => { e.preventDefault(); goRoute("pricing"); }}>Pricing</a>
            <a className="fl" href={routePath("payment")} onClick={(e) => { e.preventDefault(); goRoute("payment"); }}>How to Pay</a>
            <a className="fl" href="/blog">Blog</a>
            <a className="fl" href={routePath("contact")} onClick={(e) => { e.preventDefault(); goRoute("contact"); }}>Contact</a>
            <button className="fl" onClick={() => goSection("how")}>How It Works</button>
          </div>
          <div className="mu-footcol">
            <h3>Stay in touch</h3>
            <p style={{ color:"#C9C0AE", fontSize:14, margin:0 }}>Study tips and new courses, now and then.</p>
            <div className="mu-news">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" aria-label="Email address for newsletter"
                onKeyDown={(e) => { if (e.key === "Enter") subscribe(); }} />
              <button className="mu-btn mu-btn-md mu-btn-gold" onClick={subscribe} disabled={newsStatus === "submitting"}>
                {newsStatus === "submitting" ? "…" : "Subscribe"}
              </button>
            </div>
            {newsStatus === "done" && <p style={{ color:"var(--gold-soft)", fontSize:13.5, marginTop:10 }}>Thanks — you're on the list.</p>}
            {newsStatus === "error" && <p style={{ color:"#e08a7d", fontSize:13.5, marginTop:10 }}>Something went wrong — please try again.</p>}
          </div>
        </div>
        <div className="mu-footbottom">
          <span>© 2026 Speak in Urdu. All rights reserved.</span>
          <span className="mu-urdu" aria-hidden="true">اردو سیکھیں</span>
        </div>
      </div>
    </footer>
  );
}

/* ================= pages ================= */
function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <WhyChooseUs />
      <CoursesSection />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <Faq />
      <FinalCta />
    </>
  );
}

function PageHero({ crumb, eyebrow, title, lead, children }) {
  const { goHomeTop } = useNav();
  return (
    <section className="mu-pagehero">
      <Pattern />
      <div className="mu-wrap">
        <div className="mu-crumb">
          <a href="/" onClick={(e) => { e.preventDefault(); goHomeTop(); }}>Home</a>
          {crumb.map((c, i) => (
            <React.Fragment key={i}>
              <span className="sep" aria-hidden="true">/</span>
              {c.onClick ? <a href="#" onClick={(e) => { e.preventDefault(); c.onClick(); }}>{c.label}</a> : <span className="cur" aria-current="page">{c.label}</span>}
            </React.Fragment>
          ))}
        </div>
        <Reveal>
          <span className="mu-eyebrow">{eyebrow}</span>
          <h1 className="mu-h2" style={{ marginTop:14, fontSize:"clamp(30px,5vw,48px)" }}>{title}</h1>
          {lead && <p className="mu-lead">{lead}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

function CoursesPage() {
  return (
    <>
      <PageHero
        crumb={[{ label:"Courses" }]}
        eyebrow="Courses"
        title="Every course, in full."
        lead="Six structured tracks for every age and goal — private 1:1 classes plus seasonal and exam-focused courses."
      />
      <section className="mu-section" style={{ paddingTop:64 }}>
        <div className="mu-wrap">
          <div className="mu-grid cols3" style={{ marginTop:0 }}>
            {COURSES.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 90}>
                <CourseCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function CourseDetailPage({ slug }) {
  const { goRoute, goTrial } = useNav();
  const c = COURSE_BY_SLUG[slug];
  if (!c) {
    return (
      <section className="mu-section">
        <div className="mu-wrap mu-center">
          <h1 className="mu-h2">Course not found</h1>
          <p className="mu-lead">We couldn't find that course. Browse the full list instead.</p>
          <div style={{ marginTop:24 }}>
            <a className="mu-btn mu-btn-lg mu-btn-primary" href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}>View all courses</a>
          </div>
        </div>
      </section>
    );
  }
  const Icon = c.icon;
  const flat = c.pricingType === "flat";
  return (
    <>
      <section className="mu-pagehero">
        <Pattern />
        <div className="mu-wrap">
          <div className="mu-crumb">
            <a href={routePath("home")} onClick={(e) => { e.preventDefault(); goRoute("home"); }}>Home</a>
            <span className="sep" aria-hidden="true">/</span>
            <a href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}>Courses</a>
            <span className="sep" aria-hidden="true">/</span>
            <span className="cur" aria-current="page">{c.name}</span>
          </div>
          <Reveal>
            <div className="mu-detail-head">
              <div className="mu-ico" style={{ width:52, height:52 }}><Icon size={26} strokeWidth={1.8} /></div>
              <h1 style={{ marginTop:14 }}>{c.name}</h1>
              <div className="chips">
                <span className="mu-chiptag"><Video size={14} /> {c.format}</span>
                <span className="mu-chiptag"><Clock size={14} /> {c.lessonLength}</span>
                {flat && <span className="mu-chiptag"><Calendar size={14} /> {c.duration} · {c.frequency}</span>}
                {c.available && <span className="mu-chiptag"><CalendarClock size={14} /> {c.available}</span>}
              </div>
              <p className="mu-lead">{c.desc}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mu-wrap">
        <Photo className="mu-detail-banner" id={IMG.courses[c.slug]} art={ART.courses[c.slug]} alt={`${c.name} — a glimpse of the learning experience`} ratio="24 / 8" overlay icon={Icon} sizes="(max-width: 1200px) 100vw, 1200px" />
      </div>

      <section className="mu-section" style={{ paddingTop:48 }}>
        <div className="mu-wrap">
          <div className="mu-detail-grid">
            <div className="mu-detail-main">
              <Reveal className="mu-block">
                <h2>{c.featuresLabel}</h2>
                <ul className="mu-outcomes">
                  {c.features.map((o) => (
                    <li key={o}><Check size={20} strokeWidth={2.4} /> {o}</li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <aside className="mu-detail-side" aria-label="Course summary">
              <div className="card">
                {flat ? (
                  <div className="price"><span className="from">Course fee</span>{c.price}<small className="mu-currency"> USD</small><small>{c.unit}</small></div>
                ) : (
                  <>
                    <div className="price"><span className="from">From</span>{c.price}<small className="mu-currency"> USD</small><small>{c.unit}</small></div>
                    <ul className="mu-tierlist">
                      {c.tiers.map((t) => (
                        <li key={t.lessons}><span>{t.lessons} lessons/mo</span><b>${t.price} USD</b></li>
                      ))}
                    </ul>
                  </>
                )}
                <ul className="mu-facts">
                  <li><span className="k"><Video size={15} /> Format</span><span className="v">{c.format}</span></li>
                  <li><span className="k"><Clock size={15} /> Lesson length</span><span className="v">{c.lessonLength}</span></li>
                  {flat && <li><span className="k"><Calendar size={15} /> Duration</span><span className="v">{c.duration}</span></li>}
                  {flat && <li><span className="k"><Repeat size={15} /> Frequency</span><span className="v">{c.frequency}</span></li>}
                </ul>
                <div className="mu-side-cta">
                  <button className="mu-btn mu-btn-md mu-btn-primary mu-btn-block" onClick={() => goTrial(c.slug)}>{c.ctaLabel}</button>
                  <a className="mu-btn mu-btn-md mu-btn-ghost mu-btn-block" href={routePath("pricing")} onClick={(e) => { e.preventDefault(); goRoute("pricing"); }}>View plans & pricing</a>
                </div>
              </div>
              <div style={{ marginTop:16 }}>
                <a className="mu-textlink" href={routePath("courses")} onClick={(e) => { e.preventDefault(); goRoute("courses"); }}><ArrowLeft size={16} /> Back to all courses</a>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function PricingPage() {
  const { goTrial, goRoute } = useNav();
  const [classes, setClasses] = useState(8);
  return (
    <>
      <PageHero
        crumb={[{ label:"Pricing" }]}
        eyebrow="Pricing"
        title="Private classes and structured courses."
        lead="Private 1:1 tuition for kids and women, plus structured group courses like GCSE exam prep. Every plan includes a free trial."
      >
        <div className="mu-billing">
          <span className="mu-billing-label">Classes per month for 1:1 plans</span>
          <div className="mu-billing-toggle" role="group" aria-label="Classes per month for one-to-one plans">
            {CLASS_TIERS.map((n) => (
              <button key={n} className={classes === n ? "on" : ""} onClick={() => setClasses(n)} aria-pressed={classes === n}>{n} classes</button>
            ))}
          </div>
        </div>
      </PageHero>

      <div className="mu-wrap">
        <Reveal>
          <a className="mu-paybanner" href={routePath("payment")} onClick={(e) => { e.preventDefault(); goRoute("payment"); }}>
            <span className="mu-paybanner-icon"><Globe size={22} /></span>
            <span className="mu-paybanner-text">
              <strong>Paying from abroad?</strong>
              <span>See our step-by-step guides for Remitly, Taptap Send &amp; Western Union.</span>
            </span>
            <span className="mu-paybanner-cta">How to pay <ArrowRight size={16} /></span>
          </a>
        </Reveal>
      </div>

      <section className="mu-section" style={{ paddingTop:32 }} aria-labelledby="priv-h">
        <div className="mu-wrap">
          <SectionHeader eyebrow="Private 1:1 classes" title="One-to-one, paced around you." lead={null} id="priv-h" />
          <div className="mu-pricing-grid cols2">
            {PRIVATE_PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <PlanCard plan={p} classes={classes} onCta={() => goTrial(p.courseSlug)} headingTag="h2" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mu-section" style={{ paddingTop:0 }} aria-labelledby="group-h">
        <div className="mu-wrap">
          <SectionHeader eyebrow="Group courses" title="Structured, exam-focused, seasonal." lead={null} id="group-h" />
          <div className="mu-pricing-grid cols4">
            {GROUP_PLANS.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <PlanCard plan={p} onCta={() => goTrial(p.courseSlug)} headingTag="h2" />
              </Reveal>
            ))}
          </div>
          <Reveal className="mu-center">
            <div style={{ marginTop:32 }}>
              <button className="mu-btn mu-btn-lg mu-btn-primary" onClick={goTrial}>Start with a free trial <ArrowRight size={18} /></button>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

/* ================= payment ================= */
const PAYMENT_METHODS = [
  {
    id: "remitly",
    name: "Remitly",
    tagline: "Best for Canada, USA, UK, Australia, and many other countries",
    about: "Remitly is an international money transfer service that lets you send money safely and quickly to Pakistan, with competitive exchange rates and multiple payment methods.",
    steps: [
      "Download the Remitly app or visit the official Remitly website and sign up using your email address.",
      "Verify your identity — Remitly may ask for this, depending on your country and transfer amount.",
      "Choose Pakistan as the receiving country.",
      "Enter the amount you wish to send for your Urdu lessons.",
      "Select the delivery method: bank deposit.",
      "Enter the recipient's name and payment information exactly as provided by the Speak in Urdu team.",
      "Review all the information carefully before confirming your transfer.",
      "Email or message us your full name, the transfer reference number, the amount sent, and the payment date.",
    ],
    tips: [
      "Always verify the recipient details before sending.",
      "Keep your transfer receipt until your payment has been confirmed.",
      "Contact us if you have any questions before making your payment.",
    ],
  },
  {
    id: "taptap",
    name: "Taptap Send",
    tagline: "One of the fastest ways to send money internationally",
    about: "Taptap Send is a secure money transfer service for sending money to family members, businesses, and individuals in various countries, including Pakistan.",
    steps: [
      "Install the Taptap Send app from your device's app store.",
      "Create your account using your mobile number and complete the required verification.",
      "Choose Pakistan as the destination country.",
      "Enter the amount for your Urdu lesson payment.",
      "Enter the recipient information exactly as provided by the Speak in Urdu team.",
      "Pay using your debit card, bank account, or another payment method available in your country.",
      "Review all information carefully and send your payment.",
      "Send us your name, the payment amount, the transaction reference, and a screenshot or receipt (optional but helpful).",
    ],
    tips: [
      "If you're unsure about any step, contact us before sending your payment.",
      "We'll confirm your payment as soon as it arrives.",
    ],
  },
  {
    id: "westernunion",
    name: "Western Union",
    tagline: "A trusted international transfer service, available almost anywhere",
    about: "Western Union has been a trusted international money transfer service for many years, available through its website, mobile app, or local agent locations.",
    steps: [
      "Visit the Western Union website or download the mobile app and create an account.",
      "Choose Pakistan as the country where you are sending the payment.",
      "Enter the lesson fee you wish to pay.",
      "Select the delivery method — preferably bank deposit; if that's not available, cash pickup also works.",
      "Carefully enter the recipient's full name and payment details exactly as provided by the Speak in Urdu team.",
      "Pay using your preferred payment method and submit the transfer.",
      "Save the Money Transfer Control Number (MTCN) Western Union gives you — keep it safe.",
      "Send us your full name, the MTCN, the amount sent, and the date of transfer.",
    ],
    tips: [
      "Double-check all recipient information before sending.",
      "Keep your receipt until your payment has been confirmed.",
      "Contact us if you need assistance before making your transfer.",
    ],
  },
];

function PaymentPage() {
  const { goTrial, goRoute } = useNav();
  const [active, setActive] = useState(PAYMENT_METHODS[0].id);
  const method = PAYMENT_METHODS.find((m) => m.id === active);

  return (
    <>
      <PageHero
        crumb={[{ label:"Payment" }]}
        eyebrow="Paying from abroad"
        title="How to pay for your lessons."
        lead="We accept international bank transfers from Canada, the USA, the UK, Australia, and many other countries. Pick whichever service works best where you live."
      />

      <section className="mu-section" style={{ paddingTop:56 }}>
        <div className="mu-wrap">
          <div className="mu-paymethods" role="tablist" aria-label="Payment method">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.id} role="tab" aria-selected={active === m.id}
                className={active === m.id ? "on" : ""} onClick={() => setActive(m.id)}>
                {m.name}
              </button>
            ))}
          </div>

          <Reveal key={method.id}>
            <div className="mu-paycard">
              <h2>{method.name}</h2>
              <p className="tagline">{method.tagline}</p>
              <p className="about">{method.about}</p>

              <div className="mu-paysteps">
                {method.steps.map((s, i) => (
                  <div className="mu-paystep" key={i}>
                    <span className="num">{i + 1}</span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>

              <div className="mu-paytips">
                <h3>Tips for a smooth payment</h3>
                <ul>
                  {method.tips.map((t) => <li key={t}><Check size={15} strokeWidth={2.4} /> {t}</li>)}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mu-paynote">
              <ShieldCheck size={22} />
              <div>
                <h3>We don't publish recipient bank details publicly</h3>
                <p>For your security, the exact recipient name and account details are shared directly once you book a trial or get in touch — never posted openly on the website.</p>
                <div className="btns">
                  <button className="mu-btn mu-btn-md mu-btn-primary" onClick={goTrial}>Book a Free Trial</button>
                  <a className="mu-btn mu-btn-md mu-btn-ghost" href={routePath("contact")} onClick={(e) => { e.preventDefault(); goRoute("contact"); }}>Contact Us</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

/* ================= app ================= */
/* ================= about page ================= */
function AboutPage() {
  const { goTrial } = useNav();
  return (
    <>
      <PageHero
        crumb={[{ label:"About" }]}
        eyebrow="Our story"
        title="We built the Urdu school we wished existed."
        lead="Speak in Urdu is a small team of native teachers on a simple mission: help anyone, anywhere, read, write, and speak Urdu — with warmth and real structure."
      />

      <div className="mu-wrap">
        <Photo className="mu-detail-banner" id={IMG.aboutBanner} art={ART.aboutBanner} alt="A calm study space with books and warm light" ratio="24 / 8" overlay icon={BookOpen} sizes="(max-width: 1200px) 100vw, 1200px" />
      </div>

      {/* mission + story */}
      <section className="mu-section" style={{ paddingTop:64 }} aria-labelledby="about-mission">
        <div className="mu-wrap">
          <div className="mu-about-split">
            <Reveal>
              <div>
                <span className="mu-eyebrow">Our mission</span>
                <h2 className="mu-h2" id="about-mission" style={{ marginTop:14 }}>Keep a beautiful language alive — one learner at a time.</h2>
                <p className="mu-lead" style={{ maxWidth:"none" }}>
                  For millions in the diaspora, Urdu is the sound of home: grandparents, poetry, film songs, the language of the heart. Yet good, patient teaching is hard to find far from home. We exist to close that gap — with live human teachers, a clear path, and no gimmicks.
                </p>
                <div className="mu-about-stats">
                  {STATS.map((s) => (
                    <div key={s.l} className="stat"><span className="n">{s.n}</span><span className="l">{s.l}</span></div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="mu-about-timeline" aria-label="Our journey">
                {MILESTONES.map((m) => (
                  <div key={m.y} className="mu-mile">
                    <div className="yr">{m.y}</div>
                    <div className="body">
                      <h3>{m.t}</h3>
                      <p>{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="mu-section" style={{ background:"var(--card)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }} aria-labelledby="about-values">
        <div className="mu-wrap">
          <SectionHeader center eyebrow="What we believe" title="Values that shape every class." id="about-values"
            lead="These aren't wall posters. They're how we hire teachers, design lessons, and treat every learner." />
          <div className="mu-grid cols3">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={(i % 3) * 90}>
                <article className="mu-card">
                  <div className="mu-ico"><v.icon size={22} strokeWidth={1.8} /></div>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* small team */}
      <section className="mu-section" aria-labelledby="about-team">
        <div className="mu-wrap">
          <SectionHeader center eyebrow="The team behind it" title="Small team, big obsession." id="about-team"
            lead="A handful of people who care a great deal — supported by our full roster of native teachers." />
          <div className="mu-grid cols3">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={(i % 3) * 90}>
                <article className="mu-card mu-teamcard">
                  <div className="mu-avatar" role="img" aria-label={`Portrait of ${f.name}`}>{f.initials}</div>
                  <h3>{f.name}</h3>
                  <div className="role">{f.role}</div>
                  <p>{f.line}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:40, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="mu-btn mu-btn-lg mu-btn-primary" onClick={goTrial}>Book a Free Trial <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

/* ================= contact ================= */
const TIMEZONES = [
  "Select your timezone…",
  "PST — Los Angeles / Vancouver (UTC−8)",
  "MST — Denver / Phoenix (UTC−7)",
  "CST — Chicago (UTC−6)",
  "EST — New York / Toronto (UTC−5)",
  "GMT — London (UTC+0)",
  "CET — Berlin / Paris (UTC+1)",
  "GST — Dubai (UTC+4)",
  "PKT — Karachi / Lahore (UTC+5)",
  "AEST — Sydney (UTC+10)",
];

const COUNTRIES = [
  "Select your country…",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Chad", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia", "Denmark", "Djibouti", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea", "Guyana", "Haiti",
  "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius",
  "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Sierra Leone",
  "Singapore", "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe", "Other",
];

function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", tz:TIMEZONES[0], message:"", website:"" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please tell us your name.";
    if (!form.email.trim()) er.email = "We need an email to reply.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "That email doesn't look right.";
    if (form.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) er.phone = "That phone number doesn't look right.";
    if (!form.message.trim()) er.message = "Add a short message so we can help.";
    return er;
  };
  const submit = async () => {
    if (form.website) return; // honeypot
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    setStatus("submitting");
    const eventId = newEventId(); // shared with contact.php's own CAPI call, for dedup
    try {
      const body = new URLSearchParams({ name: form.name, email: form.email, phone: form.phone, tz: form.tz, message: form.message, eventId });
      const res = await fetch("/contact.php", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      const data = await res.json().catch(() => ({ success: res.ok }));
      if (res.ok && data.success !== false) {
        setStatus("sent");
        setForm({ name:"", email:"", phone:"", tz:TIMEZONES[0], message:"", website:"" });
        trackEvent("Contact", undefined, eventId);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        crumb={[{ label:"Contact" }]}
        eyebrow="Say salaam"
        title="Let's talk about your Urdu."
        lead="Questions about courses, scheduling, or your free trial? Send a message and a real human replies — usually within a day."
      />

      <section className="mu-section" style={{ paddingTop:56 }}>
        <div className="mu-wrap">
          <div className="mu-contact-grid">
            {/* form */}
            <Reveal>
              <div className="mu-card mu-formcard">
                <h2 className="mu-h3">Send us a message</h2>
                {status === "sent" ? (
                  <div className="mu-sent" role="status">
                    <div className="ic"><Check size={22} /></div>
                    <h3>Shukriya! Your message is on its way.</h3>
                    <p>We've received it and will reply by email shortly. For anything urgent, use the chat bubble in the corner.</p>
                    <button className="mu-btn mu-btn-md mu-btn-ghost" onClick={() => setStatus("idle")}>Send another</button>
                  </div>
                ) : (
                  <div className="mu-form" noValidate>
                    <div className="mu-field">
                      <label htmlFor="cf-name">Your name</label>
                      <input id="cf-name" type="text" value={form.name} onChange={set("name")}
                        placeholder="e.g. Sara Ahmed" aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "cf-name-err" : undefined} />
                      {errors.name && <span className="err" id="cf-name-err">{errors.name}</span>}
                    </div>
                    <div className="mu-field">
                      <label htmlFor="cf-email">Email</label>
                      <input id="cf-email" type="email" value={form.email} onChange={set("email")}
                        placeholder="you@email.com" aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "cf-email-err" : undefined} />
                      {errors.email && <span className="err" id="cf-email-err">{errors.email}</span>}
                    </div>
                    <div className="mu-field">
                      <label htmlFor="cf-phone">Phone number <span className="hint-plain">(optional)</span></label>
                      <input id="cf-phone" type="tel" value={form.phone} onChange={set("phone")}
                        placeholder="e.g. +92 300 1234567" aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "cf-phone-err" : undefined} />
                      {errors.phone && <span className="err" id="cf-phone-err">{errors.phone}</span>}
                    </div>
                    <div className="mu-field">
                      <label htmlFor="cf-tz">Preferred timezone</label>
                      <div className="mu-selectwrap">
                        <select id="cf-tz" value={form.tz} onChange={set("tz")}>
                          {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown size={18} aria-hidden="true" />
                      </div>
                      <span className="hint">Helps us suggest class times that suit you.</span>
                    </div>
                    <div className="mu-field">
                      <label htmlFor="cf-msg">Message</label>
                      <textarea id="cf-msg" rows={5} value={form.message} onChange={set("message")}
                        placeholder="Tell us your goals, questions, or which course you're curious about."
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "cf-msg-err" : undefined} />
                      {errors.message && <span className="err" id="cf-msg-err">{errors.message}</span>}
                    </div>
                    <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="mu-hp" aria-hidden="true" />
                    {status === "error" && <p className="err" role="alert">Something went wrong sending your message — please try again, or email us directly.</p>}
                    <button type="button" className="mu-btn mu-btn-lg mu-btn-primary mu-btn-block" onClick={submit} disabled={status === "submitting"}>
                      {status === "submitting" ? "Sending…" : <>Send message <Send size={17} /></>}
                    </button>
                    <p className="mu-formnote">By sending, you agree we may email you back. We never share your details.</p>
                  </div>
                )}
              </div>
            </Reveal>

            {/* info */}
            <Reveal delay={120}>
              <div className="mu-contactinfo">
                <Photo className="mu-contact-photo" id={IMG.contact} art={ART.contact} alt="A cozy tea moment — how we like our conversations" ratio="16 / 9" overlay icon={Heart} sizes="(max-width: 900px) 100vw, 500px" />
                <div className="mu-card">
                  <h3 className="mu-h3" style={{ marginBottom:16 }}>Reach us directly</h3>
                  <a className="mu-inforow" href="mailto:info@speakinurdu.com">
                    <span className="ic"><Mail size={18} /></span>
                    <span><span className="k">Email</span><span className="v">info@speakinurdu.com</span></span>
                  </a>
                  <a className="mu-inforow" href="tel:+923275347525">
                    <span className="ic"><Phone size={18} /></span>
                    <span><span className="k">Phone</span><span className="v">+92 327 5347525</span></span>
                  </a>
                  <div className="mu-inforow">
                    <span className="ic"><Clock size={18} /></span>
                    <span><span className="k">Support hours</span><span className="v">Every day, 8am–11pm PKT</span></span>
                  </div>
                  <div className="mu-infosocials">
                    <span className="k">Follow along</span>
                    <div className="mu-socials tight">
                      <a href="https://www.instagram.com/speakinurdu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
                      <a href="https://www.facebook.com/profile.php?id=61590513969029" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
                      <a href="https://www.youtube.com/@SpeakinUrdu" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} /></a>
                      <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><Linkedin size={18} /></a>
                    </div>
                  </div>
                </div>

                {/* map embed placeholder */}
                <div className="mu-map" role="img" aria-label="Map location placeholder — Speak in Urdu is fully online">
                  <Pattern />
                  <div className="mu-map-inner">
                    <span className="pin"><MapPin size={26} /></span>
                    <strong>Map embed placeholder</strong>
                    <span>We're fully online — drop an embedded map here (Google Maps / Mapbox iframe) if you open a physical office.</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= floating whatsapp ================= */
function WhatsAppIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/* ================= chat bot ================= */
const CHAT_KB = [
  ...FAQ.map((f) => ({ q: f.q, a: f.a })),
  ...COURSES.map((c) => ({
    q: `${c.name} price and details`,
    a: `${c.name}: ${c.desc} ${c.pricingType === "flat"
      ? `Cost: ${c.price} USD${c.unit} — ${c.duration}, ${c.frequency}.`
      : `Cost: from ${c.price} USD${c.unit}, depending on how many lessons a month.`} ${c.featuresLabel}: ${c.features.join(", ")}.`,
  })),
  {
    q: "How do I pay for lessons from abroad? Payment methods Remitly Taptap Send Western Union bank transfer international",
    a: `We accept international bank transfers to Pakistan via Remitly, Taptap Send, or Western Union — whichever is available where you live. See the "How to Pay" page (linked in the footer) for step-by-step guides for each. Recipient details are shared privately once you book a trial or contact us, not published on the site.`,
  },
];

function findChatAnswer(query) {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  if (words.length === 0) return null;
  let best = null, bestScore = 0;
  for (const entry of CHAT_KB) {
    const text = (entry.q + " " + entry.a).toLowerCase();
    let score = 0;
    for (const w of words) if (text.includes(w)) score++;
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best : null;
}

const CHAT_SUGGESTIONS = [
  "Is the trial really free?",
  "How much are classes?",
  "What courses do you offer?",
  "Can I choose my class times?",
];

const CHAT_GREETING = "Assalam-o-Alaikum! I can answer quick questions about courses, pricing, and trials. Ask me anything, or pick one below.";

function ChatWidget() {
  const { goTrial, goRoute } = useNav();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: CHAT_GREETING }]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(t); };
  }, [open]);

  const ask = (text) => {
    const q = text.trim();
    if (!q) return;
    const match = findChatAnswer(q);
    setMessages((m) => [
      ...m,
      { from: "user", text: q },
      match
        ? { from: "bot", text: match.a }
        : { from: "bot", text: "I don't have a ready answer for that — here's how to reach a real person:", fallback: true },
    ]);
    setInput("");
  };

  return (
    <div className="mu-chat-root">
      {open && (
        <div className="mu-chat-panel" role="dialog" aria-label="Chat with Speak in Urdu">
          <div className="mu-chat-head">
            <div>
              <b>Speak in Urdu</b>
              <span>Usually answers instantly</span>
            </div>
            <button className="mu-chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={17} /></button>
          </div>
          <div className="mu-chat-list" ref={listRef}>
            {messages.map((m, i) => (
              <div className={`mu-chat-msg ${m.from}`} key={i}>
                <p>{m.text}</p>
                {m.fallback && (
                  <div className="mu-chat-actions">
                    <button onClick={() => { setOpen(false); goTrial(); }}>Book a Free Trial</button>
                    <a href={routePath("contact")} onClick={(e) => { e.preventDefault(); setOpen(false); goRoute("contact"); }}>Contact us</a>
                    <a href="https://wa.me/923275347525" target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon size={14} /> WhatsApp
                    </a>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="mu-chat-suggestions">
                {CHAT_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <form className="mu-chat-input" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question…" />
            <button type="submit" aria-label="Send"><Send size={16} /></button>
          </form>
        </div>
      )}
      <button className="mu-chat-toggle" onClick={() => setOpen((v) => !v)} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollUp = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  return (
    <button className={`mu-totop ${show ? "show" : ""}`} onClick={scrollUp}
      aria-label="Back to top" tabIndex={show ? 0 : -1}>
      <ArrowUp size={20} />
    </button>
  );
}

/* ================= book trial modal ================= */
const emptyBooking = { name:"", email:"", phone:"", age:"", gender:"", country:COUNTRIES[0], timezone:TIMEZONES[0], classTime:"", courseSlug:"", website:"" };

function BookTrialModal({ open, onClose, presetCourseSlug }) {
  const [form, setForm] = useState(emptyBooking);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | sent | error
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyBooking, courseSlug: presetCourseSlug || "" });
    setErrors({});
    setStatus("idle");
    trackEventWithCapi("InitiateCheckout", presetCourseSlug ? { contentName: COURSE_BY_SLUG[presetCourseSlug]?.name, contentCategory: "course", contentId: presetCourseSlug } : undefined);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose, presetCourseSlug]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "Please tell us your name.";
    if (!form.email.trim()) er.email = "We need an email to confirm your trial.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = "That email doesn't look right.";
    if (!form.phone.trim()) er.phone = "Please add a phone number.";
    else if (!/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) er.phone = "That phone number doesn't look right.";
    const age = Number(form.age);
    if (!form.age) er.age = "Please add your age.";
    else if (!Number.isFinite(age) || age < 5 || age > 99) er.age = "Age must be between 5 and 99.";
    if (!form.gender) er.gender = "Please select an option.";
    if (form.country === COUNTRIES[0]) er.country = "Please select your country.";
    if (form.timezone === TIMEZONES[0]) er.timezone = "Please select your timezone.";
    if (!form.courseSlug) er.courseSlug = "Please choose a course.";
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot — bots fill hidden fields, humans never see it
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    setStatus("submitting");
    const eventId = newEventId(); // shared with book-trial.php's own CAPI call, for dedup
    try {
      const body = new URLSearchParams({
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: form.age,
        gender: form.gender,
        country: form.country,
        timezone: form.timezone,
        classTime: form.classTime,
        course: COURSE_BY_SLUG[form.courseSlug]?.name || form.courseSlug,
        eventId,
      });
      const res = await fetch("/book-trial.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json().catch(() => ({ success: res.ok }));
      const ok = res.ok && data.success !== false;
      setStatus(ok ? "sent" : "error");
      if (ok) trackEvent("Lead", { content_name: COURSE_BY_SLUG[form.courseSlug]?.name, content_ids: [form.courseSlug] }, eventId);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mu-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="mu-modal" role="dialog" aria-modal="true" aria-labelledby="booktrial-title">
        <button className="mu-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {status === "sent" ? (
          <div className="mu-sent" role="status">
            <div className="ic"><Check size={22} /></div>
            <h3 id="booktrial-title">Shukriya! Your trial request is in.</h3>
            <p>We'll email you within one business day to confirm your class time.</p>
            <button className="mu-btn mu-btn-md mu-btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="mu-form" onSubmit={submit} noValidate>
            <h3 id="booktrial-title" className="mu-modal-title">Book your free trial</h3>
            <p className="mu-modal-sub">Tell us a bit about you and we'll match you with the right teacher.</p>

            <div className="mu-field-row">
              <div className={`mu-field ${errors.name ? "err" : ""}`}>
                <label htmlFor="bt-name">Full name</label>
                <input id="bt-name" ref={firstFieldRef} type="text" value={form.name} onChange={set("name")} placeholder="e.g. Sara Ahmed" />
                {errors.name && <span className="err">{errors.name}</span>}
              </div>
              <div className={`mu-field ${errors.email ? "err" : ""}`}>
                <label htmlFor="bt-email">Email</label>
                <input id="bt-email" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
                {errors.email && <span className="err">{errors.email}</span>}
              </div>
            </div>

            <div className={`mu-field ${errors.phone ? "err" : ""}`}>
              <label htmlFor="bt-phone">Phone number</label>
              <input id="bt-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="e.g. +92 300 1234567" />
              {errors.phone && <span className="err">{errors.phone}</span>}
            </div>

            <div className="mu-field-row">
              <div className={`mu-field ${errors.age ? "err" : ""}`}>
                <label htmlFor="bt-age">Age</label>
                <input id="bt-age" type="number" min="5" max="99" value={form.age} onChange={set("age")} placeholder="e.g. 27" />
                {errors.age && <span className="err">{errors.age}</span>}
              </div>
              <div className={`mu-field ${errors.gender ? "err" : ""}`}>
                <label htmlFor="bt-gender">Gender</label>
                <div className="mu-selectwrap">
                  <select id="bt-gender" value={form.gender} onChange={set("gender")}>
                    <option value="">Select…</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <ChevronDown size={18} aria-hidden="true" />
                </div>
                {errors.gender && <span className="err">{errors.gender}</span>}
              </div>
            </div>

            <div className={`mu-field ${errors.country ? "err" : ""}`}>
              <label htmlFor="bt-country">Country of residence</label>
              <div className="mu-selectwrap">
                <select id="bt-country" value={form.country} onChange={set("country")}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {errors.country && <span className="err">{errors.country}</span>}
            </div>

            <div className={`mu-field ${errors.timezone ? "err" : ""}`}>
              <label htmlFor="bt-tz">Timezone</label>
              <div className="mu-selectwrap">
                <select id="bt-tz" value={form.timezone} onChange={set("timezone")}>
                  {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {errors.timezone && <span className="err">{errors.timezone}</span>}
            </div>

            <div className="mu-field">
              <label htmlFor="bt-time">Preferred class time</label>
              <input id="bt-time" type="text" value={form.classTime} onChange={set("classTime")} placeholder="e.g. Weekday evenings, 6–8 PM" />
              <span className="hint-plain">Optional — a rough idea is fine, we'll confirm exact times with you.</span>
            </div>

            <div className={`mu-field ${errors.courseSlug ? "err" : ""}`}>
              <label htmlFor="bt-course">Which course?</label>
              <div className="mu-selectwrap">
                <select id="bt-course" value={form.courseSlug} onChange={set("courseSlug")}>
                  <option value="">Select a course…</option>
                  {COURSES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                <ChevronDown size={18} aria-hidden="true" />
              </div>
              {errors.courseSlug && <span className="err">{errors.courseSlug}</span>}
            </div>

            <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="mu-hp" aria-hidden="true" />

            {status === "error" && <p className="err" role="alert">Something went wrong sending your request — please try again, or email us directly.</p>}

            <button type="submit" className="mu-btn mu-btn-lg mu-btn-primary mu-btn-block" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : <>Request Free Trial <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================= SEO ================= */
const SITE_NAME = "Speak in Urdu";
const SITE_TAGLINE = "Learn Urdu Online with Native Teachers";
const SITE_DESC = "Live 1-on-1 online Urdu classes with native teachers. Private lessons for kids and women, plus GCSE exam prep and seasonal Urdu courses, with a free trial class.";
const SITE_URL = "https://speakinurdu.com";

function routePathFor(route) {
  if (route.name === "course") return coursePath(route.slug);
  return routePath(route.name);
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

const orgLD = () => ({
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  description: SITE_DESC,
  url: typeof window !== "undefined" ? window.location.origin + window.location.pathname : "",
  email: "info@speakinurdu.com",
  telephone: "+923275347525",
});

const courseLD = (c) => ({
  "@type": "Course",
  name: c.name,
  description: c.desc,
  provider: { "@type": "EducationalOrganization", name: SITE_NAME },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: c.duration || "Ongoing" },
  offers: { "@type": "Offer", price: (c.price || "").replace(/[^0-9.]/g, "") || undefined, priceCurrency: "USD", category: "Paid" },
});

function seoFor(route) {
  const t = (s) => `${s} | ${SITE_NAME}`;
  switch (route.name) {
    case "courses":
      return { title: t("Online Urdu Courses — Kids, Women & Exam Prep"),
        desc: "Six Urdu courses: private 1:1 classes for kids and women, GCSE exam preparation, Read & Write Urdu, and seasonal Summer and Back-to-School courses. Live classes with native teachers.",
        ld: [orgLD(), { "@type": "ItemList", name: "Urdu Courses", itemListElement: COURSES.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: courseLD(c) })) }] };
    case "course": {
      const c = COURSE_BY_SLUG[route.slug];
      if (!c) return { title: t("Course not found"), desc: SITE_DESC, ld: [orgLD()] };
      return { title: t(`${c.name} — Online Urdu Course`), desc: c.desc, ld: [orgLD(), courseLD(c)] };
    }
    case "pricing":
      return { title: t("Pricing & Plans — 1:1 Classes & Urdu Courses"),
        desc: "Private 1:1 Urdu tuition for kids (from $32/mo USD) and women (from $48/mo USD), plus GCSE exam prep ($79 USD), Read & Write Urdu ($60 USD), and seasonal Summer and Back-to-School courses ($55 USD each). Every plan starts with a free trial.",
        ld: [orgLD(), { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] };
    case "payment":
      return { title: t("How to Pay — Remitly, Taptap Send & Western Union"),
        desc: "Step-by-step guides for paying your Urdu lesson fees from abroad via Remitly, Taptap Send, or Western Union, with international bank transfer to Pakistan.",
        ld: [orgLD()] };
    case "about":
      return { title: t("About Us — Our Story & Mission"),
        desc: "Speak in Urdu is a small team of native teachers helping learners in 40+ countries read, write, and speak Urdu with structure and warmth.",
        ld: [orgLD(), { "@type": "AboutPage", name: t("About Us"), about: orgLD() }] };
    case "contact":
      return { title: t("Contact Us — Book a Free Trial Class"),
        desc: "Questions about learning Urdu? Message us, email info@speakinurdu.com, or book a free trial class. We reply within one business day.",
        ld: [orgLD(), { "@type": "ContactPage", name: t("Contact Us") }] };
    default:
      return { title: `${SITE_NAME} — ${SITE_TAGLINE}`, desc: SITE_DESC,
        ld: [orgLD(), { "@type": "ItemList", name: "Urdu Courses", itemListElement: COURSES.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: courseLD(c) })) }] };
  }
}

// Generates an ID shared between the browser pixel event and the matching
// server-side Conversions API event (see public/capi.php), so Meta
// deduplicates the two into a single event instead of double-counting.
const newEventId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function trackEvent(name, params, eventId) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", name, params, eventId ? { eventID: eventId } : undefined);
  }
}

// For events with no natural server round-trip of their own (page views,
// viewing a course, opening the trial modal) — fires the browser pixel
// immediately, then relays the same event (same ID, for dedup) to
// track-event.php so it also reaches Meta via server-side Conversions API,
// which a browser ad blocker can't touch. Fire-and-forget: never awaited,
// never blocks the UI, failures are silently ignored.
function trackEventWithCapi(name, { contentName, contentCategory, contentId } = {}) {
  const eventId = newEventId();
  trackEvent(name, contentName ? { content_name: contentName, content_category: contentCategory, content_ids: contentId ? [contentId] : undefined } : undefined, eventId);
  if (typeof window === "undefined") return;
  const body = new URLSearchParams({ event: name, eventId, url: window.location.href });
  if (contentName) body.set("contentName", contentName);
  if (contentCategory) body.set("contentCategory", contentCategory);
  if (contentId) body.set("contentId", contentId);
  fetch("/track-event.php", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, keepalive: true }).catch(() => {});
}

function useSEO(route) {
  const isFirstRun = useRef(true);
  useEffect(() => {
    // The Meta Pixel's own inline snippet (index.html) already fires the
    // PageView for the initial page load — this only covers client-side
    // route changes afterward, which a normal page load never triggers.
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      trackEventWithCapi("PageView");
    }
    if (route.name === "course") {
      const c = COURSE_BY_SLUG[route.slug];
      if (c) trackEventWithCapi("ViewContent", { contentName: c.name, contentCategory: "course", contentId: c.slug });
    }
    const { title, desc, ld } = seoFor(route);
    const canonicalUrl = SITE_URL + (typeof window !== "undefined" ? window.location.pathname : routePathFor(route));
    document.title = title;
    document.documentElement.lang = "en";
    if (!document.head.querySelector('meta[name="viewport"]')) {
      const v = document.createElement("meta");
      v.name = "viewport"; v.content = "width=device-width, initial-scale=1";
      document.head.appendChild(v);
    }
    upsertMeta("name", "description", desc);
    upsertMeta("name", "theme-color", "#1F4D3A");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", `${SITE_URL}/social-share.png`);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", `${SITE_URL}/social-share.png`);
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
    link.setAttribute("href", canonicalUrl);
    let s = document.getElementById("mu-jsonld");
    if (!s) { s = document.createElement("script"); s.id = "mu-jsonld"; s.type = "application/ld+json"; document.head.appendChild(s); }
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": ld });
  }, [route.name, route.slug]);
}

export default function App({ initialPath } = {}) {
  const [route, setRoute] = useState(() => parsePath(initialPath ?? (typeof window !== "undefined" ? window.location.pathname : "/")));
  const [pendingScroll, setPendingScroll] = useState(null);
  const [trialOpen, setTrialOpen] = useState(false);
  const [trialCourseSlug, setTrialCourseSlug] = useState("");

  useEffect(() => {
    const on = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);

  const navigate = useCallback((path) => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === path) { setRoute(parsePath(path)); return; }
    window.history.pushState({}, "", path);
    setRoute(parsePath(path));
  }, []);
  const goRoute = useCallback((name) => navigate(routePath(name)), [navigate]);
  const goCourse = useCallback((slug) => navigate(coursePath(slug)), [navigate]);
  const goHomeTop = useCallback(() => { setPendingScroll("__top"); navigate("/"); }, [navigate]);
  const goSection = useCallback((id) => {
    setPendingScroll(id);
    if (typeof window !== "undefined" && parsePath(window.location.pathname).name !== "home") navigate("/");
  }, [navigate]);
  const goTrial = useCallback((slug) => { setTrialCourseSlug(slug || ""); setTrialOpen(true); }, []);

  // The PHP-rendered blog (outside this SPA) links "Book Free Trial" to
  // /?trial=1 since it can't open this React modal itself — pick that up
  // once we land here, then clean the URL so it doesn't linger/re-open.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("trial") === "1") {
      setTrialCourseSlug(params.get("course") || "");
      setTrialOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // handle pending in-page scroll once home is mounted; otherwise scroll to top on route change
  useEffect(() => {
    const behavior = reducedMotion() ? "auto" : "smooth";
    if (pendingScroll) {
      if (route.name === "home") {
        requestAnimationFrame(() => {
          if (pendingScroll === "__top") window.scrollTo({ top: 0, behavior });
          else {
            const el = document.getElementById(pendingScroll);
            if (el) el.scrollIntoView({ behavior, block: "start" });
            else window.scrollTo({ top: 0, behavior });
          }
          setPendingScroll(null);
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
      const main = document.getElementById("main-content");
      if (main) main.focus({ preventScroll: true });
    }
    // eslint-disable-next-line
  }, [route.name, route.slug]);

  useSEO(route);

  const ctx = { route, goRoute, goCourse, goHomeTop, goSection, goTrial, routePath, coursePath };

  return (
    <Nav.Provider value={ctx}>
      <div className="mu-root">
        <a className="mu-skip" href="#main-content">Skip to main content</a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {route.name === "home" && <HomePage />}
          {route.name === "courses" && <CoursesPage />}
          {route.name === "course" && <CourseDetailPage slug={route.slug} />}
          {route.name === "pricing" && <PricingPage />}
          {route.name === "payment" && <PaymentPage />}
          {route.name === "about" && <AboutPage />}
          {route.name === "contact" && <ContactPage />}
        </main>
        <Footer />
        <div className="mu-float-stack">
          <ChatWidget />
          <BackToTop />
        </div>
        <BookTrialModal open={trialOpen} onClose={() => setTrialOpen(false)} presetCourseSlug={trialCourseSlug} />
      </div>
    </Nav.Provider>
  );
}

/* ================= prerender support =================
 * Used only by scripts/prerender.js (build-time, Node) to enumerate every
 * real route and compute its title/meta tags ahead of rendering — not
 * imported by the browser bundle's normal runtime path. The blog is
 * intentionally excluded: it's PHP-rendered straight from the database
 * (see public/blog.php), not part of this static-generated SPA. */
export function getAllRoutePaths() {
  return [
    "/", "/courses", "/pricing", "/payment", "/about", "/contact",
    ...COURSES.map((c) => coursePath(c.slug)),
  ];
}
export { seoFor, parsePath, SITE_URL, SITE_NAME };

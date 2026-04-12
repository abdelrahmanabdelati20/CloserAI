#!/usr/bin/env node
const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "CloserAI";
pres.title = "CloserAI - AI-Powered Real Estate Lead Conversion";

// Brand colors (no # prefix)
const DARK = "1E3A5F";
const PRIMARY = "2563EB";
const LIGHT = "3B82F6";
const WHITE = "FFFFFF";
const GRAY = "111827";
const GRAY_50 = "F9FAFB";
const GRAY_200 = "E5E7EB";
const GRAY_500 = "6B7280";
const GREEN = "059669";
const RED = "DC2626";

// Reusable factory functions to avoid PptxGenJS mutation bugs
const makeShadow = () => ({ type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.15 });
const makeCardShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ═══════════════════════════════════════════════════
// SLIDE 1: HOOK (Title Slide)
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: DARK };

  // Gradient overlay bar at top
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PRIMARY } });

  // Small logo area
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 0.5, w: 0.5, h: 0.5, fill: { color: PRIMARY }, rectRadius: 0.08 });
  slide.addText("C", { x: 0.7, y: 0.5, w: 0.5, h: 0.5, color: WHITE, fontSize: 22, bold: true, align: "center", valign: "middle" });
  slide.addText("CloserAI", { x: 1.35, y: 0.5, w: 2, h: 0.5, color: WHITE, fontSize: 18, bold: true, valign: "middle", margin: 0 });

  // Main headline
  slide.addText("What If Your Website Could\nClose Leads While You Sleep?", {
    x: 0.7, y: 1.5, w: 8.6, h: 2,
    color: WHITE, fontSize: 40, bold: true, lineSpacingMultiple: 1.1, fontFace: "Calibri",
  });

  // Subtitle
  slide.addText("Introducing CloserAI — Your 24/7 AI Sales Agent for Real Estate", {
    x: 0.7, y: 3.6, w: 8, h: 0.6,
    color: LIGHT, fontSize: 18, fontFace: "Calibri",
  });

  // Bottom bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.125, w: 10, h: 0.5, fill: { color: PRIMARY, transparency: 60 } });
  slide.addText("closerai-app.vercel.app", { x: 0.7, y: 5.125, w: 8.6, h: 0.5, color: WHITE, fontSize: 14, align: "center", valign: "middle" });
}

// ═══════════════════════════════════════════════════
// SLIDE 2: THE PROBLEM
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  // Top accent
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: RED } });

  slide.addText("The $50,000 Problem", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.8,
    color: GRAY, fontSize: 36, bold: true, fontFace: "Calibri",
  });

  const bullets = [
    "78% of leads go with the FIRST agent who responds",
    "Your website gets visitors at 10pm, midnight, weekends...",
    "Nobody's there to talk to them",
    "They leave. They find another agent. You lose the commission.",
  ];

  slide.addText(
    bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, breakLine: i < bullets.length - 1, fontSize: 17, color: GRAY, paraSpaceAfter: 14 },
    })),
    { x: 0.9, y: 1.5, w: 8, h: 2.5, fontFace: "Calibri" }
  );

  // Bottom stat card
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 4.2, w: 8.6, h: 1,
    fill: { color: "FEE2E2" },
    shadow: makeCardShadow(),
  });
  slide.addText([
    { text: "Average lost commission per missed lead: ", options: { color: GRAY, fontSize: 16 } },
    { text: "$5,000 — $50,000", options: { color: RED, fontSize: 20, bold: true } },
  ], { x: 0.7, y: 4.2, w: 8.6, h: 1, align: "center", valign: "middle", fontFace: "Calibri" });
}

// ═══════════════════════════════════════════════════
// SLIDE 3: THE SOLUTION
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  // Blue left accent bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: PRIMARY } });

  slide.addText("Meet CloserAI", {
    x: 0.7, y: 0.3, w: 8, h: 0.7,
    color: GRAY, fontSize: 36, bold: true, fontFace: "Calibri",
  });
  slide.addText("Your 24/7 AI Sales Agent", {
    x: 0.7, y: 0.95, w: 8, h: 0.5,
    color: PRIMARY, fontSize: 18, fontFace: "Calibri",
  });

  const features = [
    { emoji: "⚡", text: "Responds instantly to every website visitor" },
    { emoji: "🌍", text: "Speaks 50+ languages natively" },
    { emoji: "📋", text: "Captures name, email, phone, budget automatically" },
    { emoji: "🔥", text: "Scores leads hot / warm / cold and sends alerts" },
  ];

  features.forEach((f, i) => {
    const y = 1.8 + i * 0.85;
    // Feature card
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y, w: 8.6, h: 0.7,
      fill: { color: GRAY_50 },
      shadow: makeCardShadow(),
    });
    slide.addText(f.emoji, { x: 0.9, y, w: 0.6, h: 0.7, fontSize: 24, align: "center", valign: "middle" });
    slide.addText(f.text, { x: 1.6, y, w: 7.5, h: 0.7, fontSize: 16, color: GRAY, valign: "middle", fontFace: "Calibri" });
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 4: HOW IT WORKS
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PRIMARY } });

  slide.addText("Live in 5 Minutes", {
    x: 0.7, y: 0.3, w: 8.6, h: 0.7,
    color: GRAY, fontSize: 36, bold: true, fontFace: "Calibri",
  });

  const steps = [
    { num: "01", title: "Sign up", desc: "60 seconds. No credit card required." },
    { num: "02", title: "Paste one line of code", desc: "Works on any website platform." },
    { num: "03", title: "AI starts capturing leads", desc: "24/7, in 50+ languages, instantly." },
  ];

  steps.forEach((s, i) => {
    const x = 0.7 + i * 3.1;
    // Step card
    slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: 2.8, h: 2.2, fill: { color: GRAY_50 }, shadow: makeCardShadow() });
    // Step number
    slide.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 1.5, w: 0.6, h: 0.6, fill: { color: PRIMARY } });
    slide.addText(s.num, { x: x + 0.15, y: 1.5, w: 0.6, h: 0.6, color: WHITE, fontSize: 16, bold: true, align: "center", valign: "middle" });
    slide.addText(s.title, { x: x + 0.15, y: 2.2, w: 2.5, h: 0.5, color: GRAY, fontSize: 16, bold: true, fontFace: "Calibri", margin: 0 });
    slide.addText(s.desc, { x: x + 0.15, y: 2.65, w: 2.5, h: 0.5, color: GRAY_500, fontSize: 13, fontFace: "Calibri", margin: 0 });
  });

  // Code snippet
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.9, w: 8.6, h: 1.2, fill: { color: GRAY } });
  slide.addText("index.html", { x: 0.9, y: 3.95, w: 2, h: 0.35, color: GRAY_500, fontSize: 11, fontFace: "Consolas" });
  slide.addText('<script src="closerai-app.vercel.app/widget.js" data-api-key="YOUR_KEY"></script>', {
    x: 0.9, y: 4.35, w: 8.2, h: 0.6, color: "4ADE80", fontSize: 13, fontFace: "Consolas",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 5: LIVE DEMO PREVIEW
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: DARK };

  slide.addText("See It In Action", {
    x: 0.7, y: 0.3, w: 4, h: 0.7,
    color: WHITE, fontSize: 32, bold: true, fontFace: "Calibri",
  });
  slide.addText("Real AI conversation with a website visitor", {
    x: 0.7, y: 0.9, w: 5, h: 0.4,
    color: LIGHT, fontSize: 14, fontFace: "Calibri",
  });

  // Chat window mockup
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 3.5, fill: { color: "F9FAFB" }, shadow: makeShadow() });

  // Chat header
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.5, w: 8.6, h: 0.7, fill: { color: PRIMARY } });
  slide.addText("S", { x: 0.9, y: 1.55, w: 0.5, h: 0.5, color: WHITE, fontSize: 18, bold: true, align: "center", valign: "middle", fill: { color: LIGHT, transparency: 50 } });
  slide.addText([
    { text: "Sarah ", options: { bold: true, fontSize: 14 } },
    { text: "AI", options: { fontSize: 9 } },
  ], { x: 1.5, y: 1.55, w: 2, h: 0.28, color: WHITE, fontFace: "Calibri", margin: 0 });
  slide.addText("Sunshine Realty · Online now", { x: 1.5, y: 1.82, w: 3, h: 0.25, color: WHITE, fontSize: 10, fontFace: "Calibri", margin: 0 });

  // Bot message 1
  slide.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 2.4, w: 5.5, h: 0.6, fill: { color: WHITE }, shadow: makeCardShadow() });
  slide.addText("Hi! I'm Sarah from Sunshine Realty. Looking to buy, sell, or just exploring?", {
    x: 1.1, y: 2.4, w: 5.3, h: 0.6, fontSize: 12, color: GRAY, fontFace: "Calibri", valign: "middle",
  });

  // User message
  slide.addShape(pres.shapes.RECTANGLE, { x: 3.8, y: 3.15, w: 5.3, h: 0.5, fill: { color: PRIMARY } });
  slide.addText("Looking for a 3 bedroom house in Miami under 800k", {
    x: 3.9, y: 3.15, w: 5.1, h: 0.5, fontSize: 12, color: WHITE, fontFace: "Calibri", valign: "middle", align: "right",
  });

  // Bot message 2
  slide.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 3.85, w: 7.5, h: 0.8, fill: { color: WHITE }, shadow: makeCardShadow() });
  slide.addText("Great taste! I have a beautiful 4-bed family home in Coral Gables at $725k with a heated pool. What's your name so I can send you the photos?", {
    x: 1.1, y: 3.85, w: 7.3, h: 0.8, fontSize: 12, color: GRAY, fontFace: "Calibri", valign: "middle",
  });

  // CTA
  slide.addText("Try it live: closerai-app.vercel.app/demo", {
    x: 0.7, y: 5.1, w: 8.6, h: 0.4,
    color: LIGHT, fontSize: 14, bold: true, align: "center", fontFace: "Calibri",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 6: FEATURES GRID
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: GRAY_50 };

  slide.addText("Built Specifically for Real Estate", {
    x: 0.7, y: 0.3, w: 8.6, h: 0.7,
    color: GRAY, fontSize: 32, bold: true, align: "center", fontFace: "Calibri",
  });

  const features = [
    { icon: "💬", title: "24/7 AI Chat Agent", desc: "Never miss a visitor again" },
    { icon: "📋", title: "Smart Lead Capture", desc: "Name, email, phone, budget" },
    { icon: "🏡", title: "Property Matching", desc: "AI recommends your listings" },
    { icon: "🔥", title: "Lead Scoring", desc: "Hot / Warm / Cold ranking" },
    { icon: "🌍", title: "50+ Languages", desc: "International buyers welcome" },
    { icon: "⚡", title: "5-Minute Setup", desc: "One line of code, done" },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.7 + col * 3.1;
    const y = 1.3 + row * 1.9;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.8, h: 1.6, fill: { color: WHITE }, shadow: makeCardShadow() });
    slide.addText(f.icon, { x, y: y + 0.15, w: 2.8, h: 0.5, fontSize: 28, align: "center" });
    slide.addText(f.title, { x, y: y + 0.65, w: 2.8, h: 0.4, fontSize: 15, bold: true, color: GRAY, align: "center", fontFace: "Calibri" });
    slide.addText(f.desc, { x, y: y + 1.05, w: 2.8, h: 0.35, fontSize: 12, color: GRAY_500, align: "center", fontFace: "Calibri" });
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 7: COMPETITOR COMPARISON
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PRIMARY } });

  slide.addText("How CloserAI Compares", {
    x: 0.7, y: 0.3, w: 8.6, h: 0.7,
    color: GRAY, fontSize: 32, bold: true, fontFace: "Calibri",
  });

  const headerStyle = { fill: { color: DARK }, color: WHITE, fontSize: 11, bold: true, align: "center", valign: "middle" };
  const cellStyle = { fontSize: 12, align: "center", valign: "middle", color: GRAY };
  const highlightStyle = { fill: { color: "EFF6FF" }, fontSize: 12, align: "center", valign: "middle", color: PRIMARY, bold: true };

  const tableData = [
    [
      { text: "Platform", options: headerStyle },
      { text: "Starting Price", options: headerStyle },
      { text: "Setup Fee", options: headerStyle },
      { text: "Languages", options: headerStyle },
      { text: "Real Estate", options: headerStyle },
    ],
    [
      { text: "CloserAI", options: { ...highlightStyle, bold: true } },
      { text: "$297/mo", options: highlightStyle },
      { text: "$0", options: { ...highlightStyle, color: GREEN } },
      { text: "50+", options: highlightStyle },
      { text: "Purpose-built", options: highlightStyle },
    ],
    [
      { text: "Structurely", options: cellStyle },
      { text: "$500/mo", options: { ...cellStyle, color: RED } },
      { text: "Yes", options: { ...cellStyle, color: RED } },
      { text: "English only", options: cellStyle },
      { text: "Yes", options: cellStyle },
    ],
    [
      { text: "Conversica", options: cellStyle },
      { text: "$2,500+/mo", options: { ...cellStyle, color: RED } },
      { text: "Yes", options: { ...cellStyle, color: RED } },
      { text: "Limited", options: cellStyle },
      { text: "No (generic)", options: cellStyle },
    ],
    [
      { text: "Drift", options: cellStyle },
      { text: "$2,500+/mo", options: { ...cellStyle, color: RED } },
      { text: "Yes", options: { ...cellStyle, color: RED } },
      { text: "Limited", options: cellStyle },
      { text: "No (generic)", options: cellStyle },
    ],
  ];

  slide.addTable(tableData, {
    x: 0.7, y: 1.3, w: 8.6,
    border: { pt: 0.5, color: GRAY_200 },
    colW: [1.8, 1.7, 1.4, 1.5, 2.2],
    rowH: [0.5, 0.6, 0.55, 0.55, 0.55],
    fontFace: "Calibri",
  });

  slide.addText("CloserAI: Better features, lower price, purpose-built for real estate.", {
    x: 0.7, y: 4.5, w: 8.6, h: 0.5,
    color: PRIMARY, fontSize: 14, bold: true, align: "center", fontFace: "Calibri",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 8: PRICING
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: GRAY_50 };

  slide.addText("Simple, Transparent Pricing", {
    x: 0.7, y: 0.25, w: 8.6, h: 0.6,
    color: GRAY, fontSize: 32, bold: true, align: "center", fontFace: "Calibri",
  });

  const plans = [
    { name: "Starter", price: "$297", features: ["1 Website Widget", "1,000 Conversations/mo", "Lead Capture", "50+ Languages", "Email Support"], popular: false },
    { name: "Professional", price: "$597", features: ["5 Website Widgets", "3,000 Conversations/mo", "Advanced Lead Scoring", "Property Matching AI", "CRM Integration", "Priority Support"], popular: true },
    { name: "Enterprise", price: "$1,297", features: ["Unlimited Widgets", "10,000 Conversations/mo", "White-Label Option", "Custom AI Training", "Dedicated Manager"], popular: false },
  ];

  plans.forEach((p, i) => {
    const x = 0.5 + i * 3.15;
    const cardColor = p.popular ? PRIMARY : WHITE;
    const textColor = p.popular ? WHITE : GRAY;
    const subColor = p.popular ? LIGHT : GRAY_500;

    // Card
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 3, h: 4.1,
      fill: { color: cardColor },
      shadow: p.popular ? makeShadow() : makeCardShadow(),
    });

    // Popular badge
    if (p.popular) {
      slide.addShape(pres.shapes.RECTANGLE, { x: x + 0.6, y: 0.85, w: 1.8, h: 0.4, fill: { color: "FBBF24" } });
      slide.addText("MOST POPULAR", { x: x + 0.6, y: 0.85, w: 1.8, h: 0.4, color: GRAY, fontSize: 10, bold: true, align: "center", valign: "middle", fontFace: "Calibri" });
    }

    // Plan name
    slide.addText(p.name, { x, y: 1.3, w: 3, h: 0.45, color: textColor, fontSize: 20, bold: true, align: "center", fontFace: "Calibri" });
    // Price
    slide.addText(p.price, { x, y: 1.75, w: 3, h: 0.6, color: textColor, fontSize: 36, bold: true, align: "center", fontFace: "Calibri" });
    slide.addText("/month", { x, y: 2.3, w: 3, h: 0.3, color: subColor, fontSize: 12, align: "center", fontFace: "Calibri" });

    // Features
    slide.addText(
      p.features.map((f, j) => ({
        text: "  " + f,
        options: { bullet: true, breakLine: j < p.features.length - 1, fontSize: 11, color: textColor, paraSpaceAfter: 6 },
      })),
      { x: x + 0.2, y: 2.8, w: 2.6, h: 2.2, fontFace: "Calibri" }
    );
  });

  // Bottom text
  slide.addText("$0 setup fee  ·  14-day free trial  ·  Cancel anytime", {
    x: 0.7, y: 5.25, w: 8.6, h: 0.3,
    color: GREEN, fontSize: 13, bold: true, align: "center", fontFace: "Calibri",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 9: ROI
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  // Green accent bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: GREEN } });

  slide.addText("The Math Is Simple", {
    x: 0.7, y: 0.3, w: 8.6, h: 0.7,
    color: GRAY, fontSize: 36, bold: true, fontFace: "Calibri",
  });

  // ROI cards
  const cards = [
    { label: "1 closed deal", value: "$5,000 — $50,000", sub: "Average commission", color: PRIMARY },
    { label: "CloserAI Pro (annual)", value: "$5,970", sub: "Full year of 24/7 AI", color: GRAY },
    { label: "Your ROI", value: "700%+", sub: "From just ONE extra deal", color: GREEN },
  ];

  cards.forEach((c, i) => {
    const x = 0.7 + i * 3.1;
    slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.8, h: 2.2, fill: { color: GRAY_50 }, shadow: makeCardShadow() });
    slide.addText(c.label, { x, y: 1.55, w: 2.8, h: 0.4, fontSize: 12, color: GRAY_500, align: "center", fontFace: "Calibri" });
    slide.addText(c.value, { x, y: 2.0, w: 2.8, h: 0.7, fontSize: 28, bold: true, color: c.color, align: "center", fontFace: "Calibri" });
    slide.addText(c.sub, { x, y: 2.75, w: 2.8, h: 0.4, fontSize: 11, color: GRAY_500, align: "center", fontFace: "Calibri" });
  });

  // Bottom tagline
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.2, w: 8.6, h: 0.8, fill: { color: "ECFDF5" }, shadow: makeCardShadow() });
  slide.addText("CloserAI pays for itself with your very first conversion.", {
    x: 0.7, y: 4.2, w: 8.6, h: 0.8,
    color: GREEN, fontSize: 18, bold: true, align: "center", valign: "middle", fontFace: "Calibri",
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 10: TRUST
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: WHITE };

  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PRIMARY } });

  slide.addText("Enterprise-Grade Technology", {
    x: 0.7, y: 0.3, w: 8.6, h: 0.7,
    color: GRAY, fontSize: 32, bold: true, align: "center", fontFace: "Calibri",
  });

  const badges = [
    { icon: "🤖", label: "Powered by\nClaude AI" },
    { icon: "🚀", label: "Hosted on\nVercel" },
    { icon: "🔒", label: "TLS 1.3\nEncrypted" },
    { icon: "🛡️", label: "GDPR\nCompliant" },
  ];

  badges.forEach((b, i) => {
    const x = 0.7 + i * 2.35;
    slide.addShape(pres.shapes.RECTANGLE, { x, y: 1.4, w: 2.1, h: 1.6, fill: { color: GRAY_50 }, shadow: makeCardShadow() });
    slide.addText(b.icon, { x, y: 1.5, w: 2.1, h: 0.6, fontSize: 32, align: "center" });
    slide.addText(b.label, { x, y: 2.15, w: 2.1, h: 0.7, fontSize: 13, bold: true, color: GRAY, align: "center", fontFace: "Calibri" });
  });

  // Guarantees
  const guarantees = [
    { icon: "💰", text: "30-day money-back guarantee" },
    { icon: "📝", text: "No contracts — cancel anytime" },
    { icon: "💳", text: "No credit card for free trial" },
  ];

  guarantees.forEach((g, i) => {
    const x = 0.7 + i * 3.1;
    slide.addShape(pres.shapes.RECTANGLE, { x, y: 3.5, w: 2.8, h: 0.8, fill: { color: "ECFDF5" }, shadow: makeCardShadow() });
    slide.addText(g.icon + "  " + g.text, {
      x, y: 3.5, w: 2.8, h: 0.8,
      fontSize: 12, bold: true, color: GREEN, align: "center", valign: "middle", fontFace: "Calibri",
    });
  });
}

// ═══════════════════════════════════════════════════
// SLIDE 11: CTA (Final)
// ═══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: DARK };

  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: PRIMARY } });

  slide.addText("Start Capturing Leads Today", {
    x: 0.7, y: 1.0, w: 8.6, h: 1,
    color: WHITE, fontSize: 42, bold: true, align: "center", fontFace: "Calibri",
  });

  slide.addText("14-Day Free Trial — No Credit Card Required", {
    x: 0.7, y: 2.1, w: 8.6, h: 0.6,
    color: LIGHT, fontSize: 20, align: "center", fontFace: "Calibri",
  });

  // CTA button
  slide.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 3.0, w: 5, h: 0.8, fill: { color: PRIMARY }, shadow: makeShadow() });
  slide.addText("closerai-app.vercel.app/free-trial", {
    x: 2.5, y: 3.0, w: 5, h: 0.8,
    color: WHITE, fontSize: 18, bold: true, align: "center", valign: "middle", fontFace: "Calibri",
    hyperlink: { url: "https://closerai-app.vercel.app/free-trial" },
  });

  // Contact
  slide.addText("Questions? Email: AbdelrahmanAbdelati20@gmail.com", {
    x: 0.7, y: 4.0, w: 8.6, h: 0.4,
    color: GRAY_500, fontSize: 13, align: "center", fontFace: "Calibri",
  });

  // Tagline
  slide.addText("The best time to start was yesterday. The second best time is now.", {
    x: 0.7, y: 4.8, w: 8.6, h: 0.5,
    color: LIGHT, fontSize: 14, italic: true, align: "center", fontFace: "Calibri",
  });
}

// ═══════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════
const outputPath = path.join(__dirname, "..", "public", "CloserAI-Presentation.pptx");
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("Presentation created: " + outputPath);
  console.log("11 slides, 16:9 widescreen, CloserAI branding");
});

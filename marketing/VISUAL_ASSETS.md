# Visual Assets Guide

Screenshots, videos, and graphics to tell the Agent Payments with Ledger story.

---

## Hero Image / OG Image

### Concept
Split composition showing the flow: AI agent on left → Intent queue in center → Ledger device on right

### Specifications
- Size: 1200x630 (Twitter/LinkedIn OG image)
- Background: Dark (#0D0D0D) to match Ledger branding
- Elements:
  - Left: Stylized AI agent icon or terminal window
  - Center: Queue visualization with transaction cards
  - Right: Ledger device (Nano X or Stax)
  - Arrows showing flow direction
- Text overlay: "Agents propose. Humans sign."
- Logo: Agent Payments with Ledger logo bottom right

---

## Screenshots Needed

### 1. Intent Queue Dashboard
**What to capture:**
- List of pending intents
- Mix of statuses (pending, signed, confirmed)
- Agent name visible ("Inspector Clouseau")
- Transaction details visible
- Dark theme

**Use case:** Hero image for website, blog posts, tweets

### 2. Intent Detail View
**What to capture:**
- Single intent expanded
- Full details: amount, recipient, chain, memo
- "Sign with Ledger" and "Reject" buttons visible
- Urgency indicator if present

**Use case:** Explain the review process

### 3. CLI in Action
**What to capture:**
- Terminal window showing:
  ```bash
  $ ledger-intent send 50 USDC to 0x1234...5678 for "podcast payment"
  ✅ Intent created successfully
     ID: int_1707048000_abc123
     Status: pending
  ```
- Clean, minimal terminal theme

**Use case:** Show developer experience, agent integration

### 4. Ledger Signing Flow
**What to capture:**
- Ledger device (physical or simulated) showing transaction
- Screen displaying amount and recipient
- "Confirm" button highlighted

**Use case:** Emphasize hardware security

### 5. Transaction Confirmed
**What to capture:**
- Intent card showing "Confirmed" status
- Transaction hash visible
- "View on Explorer" link
- Green checkmark

**Use case:** Show successful end-to-end flow

---

## Video Assets

### 1. Demo Video (60-90 seconds)

**Storyboard:**

| Timestamp | Visual | Voiceover/Text |
|-----------|--------|----------------|
| 0:00-0:10 | Problem statement text | "AI agents are powerful. But should they have your keys?" |
| 0:10-0:20 | Agent terminal, code running | "Your agent can do a lot. Soon it'll need to spend money." |
| 0:20-0:30 | Scary animation: wallet draining | "One mistake. Funds gone." |
| 0:30-0:40 | Agent Payments with Ledger logo reveal | "Introducing Agent Payments with Ledger" |
| 0:40-0:50 | CLI: agent submits intent | "Agents propose transactions..." |
| 0:50-1:00 | Dashboard: intent appears | "You review the details..." |
| 1:00-1:10 | Ledger device: signing | "And sign on hardware." |
| 1:10-1:20 | Transaction confirmed | "Secure. Simple. In control." |
| 1:20-1:30 | CTA: website URL | "Try it: agentintents.io" |

**Style:** Clean, minimal motion graphics. Dark theme. Ledger brand colors.

### 2. Quick GIF (15 seconds)

**Loop showing:**
1. Terminal: `ledger-intent send 50 USDC...`
2. Dashboard: Intent appears
3. Button click: "Sign with Ledger"
4. Status: "Confirmed" ✅

**Use case:** Twitter, Discord, embedded in docs

### 3. Technical Walkthrough (3-5 minutes)

**Content:**
- Architecture diagram explanation
- Code walkthrough of key components
- Live demo of full flow
- Security model explanation

**Use case:** YouTube, developer docs, deeper engagement

---

## Architecture Diagrams

### 1. High-Level Flow
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agent      │────▶│   Intent Queue   │────▶│  Ledger Signer  │
│   (OpenClaw)    │     │  (Backend API)   │     │  (Human + HW)   │
│                 │     │                  │     │                 │
│ • Analyzes      │     │ • Stores intents │     │ • Reviews       │
│ • Drafts txns   │     │ • Shows details  │     │ • Approves/     │
│ • NO key access │     │ • Audit trail    │     │   Rejects       │
└─────────────────┘     └──────────────────┘     │ • Signs on HW   │
                                                 └─────────────────┘
```

### 2. Intent Lifecycle
```
[Created] → [Pending] → [Approved] → [Signed] → [Confirmed]
                    ↘            ↘           ↘
                    [Rejected] [Failed]  [Expired]
```

### 3. Security Model
```
┌─────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARY                        │
│  ┌─────────────┐                    ┌─────────────────┐ │
│  │   Agent     │   Can NEVER cross  │  Private Keys   │ │
│  │   (Untrusted│ ─────────────────▶ │  (Ledger HW)    │ │
│  │   Code)     │                    │                 │ │
│  └─────────────┘                    └─────────────────┘ │
│         │                                   ▲           │
│         │ Submit Intent                     │ Sign      │
│         ▼                                   │           │
│  ┌─────────────┐                    ┌─────────────────┐ │
│  │   Intent    │   Human Review     │    Human        │ │
│  │   Queue     │ ◀───────────────── │    (Trusted)    │ │
│  └─────────────┘                    └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Social Media Graphics

### Twitter Card
- Size: 1200x675
- Content: Logo + tagline + URL
- Text: "Agents propose. Humans sign."
- Style: Dark, minimal, Ledger-aligned

### Profile Banner (If creating dedicated account)
- Size: 1500x500
- Content: Logo + architecture diagram silhouette + "Hardware security for AI agents"

### Quote Card Template
- For sharing pull quotes from blog/press release
- Dark background, large quote text, attribution
- Example: "The spending limit for superintelligence is a hardware wallet." — Ian Rogers

---

## Logo Concepts

### Primary Mark
- "Agent Payments with Ledger" wordmark
- Incorporates: queue/list visual + hardware/secure element
- Colors: Ledger orange (#FF5300) on dark

### Icon
- Stylized "AI" with security lock
- Or: Queue icon with checkmark
- Must work at 32x32 for favicons

---

## Asset Checklist

**Screenshots:**
- [ ] Dashboard overview (light intents)
- [ ] Dashboard with activity (many intents)
- [ ] Intent detail modal
- [ ] CLI success output
- [ ] Ledger signing screen
- [ ] Transaction confirmed state

**Videos:**
- [ ] 60-second demo video
- [ ] 15-second GIF loop
- [ ] Technical walkthrough (optional for hackathon)

**Graphics:**
- [ ] OG image (1200x630)
- [ ] Twitter card
- [ ] Architecture diagrams (exportable SVG/PNG)
- [ ] Logo/wordmark

**For Press:**
- [ ] High-res logo pack
- [ ] Founder headshot (Ian)
- [ ] Product screenshots (print-quality)

---

## Tools Recommended

- **Screenshots:** CleanShot X, or browser DevTools device mode
- **Diagrams:** Excalidraw, Mermaid, or tldraw
- **Video:** Screen Studio (Mac), Loom, or OBS
- **Graphics:** Figma, Canva
- **GIFs:** Gifski, LICEcap

---

## Brand Guidelines

- **Primary color:** Ledger Orange (#FF5300)
- **Background:** Near-black (#0D0D0D, #121212)
- **Text:** White (#FFFFFF), Gray (#9CA3AF)
- **Font:** Inter or system font stack
- **Tone:** Professional, technical, confident

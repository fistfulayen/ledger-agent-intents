# Product Analysis: Use Case Prioritization & Sequencing

**Role:** Head of Product #2  
**Focus:** Stablecoin settlement & agent usefulness  
**Date:** February 5, 2026

---

## Top 8 Use Cases — Scoring Table

| Use Case | Settlement Volume | Frequency | Urgency/Time-Sensitivity | Integration Readiness | Ledger Advantage | **Total** |
|----------|------------------|-----------|---------------------------|----------------------|------------------|-----------|
| **9. Payroll Run** | 5 | 4 | 4 | 3 | 5 | **21** |
| **7. Contractor Invoice Processing** | 5 | 3 | 4 | 2 | 5 | **19** |
| **4. Podcast Guest Payment** | 3 | 4 | 3 | 5 | 4 | **19** |
| **8. Expense Reimbursement** | 2 | 5 | 2 | 3 | 3 | **15** |
| **6. Newsletter Subscription** | 2 | 5 | 1 | 5 | 2 | **15** |
| **1. Agent Hiring Agent** | 3 | 3 | 3 | 3 | 4 | **16** |
| **10. Yield Optimization** | 5 | 3 | 2 | 2 | 5 | **17** |
| **2. Moltbook Bounties** | 3 | 2 | 3 | 4 | 4 | **16** |

### Scoring Rationale (1-5 scale)

**Settlement Volume:**
- 5 = High volume ($5K+ per transaction or batch)
- 4 = Medium-high ($1K-$5K)
- 3 = Medium ($200-$1K)
- 2 = Low-medium ($50-$200)
- 1 = Low (<$50)

**Frequency:**
- 5 = Daily/weekly
- 4 = Weekly/monthly
- 3 = Monthly/occasional
- 2 = Quarterly/rare
- 1 = One-time

**Urgency/Time-Sensitivity:**
- 5 = Critical deadlines (payroll, invoices)
- 4 = Important deadlines
- 3 = Moderate urgency
- 2 = Low urgency
- 1 = No urgency

**Integration Readiness:**
- 5 = Simple transfer, no external APIs needed
- 4 = Well-documented APIs exist (Moltbook, ENS)
- 3 = APIs exist but need integration work
- 2 = Requires custom parsing/integration (email, receipts)
- 1 = Complex integrations required

**Ledger Advantage:**
- 5 = High-value, high-risk, needs trusted display + physical confirmation
- 4 = Medium-high value, clear security benefit
- 3 = Medium value, moderate security benefit
- 2 = Low value, minimal security benefit
- 1 = No clear advantage

---

## Recommended Sequencing

### Phase 1: MVP (Weeks 1-2)
**Goal:** Prove core value prop with highest-impact, simplest-to-implement use cases.

**Use Cases:**
1. **Podcast Guest Payment** (#4)
   - Simple USDC transfer
   - No external integrations
   - Clear demo value
   - High frequency (weekly/monthly)

2. **Newsletter Subscription** (#6)
   - Recurring intent pattern
   - Simple transfer
   - Demonstrates automation value
   - High frequency

3. **Agent Hiring Agent** (#1)
   - Core agent-to-agent commerce
   - Requires Moltbook API (well-documented)
   - High narrative value for hackathon

**Why Phase 1:**
- All use cases score 5 on Integration Readiness (or close)
- High frequency = more user touchpoints
- Clear demo value for hackathon
- Establishes core patterns (single transfer, recurring, agent-to-agent)

**Deliverables:**
- Basic intent queue working
- Ledger signing flow end-to-end
- 3 working use case demos
- Hackathon submission ready

---

### Phase 2: Business Operations (Weeks 3-4)
**Goal:** Capture high-volume settlement use cases that demonstrate real business value.

**Use Cases:**
1. **Payroll Run** (#9)
   - Highest settlement volume
   - Batch intent pattern
   - High Ledger advantage (large amounts)
   - Requires DAO/contributor list APIs (moderate integration)

2. **Contractor Invoice Processing** (#7)
   - High volume
   - High urgency (deadlines)
   - Requires email parsing/invoice extraction (complex integration)
   - High Ledger advantage

3. **Expense Reimbursement** (#8)
   - High frequency
   - Batch intent pattern
   - Requires receipt parsing (complex integration)
   - Moderate Ledger advantage

**Why Phase 2:**
- Highest settlement volume use cases
- Demonstrates batch processing capability
- Real business value (payroll, invoices)
- Requires more complex integrations (email, receipts, DAO APIs)

**Deliverables:**
- Batch intent signing
- Email/receipt parsing integrations
- DAO contributor list integration
- High-volume settlement flows

---

### Phase 3: Advanced Features (Weeks 5-6)
**Goal:** Expand into DeFi and advanced agent economy features.

**Use Cases:**
1. **Yield Optimization** (#10)
   - High volume
   - Requires DeFi protocol APIs (Aave, etc.)
   - High Ledger advantage (large amounts, DeFi risk)
   - Moderate urgency

2. **Moltbook Bounties** (#2)
   - Agent economy showcase
   - Requires escrow pattern
   - Moderate integration (Moltbook APIs)
   - High narrative value

3. **Dollar-Cost Averaging** (#11)
   - Recurring DeFi pattern
   - Requires DEX APIs
   - Moderate Ledger advantage
   - Low urgency

**Why Phase 3:**
- DeFi integrations are complex (protocol APIs, swaps)
- Requires escrow/smart contract patterns
- Lower priority than business operations
- Expands use case coverage

**Deliverables:**
- DeFi protocol integrations
- Escrow intent patterns
- DEX swap integrations
- Advanced agent economy features

---

## Single Biggest Metric to Optimize Initially

### **Intent-to-Sign Time (I2S)**

**Definition:** Time from agent creating intent → human signing on Ledger device.

**Why this metric:**
1. **Directly measures agent usefulness** — If signing takes too long, agents become less useful
2. **Captures end-to-end UX** — Includes intent creation, notification, review, signing
3. **Predicts adoption** — Fast I2S = more intents = more settlement volume
4. **Actionable** — Can optimize each step: notification speed, UI clarity, signing flow

**Target:** < 2 minutes for Phase 1 use cases

**How to optimize:**
- **Intent creation:** Fast API response (< 200ms)
- **Notification:** Real-time push/websocket when intent created
- **Review UI:** Clear, scannable intent details (amount, recipient, memo)
- **Signing flow:** One-tap sign, minimal Ledger device interaction

**Why not other metrics:**
- **Settlement volume:** Too early — need users first
- **Number of intents:** Doesn't measure quality/usefulness
- **Signing success rate:** Important but secondary to speed
- **User count:** Vanity metric — doesn't measure product-market fit

**Measurement:**
- Track timestamp at intent creation (`createdAt`)
- Track timestamp at signing (`signedAt`)
- Calculate: `I2S = signedAt - createdAt`
- Dashboard: Average I2S by use case, user, time period

---

## Summary

**Phase 1 MVP:** Focus on simple, high-frequency use cases (Podcast Payment, Newsletter Subscription, Agent Hiring) to prove core value and win hackathon.

**Phase 2:** Expand to high-volume business operations (Payroll, Invoices, Expenses) to capture real settlement volume.

**Phase 3:** Add advanced features (DeFi, Escrow) to expand use case coverage.

**Key Metric:** Optimize Intent-to-Sign Time (< 2 min) to maximize agent usefulness and adoption.


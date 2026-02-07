# 20 Use Cases for Agent Payments with Ledger

*The full spectrum of what agents propose and humans sign.*

---

## Payments & Commerce

### 1. x402 API Payments
Your agent needs to call GPT-4, Claude, or a premium data API. With x402, each request costs microcents. Your agent proposes: "Pay $0.02 for this API call." Below your threshold? Auto-approved. Above? You review and sign.

### 2. Contractor Payments
"Pay @alice 500 USDC for logo design work. Invoice attached." Your agent processed the invoice, verified the work was delivered, and proposes the payment. You review the details on your Ledger's trusted display, confirm the address, sign.

### 3. Subscription Renewals
"Renew Cursor Pro ($20/month). Your subscription expires tomorrow." Your agent manages your subscriptions, flags what's coming up, proposes renewals. You decide what stays, what gets cancelled, what gets upgraded.

### 4. Bill Payments
"Pay electric bill: €127.43 to EDF. Due date: Feb 15." Your agent reads the bill from your email, extracts the amount, proposes payment. You verify the amount matches, sign on hardware.

### 5. Expense Reimbursements
Your agent tracks receipts, categorizes expenses, and proposes: "Reimburse yourself $342.18 for business travel (3 receipts attached)." Finance teams can run the same flow—employee agents propose, finance approves on hardware.

---

## Agent-to-Agent Economy

### 6. Agent Hiring Agent
Your agent needs deep research on a topic. It finds a specialized research agent on a marketplace. "Pay ResearchBot 25 USDC for comprehensive market analysis." You approve the hire. The research agent delivers. Value flows.

### 7. Bounty Completion
You posted a 100 USDC bounty for a code fix. An agent claims it, submits a PR, your agent verifies the tests pass. "Release bounty: 100 USDC to @devbot for PR #47 (merged)." You verify and sign.

### 8. Collaborative Task Splitting
Your agent breaks a complex task into subtasks and farms them out: "Pay TranslationBot 10 USDC for French localization. Pay DesignBot 15 USDC for icon set." Multiple intents, one review session, batch signing.

---

## DeFi & Trading

### 9. Yield Optimization
Your agent monitors DeFi yields 24/7. "Move 5,000 USDC from Aave (2.1% APY) to Compound (3.4% APY). Estimated annual gain: $65." You review the strategy, verify the contracts, approve the reallocation.

### 10. Dollar-Cost Averaging
"Weekly DCA: Buy $100 of ETH at current price ($2,847)." Your agent executes your investment strategy, but every purchase requires your signature. Consistent investing, hardware security.

### 11. Limit Order Execution
"ETH dropped to your target of $2,500. Execute buy order: 1 ETH for 2,500 USDC." Your agent watches the market. When conditions are met, it proposes. You have final say.

### 12. Portfolio Rebalancing
"Quarterly rebalance: Sell 0.5 ETH, buy 750 USDC to maintain 60/40 allocation." Your agent maintains your target allocation, but rebalancing trades need your approval.

---

## Identity & Access

### 13. Identity Verification
A service needs to verify you're a real human. Your agent proposes: "Sign attestation proving account ownership for ServiceX." You're not sharing your private key—you're signing a message that proves you control it. Verified on hardware.

### 14. Login Delegation
"Grant ReadwiseBot read-only access to your Kindle highlights for 30 days." Your agent manages which services can access what. Permissions are signed, time-bounded, revocable.

### 15. Document Signing
"Sign NDA with Acme Corp (hash: 0x3f8a...). Summary: Standard 2-year mutual NDA, no non-compete." Your agent reviews contracts, summarizes key terms, proposes signature. Legal commitment requires hardware confirmation.

### 16. Access Token Renewal
"Renew OAuth token for GitHub integration. Expires in 24 hours." Your agent manages your API connections, proposes renewals before they lapse. You maintain control of what has access.

---

## Data & Privacy

### 17. Data Export Authorization
"Authorize export of your health data to new doctor's portal. 847 records, encrypted." Your agent coordinates data portability. You approve exactly what gets shared, with whom, signed on hardware.

### 18. Selective Disclosure
"Share proof of age (>21) with BarApp without revealing birthdate." Your agent creates zero-knowledge proofs from your verified credentials. You approve each disclosure. Privacy-preserving, hardware-secured.

### 19. Data Deletion Request
"Submit GDPR deletion request to 12 services that have your data. Sign authorization for each." Your agent tracks who has your data and helps you exercise your rights. Each request signed individually.

---

## Governance & Voting

### 20. DAO Voting
"Vote YES on Proposal #47: Increase treasury allocation to grants by 10%. Voting ends in 6 hours." Your agent monitors governance across your DAOs, summarizes proposals, reminds you of deadlines. Your vote, your signature, your hardware.

---

## The Pattern

Every use case follows the same pattern:

```
Agent observes    →    Agent proposes    →    Human reviews    →    Hardware signs
  (context)           (intent + reason)      (trusted display)     (physical button)
```

The agent does what agents are good at:
- Monitoring, watching, tracking
- Analyzing, summarizing, recommending
- Preparing, formatting, proposing

The human does what humans must do:
- Final decision on sensitive actions
- Verification on trusted hardware
- Physical confirmation that can't be faked

---

## What This Enables

**Trust without blind trust.** You can give your agent broad capabilities because you know sensitive actions require your approval.

**Autonomy with guardrails.** Set thresholds. Under $10? Auto-approve. Over $100? Always review. You define the policy.

**Audit everything.** Every intent, every approval, every rejection—logged. Know exactly what your agent proposed and what you authorized.

**Sleep at night.** Your agent has access to your digital life. But it can't drain your accounts, sign contracts, or share your data without your physical approval on hardware you control.

---

## Coming Soon

These use cases require only the intent queue pattern. As the ecosystem develops:

- **Spending Vaults:** On-chain enforcement of limits even if the queue is bypassed
- **Multi-sig Intents:** Require multiple humans to approve high-value actions
- **Reputation Scores:** Track which agents historically propose good intents
- **Intent Templates:** Pre-approved patterns for common actions
- **Conditional Intents:** "If ETH drops below $2,000, propose a buy"

The architecture supports all of it. **Agents propose, humans sign with Ledger.**

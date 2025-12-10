# Payment Gateway Research - InmoApp

**Date:** December 9, 2025
**Status:** Research Complete - Decision Pending
**Author:** Claude Code + Juan Quizhpi

---

## 📊 Executive Summary

InmoApp requires a payment gateway to process subscriptions ($0/$4.99/$14.99/mo) for the Ecuador market. This document analyzes **4 viable options** with detailed technical, financial, and strategic considerations.

### TL;DR Recommendation

**Phase 1 (Beta - Feb 2026):** PayPhone with manual billing
**Phase 2 (Growth - Jun 2026):** PayPhone + custom billing system OR migrate to Rebill
**Phase 3 (Scale - 2027):** Stripe via LLC USA (if international expansion)

---

## 🎯 Options Analyzed

| Option | Setup Cost | Annual Cost | Transaction Fees | Equity Dilution | Best For |
|--------|------------|-------------|------------------|-----------------|----------|
| **PayPhone** | $0 | $0 | 5.6% | 0% | MVP/Beta Ecuador |
| **Rebill** | $0 | $6k-12k | 4.5% + $0.20 | 0% | Growth (1k+ users) |
| **Stripe Atlas** | $500 | $1,500-2,000 | 2.9% + transfers | 0% | International |
| **US Partner** | $3k-6k | $3k-6k | 2.9% + transfers | 20-40% | Only if great partner |

---

## 1️⃣ PayPhone (Ecuador Local) ⭐ RECOMMENDED FOR BETA

### Overview

- **Company:** PayPhone Ecuador (Founded 2015)
- **Market Share:** 80% in Ecuador
- **License:** Banco Central del Ecuador
- **Certification:** PCI DSS 4.0, 3D Secure
- **Expansion:** Nicaragua, El Salvador, Panama, Kenya

### Key Features

**Supported Payment Methods:**
- ✅ Visa (credit/debit)
- ✅ Mastercard (credit/debit)
- ✅ Diners Club
- ✅ Discover
- ✅ Electronic money (Central Bank)
- ✅ PayPhone wallet balance

**Available APIs:**
- **API Sale:** Direct charge via PayPhone app (push notification)
- **API Link:** Generate payment links
- **Cajita de Pagos:** Embedded checkout widget (~30 min setup)
- **Payment Button:** Redirect-based flow (~45 min setup)

### Pricing

```
Transaction Fees: 5% + VAT (12%) = 5.6% total
Applied when: Withdrawing to bank account

Example:
User pays $4.99
→ Stays in PayPhone wallet: $4.99 (no fee)
→ Withdraw to bank: Pay $0.28 (5.6%)
→ Receive: $4.71

Alternative:
Keep in PayPhone wallet: $4.99 (zero fee)
Pay suppliers with PayPhone: $4.99 (zero fee)
Only pay fee when withdrawing to bank
```

**Other Fees:**
- Setup: $0
- Monthly minimum: $0
- Bank account required: NO
- PayPhone-to-PayPhone transfers: $0

### ⚠️ CRITICAL: Subscription Support

**PayPhone DOES NOT have native recurring subscriptions.**

**What they HAVE:**
- ✅ Card tokenization (Visa/Mastercard only)
- ✅ Requires PayPhone authorization (1-2 weeks approval)
- ✅ Token generated only if first transaction approved

**What they DON'T HAVE:**
- ❌ Automatic recurring billing system
- ❌ Subscription management (plans, upgrades)
- ❌ Auto-retry failed payments
- ❌ Subscription lifecycle webhooks
- ❌ Customer portal

### Implementation Complexity

**Option A: Manual Billing (Beta)**
```
Complexity: ⭐⭐ (Low)
Dev Time: 5-10 hours
Flow:
1. User pays first month via Cajita de Pagos
2. Email reminder 3 days before expiration
3. User manually pays each month
4. If no payment → Status "expired"

Pros:
✅ Launch in 1 week
✅ Zero technical overhead
✅ $0 fixed cost

Cons:
❌ User friction (must remember to pay)
❌ 20-30% churn (forget to renew)
❌ Not scalable >200 users
```

**Option B: Custom Billing System (Production)**
```
Complexity: ⭐⭐⭐⭐ (High)
Dev Time: 40-80 hours
Flow:
1. Tokenize card on first payment
2. Cron job charges monthly
3. Retry logic (3 attempts)
4. Email notifications
5. Customer portal (cancel, update card)

Pros:
✅ Automatic subscriptions
✅ Stripe-like experience
✅ $0 fixed cost
✅ Scalable to 1k-5k users

Cons:
❌ 4-6 weeks development
❌ Ongoing maintenance
❌ Potential bugs
```

### Technical Details

**Documentation Quality:** ⭐⭐⭐ (3/5)
- Official docs: docs.payphone.app
- Examples: PHP, jQuery, Fetch API
- Testing environment available
- **Issues:** Outdated (2021-2022), broken links, no official SDK

**Webhooks:** ✅ Yes (limited)
- Configure `responseUrl` per payment
- Notifies: payment approved/rejected/cancelled
- No subscription lifecycle events

**Authentication:** Bearer token
- Create API application in PayPhone Business portal
- Obtain TOKEN + STOREID

### Registration Process

**PayPhone Business (RUC required):**
1. Visit payphone.app/business
2. Click "Register"
3. Enter RUC (Ecuador business tax ID)
4. Personal details
5. Done (10-15 minutes)

**API Activation:**
1. Login to PayPhone Business
2. Create "API" type application
3. Get TOKEN and STOREID
4. Integrate

### Cost Analysis (100 paying users)

**Revenue:** 75 BASIC ($4.99) + 25 PRO ($14.99) = $749/mo

```
PayPhone fees: $42/mo (5.6%)
Net revenue: $707/mo (94% margin)
```

### Contact Information

- **WhatsApp:** +593 98 336 9081
- **Help Center:** help.payphone.app
- **Documentation:** docs.payphone.app
- **Business Hours:** Mon-Fri 8:00-18:00 Ecuador time

### Pros & Cons

**✅ Advantages:**
- Zero entry barriers ($0 setup, monthly, minimums)
- 80% market share in Ecuador (high adoption)
- Excellent UX for Ecuadorian users
- Strong compliance (Central Bank license, PCI DSS)
- Flexible withdrawals
- No lock-in

**❌ Disadvantages:**
- NO native subscriptions (must build own system)
- Tokenization requires approval (1-2 weeks)
- Less powerful API than Stripe
- Ecuador only (no international)
- Higher fees (5.6% vs 2.9% Stripe)
- Developer experience ⭐⭐⭐ vs Stripe ⭐⭐⭐⭐⭐

### Recommendation

**Use PayPhone for:**
- ✅ Beta closed (50-200 users, Feb 2026)
- ✅ 100% Ecuador market (first 12 months)
- ✅ $0 budget for infrastructure
- ✅ Need to launch in <2 weeks
- ✅ Can live with manual billing (beta)
- ✅ OR have 40-80h for custom billing system

**Timeline:**
- Week 1: Contact PayPhone, confirm tokenization
- Week 2: Register, get credentials
- Week 3: Integrate Cajita de Pagos
- Week 4: Launch beta

---

## 2️⃣ Rebill (LatAm SaaS Specialist)

### Overview

- **Company:** Rebill (LatAm payment infrastructure)
- **Coverage:** 8+ LatAm countries
- **Specialization:** SaaS, subscriptions, recurring payments
- **Backed by:** VCs ($100M+ funding)

### Key Features

**Subscription Management:**
- ✅ Freemium models
- ✅ Free trials
- ✅ Fixed-rate billing (monthly/annual)
- ✅ Usage-based pricing
- ✅ Custom billing cycles
- ✅ Upgrades/downgrades with proration
- ✅ Automatic retries (71% recovery rate)

**Payment Methods (LatAm):**
- Cards: Visa, Mastercard, Amex
- Bank transfers: PSE (Colombia), PIX (Brazil), SPEI (Mexico)
- Digital wallets: Nequi, Yape, Mercado Pago
- Cash: Pago Fácil, OXXO, Boleto

**Developer Experience:** ⭐⭐⭐⭐⭐ (Stripe-like)
- Modern REST API
- JavaScript/TypeScript SDK (npm: `rebill`)
- Complete documentation: docs.rebill.com
- Integration time: <1 hour (claimed)

### Pricing

**🚨 CRITICAL: Minimum Monthly Fee**

```
Minimum Fee: $500 USD/month
Waived if processing: $6,000-12,000 USD/month

Break-even calculation:
To process $6k/mo with InmoApp pricing:
- Conservative (70% FREE, 25% BASIC, 5% PRO): ~32,000 total users
- Optimistic (50% FREE, 30% BASIC, 20% PRO): ~13,400 total users
```

**Transaction Fees (Ecuador - NOT explicitly listed):**

Estimated based on neighboring countries:
- Colombia: 4.20% + $0.20 (credit), 4.00% + $0.20 (debit)
- Peru: 4.50-5.00% + $0.10

**Likely Ecuador:** ~4.5% + $0.20 per transaction

**Other Fees:**
- Refunds: $2 USD
- Chargebacks: $15 USD
- Withdrawals: $10 USD (<$5k), FREE (>$5k)
- Settlement: 15 calendar days

### Cost Analysis (100 paying users)

**Revenue:** $749/mo

```
Transaction fees (4.5%): ~$34/mo
Minimum fee: $500/mo
Total cost: $534/mo

Net revenue: $215/mo (29% margin) ❌ NEGATIVE until scale
```

**Break-even:** ~700 paying users ($3,500 MRR)

### Ecuador Support

**⚠️ Status: UNCLEAR**

- ✅ Operates in Colombia, Peru (neighbors)
- ❌ Ecuador NOT explicitly listed on pricing page
- ❌ No published fees for Ecuador

**Action Required:** Contact Rebill directly to confirm:
1. Ecuador officially supported?
2. Specific fees for Ecuador?
3. Can negotiate $500 minimum for MVP/beta?

### Pros & Cons

**✅ Advantages:**
- Stripe-like API quality
- Built specifically for SaaS subscriptions
- Operates in 8 LatAm countries (scalable)
- Advanced features (tokenization, one-click)
- Well-funded ($100M+)
- 20% better approval rate vs market
- 71% automatic payment recovery

**❌ Disadvantages:**
- $500/mo minimum (blocker for MVP)
- Requires ~1,000 paying users for break-even
- Combined fees can reach 6-7%
- More complex setup

### Recommendation

**Use Rebill for:**
- ⚠️ NOT recommended for beta (<500 paying users)
- ✅ Growth phase (500-1,000+ paying users)
- ✅ When revenue justifies $500/mo overhead
- ✅ Expansion beyond Ecuador

**Timeline:**
- Contact Rebill to confirm Ecuador support
- If supported + can negotiate minimum → consider for Phase 2
- Otherwise: Skip for now

---

## 3️⃣ Stripe via LLC USA (Stripe Atlas)

### Overview

The "correct" way to access Stripe from Ecuador: create a US company.

**Stripe Atlas Includes:**
- Delaware LLC formation
- EIN (tax ID) from IRS
- Stripe account setup
- Mercury bank account
- Legal templates

### Why Stripe Doesn't Work Directly in Ecuador

**The fundamental problem:** Internet is global, but money is NOT.

**Stripe requires (per country):**
- ❌ Financial licenses ($500k-2M investment)
- ❌ Banking partnerships (local banks)
- ❌ National payment system integration
- ❌ Tax compliance (SRI in Ecuador)
- ❌ KYC/AML infrastructure
- ❌ Sufficient ROI (Ecuador market too small)

**Cost-benefit for Stripe:**
- Setup cost Ecuador: $1M-2M
- Expected revenue Year 1: $500k-1M
- Break-even: 2-4 years

**vs Brazil:**
- Setup cost: $2M-4M
- Expected revenue Year 1: $10M-20M
- Break-even: 6-12 months

**Result:** Stripe prioritizes larger markets, Ecuador not yet viable.

### Pricing

**Setup Costs:**
- Stripe Atlas: $500 (one-time)
- Registered Agent: $100-300/year
- Delaware Franchise Tax: $300/year
- US Accounting: $500-2,000/year
- Tax filing: $500-1,500/year

**Total Year 1:** $1,500-2,300
**Total Year 2+:** $1,000-2,000/year

**Transaction Fees:**
- Stripe: 2.9% + $0.30
- Wire transfers USA→Ecuador: 1-7% (use Wise for 1%)

### Cost Analysis (100 paying users)

**Revenue:** $749/mo

```
Stripe fees (2.9%): ~$22/mo
Monthly overhead: ~$125/mo
Transfer fees (2%): ~$15/mo
Total cost: $162/mo

Net revenue: $587/mo (78% margin)
```

**Break-even:** ~30-40 BASIC users to cover overhead

### Dual Tax Compliance

**USA:**
- Federal Income Tax (30% withholding if non-resident)
- Form 1120 or 1065 (corporate tax return)
- Form 5472 (foreign owner transactions)
- FinCEN BOI Report

**Ecuador:**
- Income tax (worldwide income)
- Monthly VAT declarations (if applicable)
- Electronic invoicing (SRI)
- Annual tax return

**Complexity:** ⭐⭐⭐⭐⭐ (Very High)
**Cost:** $800-2,500/year in accountants

### User Friction in Ecuador

**Problem:** Ecuadorian cards have restrictions for international purchases.

**Limits:**
- Banco Pichincha: $500-2,000/mo international
- Produbanco: $1,000-3,000/mo
- Most banks: Block international by default (must activate)

**Additional fees for users:**
```
User pays $4.99 to US merchant
Bank charges: 3-5% international fee
Total charged: $5.14-5.24
```

**Payment decline rate:**
- Ecuador with international gateway: 15-25%
- Ecuador with local gateway: 5-10%

**Result:** Higher user friction = lower conversion

### Pros & Cons

**✅ Advantages:**
- Full Stripe access (world-class API)
- Global payments from day 1
- International credibility
- Investor-friendly (Delaware standard)
- 0% equity dilution
- Scalable internationally

**❌ Disadvantages:**
- $1,500-2,300 Year 1 cost
- Dual tax complexity
- 15-25% payment decline rate (Ecuador users)
- 1-7% transfer fees USA→Ecuador
- Setup time: 4-6 weeks
- Administrative overhead

### Recommendation

**Use Stripe Atlas for:**
- ❌ NOT recommended for beta
- ⚠️ Consider if you have $2k-3k available capital
- ✅ When 30%+ users are outside Ecuador
- ✅ When seeking international VC funding
- ✅ When revenue >$10k MRR

**Timeline:**
- Week 1: Apply Stripe Atlas ($500)
- Week 2-3: Documents processed
- Week 4: LLC formed, EIN obtained
- Week 5: Stripe account approved
- Week 6: Full integration

---

## 4️⃣ US Strategic Partner (Co-founder)

### Concept

Partner with someone in USA who provides:
- SSN/EIN for Stripe account
- US address for verification
- US bank account access
- Potential additional value (skills, network)

### Legal Requirements

**MANDATORY legal setup ($2k-5k):**

1. **LLC Formation:** Delaware ($300)
2. **Operating Agreement:** ($2k-5k lawyer) ⚠️ DO NOT SKIP
3. **Vesting Schedule:** 4 years, 1-year cliff
4. **Buy-Sell Agreement:** Shotgun clause, ROFR
5. **IP Assignment Agreement:** All IP owned by LLC
6. **NDA/Non-compete:** Protect confidential info
7. **EIN:** Free (IRS)
8. **Bank Account:** Mercury/Wise ($20-40/mo)

### Equity Considerations

**Partner contributes:**
- SSN/address USA
- Stripe account setup
- US compliance management (5-10h/mo)

**Partner does NOT contribute:**
- Code (you write it)
- Product (you design it)
- Customers (you acquire them)
- Capital

**Fair equity split:**
- Contributes significant work: 20-30%
- Moderate work: 10-20%
- Only lending SSN: 5-10%

**Cost of equity:**
```
If InmoApp worth $1M in 5 years:
- Partner 20% = $200k cost
- Partner 40% = $400k cost

vs Stripe Atlas:
- $1,500 + $7,500 (5 years) = $9k total
- Savings: $191k-391k
```

### 🚨 Critical Risks

**1. Fraud/Theft Risk (HIGH):**
```
Scenario: Month 6, $10k in Stripe account
Partner has full access (SSN, name on account)
One day: Withdraws all money and disappears

You:
❌ Can't sue (US jurisdiction, expensive)
❌ Can't recover funds (account in their name)
❌ Can't prove fraud (ambiguous equity agreement)
❌ Lose 6 months work + $10k
```

**Frequency:** ~15-20% of online "stranger" partnerships end badly

**2. Legal Control:**
```
Partner = Registered LLC member
→ Legal rights over:
  - Bank account
  - Stripe account
  - Domain (if in their name)
  - Contracts
  - Intellectual property

Year 2: InmoApp worth $500k
Partner: "I want 50% equity, not 20%"
You: "No, we agreed 20%"
Partner: "Sue me. Meanwhile, I freeze Stripe account"

Options:
A) Give in (lose 30% equity)
B) Legal battle ($50k-150k lawyers)
C) Start over with new company
```

**3. Dependency:**
```
What if partner:
- Gets sick?
- Loses interest?
- Gets full-time job?
- Has legal problems (IRS, bankruptcy)?

→ Your business DEPENDS on them
→ Can't operate without cooperation
```

### Risk Mitigation (ESSENTIAL)

**1. Vesting Schedule:**
```
Year 1: 0% vested (cliff)
Year 2: 25% vested
Year 3: 50% vested
Year 4: 100% vested

If partner leaves Month 6:
→ Loses ALL equity (cliff not reached)
→ You can buy back shares at $100
```

**2. Dual Access Control:**
```
❌ Partner controls Stripe alone
❌ Partner has only password to bank
❌ Partner is sole admin everywhere

✅ Stripe: 2 admins (you + partner)
✅ Bank: 2 signatories required
✅ Domain/hosting: Your primary control
✅ GitHub: Your ownership
✅ Withdrawals >$1k: Require 2 signatures
```

**3. Operating Agreement Clauses:**
- **Bad Leaver:** Fraud/compete = lose all equity
- **Good Leaver:** Health/mutual = keep vested equity
- **Shotgun:** Either can trigger buy/sell
- **Drag-along:** Majority can force exit
- **ROFR:** Must offer equity to partners first

### Partner Types

**Type 1: Trusted Friend/Family (5+ years)**
- High trust
- Lower equity acceptable (5-15%)
- Risk: Conflict ruins personal relationship

**Type 2: Real Co-founder (Skills + Work)**
- Contributes marketing, sales, or technical skills
- Motivated, wants to build
- Fair equity: 20-40%
- Risk: Hard to find, higher dilution

**Type 3: Nominee (Paid Service)**
- Commercial service, lends identity
- Monthly fee: $200-500
- No equity
- ⚠️ Violates Stripe TOS (RISKY)

**Type 4: Advisor (2-5% equity)**
- Established professional
- 5-10h/mo strategic help
- Lends identity for infrastructure
- Risk: May lose interest

### Cost Analysis (100 paying users)

**Revenue:** $749/mo

```
Stripe fees: ~$22/mo
Overhead: ~$50/mo
Equity cost (20%): ~$150/mo (20% of net)
Total: $222/mo

Net to you: $527/mo (70% margin)
```

### Pros & Cons

**✅ Advantages:**
- Immediate Stripe access
- Low initial cost ($0-500)
- Potential additional value (network, skills)
- International credibility

**❌ Disadvantages:**
- 20-40% equity dilution
- HIGH fraud/theft risk
- Complex governance
- $2k-5k legal setup (MANDATORY)
- Critical dependency
- 2-3 months timeline

### Recommendation

**ONLY pursue US partner if:**
- ✅ Know them personally 2+ years
- ✅ They contribute MORE than SSN (50%+ work)
- ✅ You have $5k for proper legal setup
- ✅ You can afford 20-40% dilution
- ✅ Strong Operating Agreement in place

**DO NOT pursue if:**
- ❌ Partner is "friend of friend" (low trust)
- ❌ Only contributes SSN (not worth 20% equity)
- ❌ No budget for legal ($2k-5k required)
- ❌ Can't meet in person in USA

---

## 🎯 Final Recommendation

### Phase-Based Strategy

**Phase 1: Beta Closed (Feb-Jun 2026) - 50-200 users**
```
✅ USE: PayPhone (manual billing)

Why:
- Zero cost to start
- Validate PMF first
- Local users (less friction)
- No equity dilution
- Launch in 1-2 weeks

Action: Contact PayPhone this week
```

**Phase 2: Beta Public (Jul-Dec 2026) - 200-1,000 users**
```
✅ OPTION A: Continue PayPhone
✅ OPTION B: PayPhone + custom billing (if time available)
✅ OPTION C: Evaluate Rebill (if >700 paying users)

Trigger: When PayPhone fees > $500/mo
```

**Phase 3: LatAm Expansion (2027+) - 1k-10k users**
```
✅ MIGRATE TO: Stripe Atlas OR Rebill

Why:
- 30%+ users outside Ecuador
- Revenue justifies overhead ($5k+ MRR)
- Need multi-country infrastructure

Trigger: When 30%+ users are international
```

### Decision Matrix

| Situation | Recommended Option |
|-----------|-------------------|
| Beta <200 users, Ecuador only | **PayPhone manual** |
| Growth 200-1k users, Ecuador only | **PayPhone custom billing** |
| Growth >1k paying users, Ecuador | **Rebill OR Stripe Atlas** |
| >30% international users | **Stripe Atlas** |
| Have $5k+ capital available | **Stripe Atlas** |
| Know trusted US partner 2+ years | **Consider US partner** |
| Seeking VC funding | **Stripe Atlas** |

### Immediate Next Steps

**This Week:**
1. ✅ Contact PayPhone (WhatsApp: +593 98 336 9081)
2. ✅ Ask about tokenization for SaaS
3. ✅ Request activation process details
4. ✅ Confirm limitations/restrictions

**Next Week:**
1. Register PayPhone Business (RUC required)
2. Create API application
3. Obtain TOKEN + STOREID
4. Setup testing environment

**Week 3:**
1. Integrate Cajita de Pagos
2. Test payment flow
3. Verify webhooks
4. Measure UX

**Launch Date Target:** February 2026

---

## 📚 Resources

### PayPhone
- Website: payphone.app/business
- Docs: docs.payphone.app
- Support: +593 98 336 9081 (WhatsApp)
- Help: help.payphone.app

### Rebill
- Website: rebill.com
- Docs: docs.rebill.com
- Pricing: rebill.com/en/pricing

### Stripe Atlas
- Website: stripe.com/atlas
- Docs: stripe.com/docs
- Cost: $500 setup

### General
- Payment comparison: See COST_SCALING_ANALYSIS.md
- Ecuador strategy: See ECUADOR_STRATEGY.md
- Freemium pricing: See DECISIONS_APPROVED.md

---

## 📊 Appendix: Cost Comparison Table

### 100 Paying Users ($749 MRR)

| Option | Setup | Monthly | Transaction | Total/mo | Net | Margin |
|--------|-------|---------|-------------|----------|-----|--------|
| PayPhone Manual | $0 | $0 | 5.6% | $42 | $707 | 94% |
| PayPhone Custom | $0 | $0 | 5.6% | $42 | $707 | 94% |
| Rebill | $0 | $500 | 4.5% | $534 | $215 | 29% ❌ |
| Stripe Atlas | $500 | $125 | 2.9%+2% | $162 | $587 | 78% |
| US Partner (20%) | $3k | $50 | 2.9%+20% | $222 | $527 | 70% |

### 1,000 Paying Users ($7,490 MRR)

| Option | Setup | Monthly | Transaction | Total/mo | Net | Margin |
|--------|-------|---------|-------------|----------|-----|--------|
| PayPhone | $0 | $0 | 5.6% | $419 | $7,071 | 94% |
| Rebill | $0 | $500 | 4.5% | $837 | $6,653 | 89% |
| Stripe Atlas | $500 | $125 | 2.9%+1% | $417 | $7,073 | 94% |

**Break-even points:**
- Rebill vs PayPhone: ~700 paying users
- Stripe vs PayPhone: ~30 users (but user friction higher)

---

## 🔄 Version History

- **v1.0** (Dec 9, 2025): Initial research complete
  - PayPhone deep dive completed
  - Rebill analysis
  - Stripe Atlas option documented
  - US Partner risks outlined

---

**Status:** ✅ Research Complete
**Next Action:** Contact PayPhone for tokenization confirmation
**Decision Date:** December 16, 2025 (target)

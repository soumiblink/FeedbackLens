# FeedbackLens

**An AI-assisted product intelligence workspace that helps Product Managers turn customer feedback into confident product decisions.**

Every product team collects customer feedback, but collecting it is rarely the challenge. The real challenge is understanding what customers are consistently struggling with, deciding which problems deserve attention, and measuring whether those decisions actually improve the user experience.

FeedbackLens transforms raw customer feedback into structured insights. It helps Product Managers investigate recurring issues, prioritize opportunities, document decisions, validate releases, and track product health—all from a single workspace. Rather than automating judgment, it organizes evidence so decisions are more transparent and easier to justify.


## The Problem

Customer feedback is one of the most valuable inputs into product strategy, yet it's scattered across support tickets, app reviews, surveys, forums, and interviews. Turning thousands of individual comments into actionable decisions remains largely manual.

Product Managers need to identify recurring problems, understand which issues affect the most customers, balance competing requests, and justify prioritization with evidence. In practice, this means switching between spreadsheets, dashboards, and notes while manually searching for patterns.

Most feedback tools focus on collection or analysis. Few support the complete workflow—moving from raw feedback to prioritized opportunities, documented decisions, release validation, and continuous improvement.

FeedbackLens bridges that gap by treating feedback not as isolated comments, but as evidence supporting every stage of the decision process.


## How It Works

FeedbackLens follows the same workflow Product Managers already use, replacing scattered spreadsheets with a structured workspace.

**1. Collect Feedback** – Import feedback from surveys, support tickets, app reviews, or other sources.

**2. Identify Patterns** – Analyze sentiment, recurring topics, complaints, and feature requests. Similar issues are grouped into opportunities.

**3. Prioritize Opportunities** – Rank opportunities using transparent signals: customer frequency, complaint rate, sentiment impact, and confidence.

**4. Make Decisions** – Investigate supporting evidence, document rationale, and track status from investigation through implementation.

**5. Measure Outcomes** – Compare feedback before and after releases to validate whether changes reduced customer pain points.

```text
Collect Feedback → Identify Patterns → Prioritize → Decide → Validate → Monitor
```


## Application Screenshots

### Dashboard

Provides an executive overview of customer feedback, sentiment distribution, trending issues, and product metrics.

![Dashboard](assets/screenshots/dashboard.png)

### Product Health Center

Calculates an overall product health score using customer feedback trends, complaint rate, feature requests, and historical comparisons.

![Product Health](assets/screenshots/product-health.png)

### Feedback Inbox

Browse every feedback item with filters for sentiment, feedback type, topics, and automatically calculated priority scores.

![Feedback Inbox](assets/screenshots/feedback-inbox.png)

### Opportunity Prioritization

Ranks product opportunities using AI-assisted scoring based on frequency, severity, confidence, and business impact.

![Prioritization](assets/screenshots/prioritization.png)

### Customer Segments

Analyze how different customer groups experience the product and compare health metrics across user segments.

![Customer Segments](assets/screenshots/customer-segments.png)

### Roadmap Planner

Convert validated customer opportunities into actionable roadmap items for product planning.

![Roadmap Planner](assets/screenshots/roadmap-planner.png)

### Product Changelog

Track releases and visualize how customer feedback evolves across multiple product versions.

![Changelog](assets/screenshots/changelog.png)


## Core Capabilities

### Feedback Intelligence
Transforms unstructured customer feedback into structured insights through sentiment analysis, topic extraction, complaint detection, and feature request identification.

### Opportunity Discovery
Groups recurring problems into ranked opportunities using frequency, complaint rate, and sentiment impact—helping teams focus on issues with the greatest customer impact.

### Decision Management
Documents every prioritization decision alongside supporting evidence, creating a transparent record of what was decided and why.

### Roadmap Planning
Promotes validated opportunities into roadmap initiatives tracked from Backlog to Released, connecting customer feedback directly to product execution.

### Release Validation
Compares feedback before and after each release to measure whether changes achieved their intended outcome.

### Product Health Monitoring
Provides a consolidated view of sentiment, complaint trends, opportunity backlog, customer segments, and release performance.



## Product Design Decisions

Throughout the project, I prioritized features that support a Product Manager's workflow rather than adding capabilities because they were technically interesting.

**Evidence over automation.** Instead of asking AI to recommend what to build next, FeedbackLens surfaces signals like frequency, complaint rate, and sentiment—letting Product Managers make the final call based on data and business context.

**Traceability matters.** Every opportunity can be investigated, linked back to original feedback, documented in the Decision Center, promoted into the roadmap, and evaluated after release. This creates a continuous record: problem → decision → outcome.

**Transparent prioritization.** Rather than relying entirely on AI recommendations, the system combines deterministic signals with AI-assisted analysis. This makes every decision easier to understand, explain, and challenge.

**Focus beats features.** I intentionally avoided adding complexity that didn't improve the core workflow. The goal was a focused workspace that helps Product Managers move from feedback to decisions with confidence.



## How I Would Measure Success

If FeedbackLens were a real product, I'd evaluate it using outcomes rather than feature usage.

**Adoption**
- Active Product Managers using the platform weekly
- Customer feedback processed through FeedbackLens vs. manual workflows

**Decision Quality**
- Roadmap initiatives linked to supporting customer evidence
- Time required to investigate and prioritize an opportunity

**Product Outcomes**
- Change in customer sentiment after releases
- Reduction in recurring complaints for prioritized opportunities
- Releases demonstrating measurable improvement

**User Experience**
- Time from raw feedback to documented decision
- Product Manager satisfaction with the prioritization workflow


## Future Product Roadmap

If FeedbackLens were to evolve beyond a portfolio project, these investments would strengthen the product experience and enable broader adoption.

### Short Term
- **Jira integration** – Sync opportunities directly to Jira issues
- **Slack notifications** – Alert teams when high-priority feedback arrives
- **Duplicate feedback detection** – Automatically merge similar feedback items
- **Saved custom filters** – Save frequently used views for faster access
- **Export functionality** – Export insights and reports to CSV or PDF

### Mid Term
- **User authentication** – Enable multi-user workspaces with role-based access
- **Team collaboration** – Add comments, mentions, and shared decision workflows
- **Custom prioritization frameworks** – Support RICE, ICE, MoSCoW, and custom scoring models
- **Product analytics integrations** – Connect with Mixpanel, Amplitude, or Heap to correlate feedback with usage data
- **API access** – Allow external tools to push feedback programmatically

### Long Term
- **Multi-product workspaces** – Manage feedback across multiple product lines
- **Release impact prediction** – Use historical patterns to forecast release outcomes before shipping
- **Voice of Customer analytics** – Analyze sentiment trends across channels, time periods, and customer cohorts
- **Continuous customer health monitoring** – Real-time alerts when product health degrades
- **LLM-powered insights** – Generate executive summaries and suggested actions automatically



## Technology Stack

FeedbackLens is presented as a Product Management case study, but I built a working prototype to validate the product concept.

**Frontend**
- React, TypeScript, Tailwind CSS
- Vite, Framer Motion, Recharts

**Backend**
- FastAPI, SQLAlchemy, SQLite

**AI & Machine Learning**
- TF-IDF + Logistic Regression for sentiment classification
- Groq API for topic extraction, complaint detection, and feature request identification
- Deterministic scoring for opportunity prioritization



## Getting Started

### Prerequisites

* Python 3.10+
* Node.js 18+
* Groq API Key

### Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt

# Create .env
GROQ_API_KEY=your_groq_api_key

python main.py
```

The backend will start on **http://localhost:8000**

---

### Frontend

```bash
cd frontend

npm install

# Create .env
VITE_API_URL=http://localhost:8000

npm run dev
```

The frontend will start on **http://localhost:5173**

---

### Demo Workflow

1. Upload a customer feedback dataset
2. Review generated insights in the Feedback Inbox
3. Explore prioritized opportunities
4. Investigate supporting evidence
5. Document a product decision
6. Move validated opportunities into the roadmap
7. Compare releases using Release Impact Analysis
8. Monitor Product Health over time


## Portfolio Context

FeedbackLens is a Product Management portfolio project exploring how customer feedback can be transformed into structured decisions.

Rather than focusing on individual features, I designed an end-to-end workflow reflecting how Product Managers work in practice—from identifying customer problems to prioritizing opportunities, documenting decisions, planning initiatives, and validating releases.

I made intentional trade-offs to keep the product focused. Instead of maximizing features, I prioritized clarity, traceability, and transparent decision-making. Every capability exists to support a specific step in the product lifecycle.

If this were a production environment, I'd add collaboration features, support platform integrations, user authentication, richer analytics, and longitudinal health tracking. But as a portfolio project, the goal is to demonstrate how I think about product strategy, prioritization, user workflows, and building solutions around real customer problems.

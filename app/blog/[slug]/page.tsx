import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";

// ─── Article content ──────────────────────────────────────────────────────────

const POSTS: Record<
  string,
  {
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    content: string;
  }
> = {
  "freight-south-africa-guide": {
    title: "Freight in South Africa: The Complete Guide for 2024",
    excerpt:
      "Everything you need to know about moving freight across South Africa — regulations, corridors, compliance requirements, and how technology is reshaping the industry.",
    category: "Industry Guide",
    readTime: "8 min read",
    date: "March 2024",
    content: `
South Africa's road freight sector is the backbone of its economy. With over 80% of all goods transported by road, the industry employs hundreds of thousands of people and underpins virtually every sector — from mining and agriculture to retail and pharmaceuticals.

Yet for all its scale, the industry has historically operated in a fragmented, analogue way. This guide covers everything you need to know about freight in South Africa in 2024 — from how loads are moved, to compliance requirements, to the digital platforms now transforming the sector.

## The Scale of South African Road Freight

South Africa's road freight industry is one of the largest on the African continent. The country's 750,000+ km road network connects all nine provinces and serves as the primary distribution channel for the entire southern African region.

Key facts:
- Over **R350 billion** in goods moved by road annually
- More than **550,000 trucks** registered in South Africa
- The N1, N3, and N4 corridors are among the continent's busiest freight routes
- Johannesburg's logistics hub is the largest in sub-Saharan Africa

## How Freight is Sourced in South Africa

Traditionally, freight suppliers (companies that need to move goods) have sourced transport through:

- **Personal networks** — calling transporters they've worked with before
- **Freight brokers** — intermediaries who match loads to trucks for a commission
- **WhatsApp groups** — informal networks where loads are advertised
- **Cold calling** — contacting trucking companies directly

Each of these approaches has serious drawbacks: no verification, no transparency, and significant time wasted on coordination.

## Compliance: What Every SA Freight Business Needs to Know

South Africa has strict compliance requirements for freight transport. Both suppliers and transporters must maintain current documentation:

### For Transporters
- **CIPC Certificate** — proof of company registration with the Companies and Intellectual Property Commission
- **Tax Clearance Certificate** — issued by SARS, confirming tax compliance
- **Professional Driving Permit (PDP)** — required for all drivers carrying goods or passengers
- **Roadworthy Certificate** — issued after vehicle inspection at a testing station
- **Brake Test Certificate** — required for heavy vehicles
- **Truck and Trailer Registration Documents** — issued by the Department of Transport

### For Suppliers
- **CIPC Certificate** — business registration
- **Tax Clearance Certificate** — SARS compliance
- **ID Documentation** — for directors and key personnel

Non-compliance can result in fines, load delays, and serious liability exposure in the event of an accident.

## South Africa's Key Freight Corridors

### Domestic Corridors
- **N3: Johannesburg – Durban** — the busiest freight corridor in SA, carrying goods between Gauteng's industrial hub and the Port of Durban
- **N1: Cape Town – Johannesburg** — connecting the Western Cape to Gauteng
- **N4: Mozambique Corridor** — linking Gauteng to Maputo Port
- **N12/N14: Gauteng – North West/Limpopo** — serving mining regions

### Cross-Border Corridors
South Africa borders six countries, all of which are significant trading partners:
- **Namibia** via the Trans-Kalahari and Trans-Caprivi corridors
- **Zimbabwe** via Beit Bridge (one of Africa's busiest border posts)
- **Mozambique** via Ressano Garcia and Lebombo
- **Botswana** via Ramatlabama
- **Lesotho** and **Eswatini** via multiple border crossings

## The Rise of Digital Freight Platforms

The most significant shift in South African road freight over the past five years has been the emergence of digital matching platforms. These platforms connect freight suppliers with verified transporters, replacing phone calls and spreadsheets with structured, transparent, digital workflows.

**Freight Link Network** is South Africa's purpose-built B2B freight platform, designed specifically for the SA regulatory environment. Key capabilities include:

- Verified transporter profiles with compliance document management
- Digital load posting and real-time status tracking
- Cross-border corridor support (SA + 6 neighbouring countries)
- Admin-reviewed compliance documents before account activation

## What to Look for in a Freight Transport Partner

When selecting a transporter for your freight loads, prioritise:

1. **Compliance documentation** — always request CIPC, tax clearance, and PDP copies
2. **Insurance cover** — goods-in-transit insurance is essential
3. **Fleet condition** — roadworthy and brake test certificates indicate maintenance standards
4. **Track record** — references from other suppliers
5. **Communication** — can they provide ETAs, driver contact details, and POD (Proof of Delivery)?

## Looking Ahead: SA Freight in 2024 and Beyond

The SA freight industry faces a number of headwinds heading into 2024:

- **Diesel price volatility** — fuel typically accounts for 30–40% of trucking operating costs
- **Load shedding** — power outages impact warehousing, cold chain logistics, and administration
- **Infrastructure pressure** — key routes like the N3 and border posts face congestion
- **Driver shortage** — the industry faces a significant shortage of qualified, PDP-certified drivers

Despite these challenges, the sector is adapting. Digital tools are reducing dead kilometres (empty return trips), improving load matching efficiency, and bringing much-needed transparency to an industry long defined by informal relationships.

---

**Freight Link Network** was built to give both suppliers and transporters the tools they need to thrive in this environment. [Register for free](/register) and join South Africa's growing digital freight network.
    `,
  },

  "freight-loads-find-transport": {
    title: "How to Find Reliable Transport for Your Freight Loads",
    excerpt:
      "Sourcing compliant, reliable trucks for your freight loads doesn't have to mean hours on the phone. Learn how digital freight matching is changing the game for SA suppliers.",
    category: "For Suppliers",
    readTime: "6 min read",
    date: "March 2024",
    content: `
If you're a freight supplier in South Africa — whether you're in mining, agriculture, manufacturing, or retail — finding reliable transport for your loads is one of your most persistent operational challenges.

The traditional approach of calling transporters, negotiating rates via WhatsApp, and manually tracking progress by phone is time-consuming, error-prone, and offers no visibility. In 2024, there's a better way.

## The Problem with Traditional Freight Sourcing

Most SA freight suppliers still rely on some combination of:

- **Personal contact lists** built up over years in the industry
- **WhatsApp groups** where loads are posted informally
- **Freight agents or brokers** who add cost and a communication layer
- **Cold calling** unfamiliar trucking companies

Each of these approaches has the same fundamental flaw: **no verification**. You have no reliable way of knowing whether the transporter you're using is CIPC-registered, tax-compliant, properly insured, or operating roadworthy vehicles — until something goes wrong.

## What to Verify Before Handing Over Your Load

Before committing to any transporter, you should confirm:

### Business Registration
The transporter should be a registered company with a valid CIPC certificate. This confirms legal standing and provides recourse in the event of a dispute.

### Tax Compliance
A valid SARS Tax Clearance Certificate confirms the business is up to date on its tax obligations — a basic indicator of financial health and legitimate operations.

### Driver Qualifications
Every driver carrying goods on South African roads must hold a valid **Professional Driving Permit (PDP)**. This is a legal requirement, not an optional credential. Hiring a transporter without checking driver PDPs exposes you to liability.

### Vehicle Roadworthiness
Roadworthy certificates and brake test certificates confirm that the vehicles being used are legally permitted to operate on South African roads. Overloaded or mechanically compromised vehicles are a major cause of accidents — and if goods are damaged, the transporter's liability depends heavily on whether their vehicles were compliant.

### Insurance
Goods-in-transit insurance protects your cargo in the event of theft, accident, or damage. Always confirm coverage before dispatch.

## The Digital Alternative: Freight Matching Platforms

Modern freight matching platforms like **Freight Link Network** do the compliance verification work for you. On FLN:

- Every transporter company is **verified before activation** — CIPC, tax clearance, and PDP documents are reviewed by the FLN admin team
- You post your load once and **transporters come to you**
- Load status is tracked digitally — no need to chase drivers for updates
- Cross-border loads are supported with full corridor visibility

### How It Works for Suppliers

1. **Register and complete onboarding** — submit your company details and compliance documents
2. **Get verified** — the FLN team reviews your submission within 1–3 business days
3. **Post a load** — specify pickup location, delivery address, cargo type, weight, and any special requirements
4. **Receive interest** — verified transporters on the platform can express interest in your load
5. **Track progress** — monitor your load status from approval through to delivery

## Tips for Writing a Great Load Post

When posting freight loads, the more detail you provide, the better:

- **Cargo type** — be specific (e.g. "agricultural equipment" not just "machinery")
- **Weight in tons** — critical for matching to the right truck class
- **Required trailer type** — tautliner, flatbed, lowbed, refrigerated, etc.
- **Pickup and delivery windows** — give realistic time frames
- **Special instructions** — hazardous goods, fragile items, temperature requirements
- **Budget** — transparent pricing attracts serious transporters

## Red Flags When Evaluating a Transporter

Watch out for:
- Refusal to provide compliance documentation
- Pressure to pay in cash or outside formal channels
- No clear track record or references
- Vehicles that look poorly maintained
- Drivers without PDP documentation

## Building Long-Term Transporter Relationships

The best outcomes in freight come from consistent relationships with reliable transporters. Once you've found partners who deliver on time, communicate proactively, and maintain their compliance, nurture those relationships.

Digital platforms help here too — they maintain a record of past loads, making it easy to return to transporters who've served you well.

---

**Freight Link Network** was built to make this process faster, safer, and more transparent for suppliers across South Africa. [Post your first load](/register) and connect with our network of verified transporters.
    `,
  },

  "diesel-price-impact-transporters": {
    title: "Diesel Prices & SA Trucking: How to Protect Your Margins",
    excerpt:
      "South African diesel prices are among the most volatile in the region. We break down how rising fuel costs are squeezing transporters — and how smarter load matching helps reduce empty kilometres.",
    category: "For Transporters",
    readTime: "7 min read",
    date: "February 2024",
    content: `
Fuel is the single largest operating cost for most South African trucking companies. For a long-haul operator running multiple trucks, diesel alone can account for **30–40% of total operating expenses**. When diesel prices spike — as they have repeatedly since 2021 — the entire economics of a trucking business can shift in a matter of weeks.

This article explores the impact of South Africa's diesel price volatility on transporters, and how smarter load matching can help protect margins.

## South Africa's Diesel Price Problem

South Africa's diesel price is set monthly by the Department of Mineral Resources and Energy (DMRE), based on a combination of:

- **International crude oil prices** (benchmarked against Brent crude)
- **The rand/dollar exchange rate** — a weaker rand pushes prices higher
- **Fuel taxes and levies** — including the Road Accident Fund (RAF) levy and general fuel levy
- **Basic Fuel Price (BFP)** adjustments

This means SA truckers face a double exposure: global oil market volatility AND rand weakness. When both move against you at the same time — as happened dramatically in 2022 — the impact on operating costs is severe.

### What Diesel Price Increases Cost a Typical Fleet

For a truck averaging **3–4 km per litre** over a typical long-haul route:

- A **200-kilometre round trip** requires roughly 55–65 litres of diesel
- At **R24/litre**, that's approximately **R1,500 in fuel** per trip
- A 15% price increase adds **R225 per trip** — or **R4,500+ per month** per truck on a typical schedule

For a fleet of 10 trucks, that 15% increase represents an additional **R45,000+ per month** in fuel costs. Recovering that through rate increases is rarely quick or easy.

## The Hidden Cost: Empty Kilometres

Beyond absolute fuel prices, the biggest margin killer in South African trucking is **empty return trips** — driving back from a delivery point without a load.

In many regional routes, empty return legs are simply accepted as a cost of doing business. But they represent a massive inefficiency:

- **Fuel burned** without generating revenue
- **Driver time** paid without freight income
- **Wear and tear** on the vehicle with no offset

The South African Shippers' Council has estimated that empty or partial-load trips cost the industry **billions of rands annually**. For individual operators, a 30% empty-km rate can erode profitability by a significant margin.

## How Load Matching Reduces Empty Kilometres

Digital freight platforms like **Freight Link Network** directly address the empty kilometre problem by connecting transporters with loads that match their routes.

Here's how it works in practice:

### Example Scenario
A transporter delivers a load from Johannesburg to Durban. Without access to a load matching platform, the return trip is almost certainly empty — the driver heads back to Gauteng hauling air.

With FLN:
1. Before completing the delivery, the transporter checks available loads on the platform
2. They find a load from Durban to Johannesburg posted by a verified supplier
3. They accept the return load, covering most or all of their return fuel costs

This single behaviour change — backloading — can significantly improve the economics of a route.

## Other Strategies to Protect Margins

### Fuel Surcharges
Many professional freight contracts include a **fuel surcharge clause** that adjusts rates when diesel prices move beyond a defined threshold. If you're not including fuel surcharges in your contracts, you're absorbing all price risk personally.

A typical structure: rates are set at a baseline diesel price, and an agreed percentage is added or subtracted for each R1/litre movement from that baseline.

### Route Optimisation
Dead kilometres accumulate through inefficient routing — multiple short runs that could be consolidated, or routes that don't account for traffic patterns and load timing.

### Fleet Maintenance
A poorly maintained truck uses significantly more fuel than a well-serviced vehicle. Tyre pressure alone can affect fuel consumption by 5–10%. Regular brake tests and roadworthy inspections aren't just a compliance requirement — they're good business.

### Load Density
Hauling partial loads reduces revenue per kilometre without reducing fuel costs proportionally. Optimising load fill rates — carrying more freight per trip — directly improves fuel economics.

## Compliance as a Business Advantage

There's a less obvious connection between compliance and fuel costs: **verified, compliant transporters attract better loads and better clients**.

Suppliers posting freight on FLN and similar platforms are increasingly sophisticated. They want:
- Proof of vehicle roadworthiness
- Driver PDP documentation
- Insurance confirmation

Transporters who have their compliance in order can access a wider pool of loads — including high-value, regular freight contracts that make route planning (and backloading) much easier.

Maintaining compliance is not just a legal obligation. It's a competitive advantage.

## The Bottom Line

Diesel price volatility is a structural challenge for SA trucking operators — one that's unlikely to disappear. The transporters who survive and grow are those who:

1. Price fuel risk correctly in their rate structures
2. Minimise empty kilometres through proactive load matching
3. Maintain their vehicles properly to maximise fuel efficiency
4. Maintain full compliance to access better quality loads

**Freight Link Network** was built to help transporters do all of this more easily. [Join the platform](/register) and start finding loads that fill your return trips.
    `,
  },

  "cross-border-freight-africa": {
    title: "Cross-Border Freight in Southern Africa: Corridors, Compliance & Costs",
    excerpt:
      "Moving freight between South Africa, Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini requires the right documentation, the right partners, and the right platform.",
    category: "Cross-Border",
    readTime: "9 min read",
    date: "February 2024",
    content: `
South Africa is the economic hub of the Southern African Development Community (SADC). Goods flow constantly between South Africa and its six neighbours — Namibia, Zimbabwe, Mozambique, Botswana, Lesotho, and Eswatini — along corridors that are among the busiest in sub-Saharan Africa.

For freight operators, cross-border haulage represents both a significant opportunity and a significant compliance burden. This guide covers the key corridors, documentation requirements, and practical considerations for cross-border freight in southern Africa.

## Southern Africa's Cross-Border Freight Landscape

### Why Cross-Border Freight Matters

South Africa's regional trading relationships are substantial:

- **Mozambique** — the Port of Maputo handles significant SA cargo and mineral exports
- **Zimbabwe** — a major trading partner with constant two-way freight flows
- **Namibia** — mining exports and consumer goods imports
- **Botswana** — diamond and mineral flows plus consumer goods
- **Lesotho** — textile exports and consumer goods imports
- **Eswatini** — sugar, citrus, and manufactured goods

For transporters, cross-border loads often command premium rates due to the additional compliance requirements — but they also require significantly more preparation.

## Key Cross-Border Corridors

### North Corridor: SA – Zimbabwe via Beit Bridge
The Beit Bridge crossing between Musina (SA) and Beitbridge (Zimbabwe) is one of the busiest border posts in Africa. Delays here are infamous — trucks can queue for days during peak periods or customs processing backlogs.

**Key considerations:**
- Pre-clearance via ASYCUDA (Zimbabwe's customs system) is strongly recommended
- SA-side Customs processing via SARS
- Transit documents required for goods passing through to Zambia or beyond

### East Corridor: SA – Mozambique via Ressano Garcia / Lebombo
The Ressano Garcia/Lebombo crossing connects Nelspruit in Mpumalanga with Maputo, Mozambique's capital and port city.

**Key considerations:**
- Port of Maputo handles significant regional cargo
- Mozambican customs uses the SOAMAR system
- SADC Certificate of Origin benefits available

### West Corridor: SA – Namibia via Ramatlabama / Nakop
Multiple crossing points serve the SA-Namibia corridor, with Trans-Kalahari and Trans-Caprivi routes connecting to Windhoek and beyond.

**Key considerations:**
- Namibia has relatively efficient border processing
- Goods in transit to Angola require additional documentation

### Lesotho and Eswatini
Both kingdoms are landlocked within or adjacent to South Africa's borders, with multiple crossing points. These are often more straightforward than the northern corridors.

## Documentation Requirements

Cross-border freight requires substantially more documentation than domestic haulage. Requirements vary by country, but the following apply broadly:

### For the Transporter
- **Valid South African vehicle registration documents** for truck and trailer
- **Cross-border permit** — required for commercial vehicles crossing international borders
- **PrDP (Professional Driving Permit)** for drivers
- **Third-party insurance** valid in the destination country
- **Vehicle roadworthy certificate**

### For the Cargo
- **Commercial Invoice** — detailed description of goods, value, and parties
- **Packing List** — itemised list of goods in each consignment
- **Bill of Lading or Waybill** — transport document issued by the carrier
- **SARS Export Declaration (SAD500)** — for goods leaving SA
- **Import Declaration** in the destination country
- **SADC Certificate of Origin** — enables preferential tariff rates within SADC
- **Phytosanitary Certificate** — required for agricultural products
- **Health Certificate** — required for food products and certain goods

### For Hazardous Goods
- **ADR documents** (European Agreement concerning the International Carriage of Dangerous Goods by Road) equivalent
- **MSDS (Material Safety Data Sheet)**
- Special packaging and marking requirements

## Border Post Processing: What to Expect

### South African Side (SARS Customs)
South Africa uses the **SARS customs system** for export processing. Transporters should:

1. Submit an export declaration (SAD500) electronically before arrival at the border
2. Present documentation to SARS customs officers
3. Have goods inspected (scanning is increasingly used)
4. Receive export clearance before proceeding

Processing time varies from a few hours to multiple days at congested posts like Beit Bridge.

### Destination Country Customs
Each country has its own customs system and processing requirements. Zimbabwe uses ASYCUDA World, Mozambique uses SOAMAR, Botswana uses ASYCUDA, Namibia uses ASYCUDA.

Working with a **clearing agent** in each country significantly speeds up processing and reduces the risk of documentation errors.

## Costs to Factor In

Cross-border freight involves costs beyond standard domestic haulage:

- **Cross-border permits** — required per trip or as annual permits
- **Road tolls** — most cross-border corridors include toll infrastructure
- **Customs duties and VAT** — in the destination country (usually paid by the importer)
- **Clearing agent fees** — typically R500–R2,000 per shipment depending on complexity
- **Border waiting time** — factor in potential delays of 12–48+ hours at busy posts
- **Insurance premiums** — cross-border insurance typically costs more than domestic

## Technology and Cross-Border Freight

Digital platforms are beginning to simplify cross-border freight management. Key developments include:

- **Pre-clearance systems** — submitting customs documentation electronically before reaching the border reduces queuing time
- **Load tracking** — GPS-based tracking gives suppliers visibility across borders
- **Compliance management** — platforms that store and surface driver and vehicle documentation reduce the risk of being turned away at borders due to missing paperwork

**Freight Link Network** supports cross-border loads on all six southern African corridors. When posting a load, suppliers can indicate cross-border requirements; when managing fleet documents, transporters can store cross-border permits alongside standard compliance documentation.

## Practical Tips for Cross-Border Operators

1. **Invest in a good clearing agent** on both sides of each border you regularly use — the relationship pays for itself in reduced delays
2. **Pre-clear wherever possible** — electronic submission before arrival dramatically reduces waiting time
3. **Keep a digital copy of all documents** — physical document loss at a border post is a real risk
4. **Build delay time into your schedules** — especially for Beit Bridge, plan for potential 24–48 hour waits
5. **Know the payment requirements** — some border posts still require cash payment for certain fees
6. **Check seasonal restrictions** — some agricultural produce has seasonal import restrictions in neighbouring countries

## The Opportunity in Cross-Border Freight

Despite the complexity, cross-border loads are often among the most profitable in SA trucking. The additional documentation burden limits competition, and experienced operators who have the compliance management and clearing agent relationships in place can build significant, recurring revenue from regional routes.

For suppliers, working with transporters who have demonstrated cross-border capability — and whose compliance documents are verified — is essential for managing cross-border supply chains reliably.

---

**Freight Link Network** supports cross-border freight across all six southern African corridors. Both the transporter verification system and the load posting workflow are built to accommodate cross-border requirements. [Get started today](/register) and access SA's growing network of cross-border freight operators.
    `,
  },
};

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
    },
  };
}

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="text-2xl font-extrabold text-gray-900 mt-10 mb-4 leading-snug"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={key++}
          className="text-lg font-bold text-gray-900 mt-7 mb-3"
        >
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
      if (match) {
        elements.push(
          <li key={key++} className="text-gray-600 leading-relaxed mb-2 ml-4">
            <strong className="text-gray-800">{match[1]}</strong> — {match[2]}
          </li>
        );
      } else {
        elements.push(
          <li key={key++} className="text-gray-600 leading-relaxed mb-2 ml-4">
            {line.slice(2)}
          </li>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="text-gray-600 leading-relaxed mb-2 ml-4 list-disc">
          {line.slice(2)}
        </li>
      );
    } else if (/^\d+\./.test(line)) {
      elements.push(
        <li key={key++} className="text-gray-600 leading-relaxed mb-2 ml-4 list-decimal">
          {line.replace(/^\d+\.\s*/, "")}
        </li>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={key++} className="my-10 border-gray-200" />);
    } else if (line.trim() === "") {
      // skip blank lines
    } else {
      // Inline bold
      const parts = line.split(/\*\*(.+?)\*\*/g);
      const rendered = parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <strong key={idx} className="font-semibold text-gray-900">
            {part}
          </strong>
        ) : (
          part
        )
      );
      elements.push(
        <p key={key++} className="text-gray-600 leading-relaxed mb-4 text-base">
          {rendered}
        </p>
      );
    }
  }
  return elements;
}

// ─── Page component ───────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "Industry Guide": "bg-blue-50 text-blue-700 border-blue-100",
  "For Suppliers": "bg-[#9B2640]/10 text-[#9B2640] border-[#9B2640]/20",
  "For Transporters": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Cross-Border": "bg-amber-50 text-amber-700 border-amber-100",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#06082C] pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.15),_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category]}`}
            >
              <Tag size={10} />
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock size={11} />
              {post.readTime}
            </span>
            <span className="text-xs text-white/40">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article body */}
      <article className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose-like">{renderContent(post.content)}</div>

          {/* CTA */}
          <div className="mt-16 bg-[#06082C] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(155,38,64,0.2),_transparent_60%)]" />
            <div className="relative">
              <h3 className="text-xl font-extrabold text-white mb-3">
                Ready to experience FLN?
              </h3>
              <p className="text-white/60 text-sm mb-6">
                Join South Africa&apos;s growing network of verified freight suppliers and transporters.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#9B2640] hover:bg-[#7d1e33] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Get Started Free
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={14} />
              View all articles
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

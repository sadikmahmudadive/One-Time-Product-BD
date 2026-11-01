# One Time Product BD — Design System
**Version:** 1.0  
**Purpose:** Rebuild `onetimeproductbd.com` as a premium, conversion-focused e-commerce experience using a modern React/Next.js interface and selective Three.js product storytelling.

---

## 1. Product and brand understanding

### Business model
One Time Product BD presents itself as a Bangladesh-based manufacturer and supplier of food-grade plastic packaging. Its catalogue includes square and rectangular food containers, round containers, dessert cups, sauce cups and durable plastic crates. The products serve sweets and bakery businesses, catering services, food businesses, events and household buyers.

### Current website information architecture
- Home
- All Products
- Square Boxes
- Round Boxes
- About
- Contact
- Product detail pages
- Cart

The current homepage promotes new arrivals, square and round product categories, product highlights, popular products, Instagram updates and service benefits. Product listings show prices in BDT and some products have quantity/pack-size variants. The About page describes the company as a food-grade plastic product manufacturer in Bangladesh. The Contact page includes a contact form, Dhaka address, WhatsApp phone number and email.

### Redesign goals
1. Make the product catalogue easy to browse and compare.
2. Communicate manufacturing quality, food-use suitability and business value without unsupported claims.
3. Support both small-quantity retail orders and bulk/wholesale enquiries.
4. Make product variants, pack quantities, prices and stock states unambiguous.
5. Improve mobile shopping, cart clarity and checkout completion.
6. Use Three.js where it adds real product understanding, not as decoration that slows shopping.

### Brand positioning
**Proposed positioning:** Practical, dependable food packaging for businesses that care about presentation and delivery.

**Suggested brand personality**
- Clean and product-first
- Dependable and straightforward
- Modern but approachable
- Commercially confident, not luxury-fashion
- Locally relevant to Bangladesh

**Suggested voice**
- Clear, concise and useful
- Lead with product benefit and measurable details
- Use Bangla/English support where appropriate
- Avoid vague superlatives such as “best in the market” unless substantiated

---

## 2. Design direction

### Creative concept: “Packaging, presented beautifully”
Use a warm-white canvas, deep evergreen brand colour, restrained lime accents, charcoal typography and high-quality product photography. Product containers should feel tangible and dimensional through soft shadows, clean studio lighting and occasional interactive 3D views.

The interface should feel closer to a modern specialist supplier than a generic marketplace template.

### Visual principles
- Product imagery is the hero. Avoid busy backgrounds and excessive decoration.
- Use generous whitespace and clear section hierarchy.
- Keep product cards consistent so shoppers can compare capacity, shape, price and pack size.
- Use colour to communicate state: availability, promotion, selected variant and errors.
- Use motion sparingly and purposefully.
- Prioritise clarity and speed over visual effects.

### Do not
- Use a full-screen 3D scene that blocks product discovery.
- Put essential product details only inside animation or hover states.
- use tiny low-contrast text or overly rounded “toy-like” UI.
- Invent certifications, food-safety approvals, material grades, delivery promises or manufacturing capabilities.
- Hide shipping costs, variant prices or minimum order quantities until checkout.

---

## 3. Design tokens

The following palette is a proposed new system, not a claim about the current brand's official colours. Confirm against the approved logo and packaging before production.

### Colour palette

| Token | Hex | Usage |
|---|---:|---|
| `brand-950` | `#102D25` | Deep evergreen, footer, high-emphasis text |
| `brand-900` | `#173C31` | Primary brand, header accents |
| `brand-700` | `#28634D` | Primary buttons, links |
| `brand-600` | `#347A5D` | Hover/focus emphasis |
| `brand-100` | `#E7F1EB` | Soft brand surface |
| `accent-500` | `#B7D957` | Small highlights, badges, visual accents |
| `accent-100` | `#F2F8D9` | Accent surface |
| `ink-950` | `#171D1A` | Main text |
| `ink-700` | `#4D5952` | Secondary text |
| `ink-500` | `#77827B` | Muted text |
| `line-200` | `#E5EAE6` | Borders and dividers |
| `surface-0` | `#FFFFFF` | Cards and primary surfaces |
| `surface-50` | `#F7F9F7` | Page background |
| `surface-100` | `#EFF3F0` | Subtle panels |
| `success-700` | `#23734B` | Success state |
| `warning-700` | `#98651B` | Warning state |
| `danger-700` | `#B53A36` | Error/destructive state |

**Colour usage**
- Primary CTA: `brand-700` with white text.
- Secondary CTA: white or transparent with `brand-900` border.
- Accent lime should occupy less than 10% of a typical screen.
- Do not use brand green for every element; preserve neutral space.
- Maintain WCAG AA contrast for text and interactive controls.

### Typography
Use a contemporary sans-serif with strong legibility and broad Latin/Bengali coverage.

**Recommended stack**
```css
font-family: "Inter", "Noto Sans Bengali", system-ui, sans-serif;
```
Use a locally hosted or optimised web font where possible. Ensure Bengali glyphs render correctly.

| Style | Desktop | Mobile | Weight | Line height |
|---|---:|---:|---:|---:|
| Display | 56–64px | 38–44px | 650–750 | 1.05 |
| H1 | 48px | 36px | 700 | 1.1 |
| H2 | 36px | 28px | 650 | 1.2 |
| H3 | 24px | 21px | 650 | 1.25 |
| H4 | 18px | 17px | 600 | 1.3 |
| Body large | 18px | 17px | 400 | 1.6 |
| Body | 16px | 15px | 400 | 1.55 |
| Small | 14px | 13px | 400 | 1.45 |
| Label | 12px | 12px | 600 | 1.3 |

Use sentence case. Avoid long all-caps headings.

### Spacing scale
Base unit: 4px.

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120`

- Card internal padding: 20–24px desktop, 14–16px mobile.
- Section spacing: 80–112px desktop, 48–64px mobile.
- Form field gap: 16px.
- Product grid gap: 20–24px desktop, 12px mobile.

### Layout and breakpoints
- Max content width: 1280px.
- Wide container: 1360px including gutters.
- Desktop gutters: 40px.
- Tablet gutters: 28px.
- Mobile gutters: 18px.
- Breakpoints: `480px`, `768px`, `1024px`, `1280px`, `1440px`.
- Product listing: 4 columns wide desktop, 3 columns laptop/tablet landscape, 2 columns mobile, 1 column only for narrow layouts where readability requires it.

### Shape, border and shadow
- Small radius: 8px
- Control radius: 10px
- Card radius: 16px
- Feature panel radius: 24px
- Pill radius: 999px
- Border: 1px solid `line-200`
- Card shadow: `0 8px 28px rgba(16, 45, 37, 0.06)`
- Floating panel shadow: `0 16px 48px rgba(16, 45, 37, 0.14)`

Use shadows sparingly. Prefer borders and surface contrast for most cards.

---

## 4. Navigation and global shell

### Announcement strip
A slim optional strip above the header for a verified announcement such as bulk-order support, seasonal availability or delivery information. Do not display an unverified offer.

### Header
- Desktop: logo left, primary navigation centre/right, search and account/cart actions at right.
- Navigation items: Shop All, Square & Rectangular, Round Containers, Dessert Cups, Crates, About, Contact.
- Use a compact sticky header after a small scroll threshold.
- Cart icon must show item count.
- Search should be prominent and support product name, capacity and SKU.
- Provide a clear “Bulk Order” or “Request a Quote” action.

### Mobile navigation
- Compact logo and cart in top row.
- Search field visible or one tap away.
- Menu opens as a full-height drawer with large touch targets.
- Sticky bottom action may show cart only when useful; do not obscure checkout controls.

### Footer
Use a dark evergreen footer with:
- Short company description
- Product category links
- Customer support links
- Contact details
- WhatsApp CTA
- Social links
- Newsletter only if the business actively manages it
- Copyright and policy links

---

## 5. Homepage experience

Recommended order:

### 5.1 Hero
**Headline direction:** “Food packaging that presents your products beautifully.”

Supporting copy should explain the actual offer: food packaging products for bakeries, sweet shops, caterers, restaurants and growing food businesses.

Primary CTA: **Shop Products**  
Secondary CTA: **Explore Bulk Orders**

Visual:
- A studio arrangement of several real products at different sizes.
- Optional 3D hero model of a transparent container with lid, shown at a 3/4 angle.
- Use subtle camera movement or scroll-linked rotation only on capable devices.
- Keep headline and CTA as real HTML, not baked into a canvas.

### 5.2 Shop by category
Category tiles:
- Square & Rectangular Boxes
- Round Containers
- Dessert Cups
- Crates & Bulk Storage
- Sauce Cups / Accessories (if maintained as a catalogue category)

Use product photography, category title and “Explore” link. Do not rely on abstract illustrations where product photography is available.

### 5.3 Popular products / New arrivals
- 4-column desktop grid.
- Show product image, title, capacity, price, variant indicator and quick action.
- For variable products, CTA should say “Choose options” rather than misleadingly adding a default variant.
- Include “View all products”.

### 5.4 Product value proposition
Use three or four evidence-based benefits, for example:
- Product range for food businesses
- Multiple capacities and formats
- Retail and bulk quantity options
- Nationwide delivery, only if current operations confirm it

Do not state “food safe”, “BPA-free”, microwave-safe or temperature limits unless documentation supports the exact claim.

### 5.5 Product spotlight
Feature a product family with close-up images, size comparison and a CTA to shop the collection. Use a 3D interaction only if it helps show lid fit, dimensions or capacity.

### 5.6 Business / wholesale section
A dedicated B2B panel:
- “Buying for a bakery, restaurant or catering business?”
- Explain how to request a bulk quote.
- Ask for product, quantity, delivery location and contact method.
- Include WhatsApp and quote form actions.

### 5.7 Brand story
Short company introduction with a real manufacturing/product image and link to About.

### 5.8 Social proof / Instagram
Show current, permission-cleared posts or real customer/product imagery. Do not show placeholder lorem ipsum or fabricated testimonials.

### 5.9 FAQ
Suggested topics:
- What quantity options are available?
- How do I choose the right capacity?
- Do you accept bulk orders?
- How can I confirm delivery charges?
- How do I request a quotation?
- What is the return/replacement process?

Only publish answers confirmed by the business.

---

## 6. Shop and category listing

### Category page structure
1. Breadcrumb
2. Category title and short useful description
3. Product count
4. Search within category
5. Sort control
6. Filter sidebar/drawer
7. Product grid
8. Pagination or “Load more”
9. Related categories

### Filters
Use only attributes present in product data:
- Shape: square, rectangular, round, heart
- Capacity: ml
- Colour / lid colour
- Product type
- Price range
- Availability
- Pack quantity, where applicable

### Sorting
- Featured
- Popularity (only if tracked)
- Latest
- Price: low to high
- Price: high to low

### Product card
Required content:
- Consistent image ratio, preferably 1:1
- Product title
- Capacity or size
- Starting price only where variants have different prices, labelled “From”
- Variant/pack indicator
- Stock state
- Quick add or “Choose options”
- Wishlist only if supported end-to-end

Hover state may reveal a second image on desktop, but all important information must remain visible without hover.

### Empty and loading states
- Skeleton cards during loading.
- Clear no-results message.
- “Clear filters” action.
- Never leave a blank grid.

---

## 7. Product detail page

### Desktop layout
Two-column layout:
- Left: image gallery / 3D viewer.
- Right: title, price, short summary, variant selector, quantity, availability and purchase actions.

### Mobile layout
- Gallery first.
- Title and price immediately below.
- Variant selector and quantity in a clear vertical stack.
- Sticky bottom Add to Cart only if it does not cover important content.

### Product information hierarchy
1. Product name
2. Capacity / dimensions
3. Price and price basis
4. Pack quantity / variant selector
5. Stock or lead-time status
6. Quantity control
7. Add to Cart
8. Request Bulk Quote
9. Delivery and return summary
10. Product description
11. Specifications
12. Related products

### Variant selection
For pack options such as 100, 300, 500 or 1000 pieces:
- Use selectable option cards or a segmented control.
- Each option should show quantity and corresponding price.
- Update the displayed price immediately.
- Clearly show the price basis: per piece, per pack or per carton.
- Prevent add-to-cart until a required variant is selected.
- Preserve the chosen variant in cart and checkout.

### Specifications table
Potential fields:
- Capacity (ml)
- Shape
- Dimensions (mm)
- Material
- Colour
- Lid type
- Pack quantity
- SKU
- Intended use
- Care / usage notes

Only show fields with verified product data. Do not infer material or performance from an image.

### Product gallery
- Neutral background.
- Consistent scale across product images.
- Front, side, top, open/closed and in-use views where available.
- Zoom/lightbox.
- Alt text describes product and angle.
- 3D viewer is optional and must have a static image fallback.

---

## 8. Three.js product experience

### Recommended use cases
Use Three.js / React Three Fiber for:
1. A hero product arrangement.
2. A product viewer for selected flagship containers.
3. Exploded view to show lid and base separately.
4. Capacity/size comparison using consistent scale.
5. Optional product configurator for colour/lid variants, if the catalogue supports them.

### Avoid
- Rendering every product card in WebGL.
- Heavy 3D scenes on listing pages.
- Auto-rotating models that make users lose control.
- Scroll hijacking.
- Blocking the Add to Cart button while a model loads.

### 3D viewer interaction
- Drag to rotate.
- Scroll/pinch to zoom with sensible limits.
- Reset camera button.
- Optional “Open / Closed” toggle if model geometry supports it.
- Optional “Exploded view” toggle.
- Show a visible loading indicator.
- Provide “View photos” fallback.
- Respect `prefers-reduced-motion`.
- Disable expensive effects on low-power/mobile devices.

### Rendering and performance
- React Three Fiber for React integration.
- Three.js with GLTF/GLB assets.
- Draco or Meshopt compression where appropriate.
- KTX2/Basis textures.
- Keep models low-poly and optimise transparent materials.
- Avoid multiple real-time transparent layers where possible.
- Lazy-load the viewer below the fold.
- Load a poster image first; initialise WebGL only when visible or requested.
- Use environment lighting and soft shadows, not expensive real-time lighting.
- Target a small, compressed model for each product viewer; set a project-specific budget after testing on mid-range Android devices.
- Dispose geometries, materials and textures when viewers unmount.
- Detect WebGL failure and fall back gracefully to product photography.

### Suggested 3D visual style
- Studio environment with softbox lighting.
- Warm-white or very light grey background.
- Accurate transparency and reflections, without making clear plastic look metallic.
- Soft contact shadow.
- Camera at 35–45 degrees for product presentation.
- Neutral ground plane and no decorative clutter.

---

## 9. Cart and checkout

### Cart drawer
- Open from header without losing page context.
- Product thumbnail, title, selected variant, quantity, unit/pack price.
- Quantity stepper and remove action.
- Subtotal.
- Delivery estimate or “calculated at checkout”.
- Clear checkout CTA.
- Continue shopping link.
- Empty cart state with product discovery CTA.

### Cart page
- Editable quantities and variants where safe.
- Clear line-item price basis.
- Order subtotal, discounts, delivery and total separated.
- Bulk enquiry route for unusually large quantities.

### Checkout
Use a short, single-column checkout on mobile and a two-column summary layout on desktop.

Suggested fields:
- Customer name
- Phone
- Email (optional only if business policy allows)
- Delivery address
- District / city
- Order notes
- Delivery method
- Payment method

For Bangladesh, payment methods should reflect actual operational support. Do not display bKash, Nagad, cards, COD or bank transfer unless enabled and tested.

Show:
- Order summary
- Delivery fee and conditions
- Final total
- Return/cancellation policy
- Order confirmation state and reference number

---

## 10. B2B bulk ordering and quote flow

This is a high-value experience for a manufacturer/supplier and should not be hidden inside the Contact page.

### Entry points
- Header “Bulk Order”
- Product detail “Request Bulk Quote”
- Homepage wholesale section
- Cart when quantity is above a configurable threshold

### Quote form fields
- Name
- Business name
- Phone / WhatsApp
- Email
- Product(s)
- Required quantity
- Delivery district
- Target delivery date (optional)
- Additional requirements

### Quote confirmation
Confirm submission, provide a reference ID and explain the next contact step only if the business has an agreed response process.

---

## 11. About, contact and trust pages

### About
- Clear manufacturer introduction.
- Mission and company story.
- Real product/manufacturing photography.
- Product range and customer segments.
- Verified quality/process information.
- CTA to shop and request a bulk quote.

### Contact
Present contact options as useful actions:
- WhatsApp
- Phone
- Email
- Address with map link
- Contact form

Use the current published contact details only after reconfirming that they are still correct. Ensure map pin and address match.

### Trust and policy pages
Create or improve:
- Delivery information
- Returns and replacements
- Privacy policy
- Terms and conditions
- FAQ
- Order tracking, if a real tracking workflow exists

Do not expose placeholder navigation links that lead nowhere.

---

## 12. Component library

Build reusable, accessible components.

### Core
- `AnnouncementBar`
- `SiteHeader`
- `DesktopNavigation`
- `MobileNavigationDrawer`
- `SiteFooter`
- `Breadcrumbs`
- `SectionHeading`
- `Container`
- `IconButton`

### Commerce
- `ProductCard`
- `ProductGrid`
- `ProductGallery`
- `Product3DViewer`
- `PriceDisplay`
- `VariantSelector`
- `QuantityStepper`
- `StockBadge`
- `AddToCartButton`
- `CartDrawer`
- `CartLineItem`
- `CartSummary`
- `CheckoutForm`
- `OrderConfirmation`

### Discovery
- `SearchBox`
- `FilterSidebar`
- `FilterDrawer`
- `SortSelect`
- `CategoryTile`
- `Pagination`
- `EmptyState`
- `ProductSkeleton`

### Forms and support
- `ContactForm`
- `BulkQuoteForm`
- `WhatsAppCTA`
- `FAQAccordion`
- `Toast`
- `FormField`
- `ValidationMessage`

### Component states
Every interactive component must define:
- Default
- Hover
- Focus-visible
- Active / selected
- Disabled
- Loading
- Success
- Error

Use semantic HTML, keyboard support, visible focus and accessible names.

---

## 13. Motion and interaction system

### Motion principles
- Fast, subtle and purposeful.
- Motion confirms state changes or guides attention.
- Never delay a purchase action for animation.

### Timing
- Micro-interactions: 120–180ms
- Dropdowns and drawers: 180–260ms
- Section reveal: 350–550ms
- 3D transitions: 400–700ms

### Easing
Use a restrained ease-out curve such as `cubic-bezier(0.22, 1, 0.36, 1)` for entrances. Use short ease-in-out transitions for toggles.

### Allowed patterns
- Button press feedback
- Product card image scale (very subtle)
- Cart drawer slide-in
- Toast fade/slide
- Filter drawer transition
- Soft section reveal
- 3D model rotation on user input

### Accessibility
- Respect `prefers-reduced-motion`.
- Do not communicate state by animation alone.
- Avoid parallax on mobile by default.
- Ensure focus remains managed inside open dialogs/drawers.

---

## 14. Responsive behaviour

### Desktop
- Full navigation.
- 3–4 column product grids.
- Persistent filter sidebar on wide category pages.
- Two-column product detail.
- 3D viewer can be enabled for supported products.

### Tablet
- Condensed navigation.
- 2–3 column grids.
- Filters open in drawer or compact sidebar.
- Product detail may remain two-column only above a tested width.

### Mobile
- 2-column product grid where cards remain readable.
- Single-column checkout.
- Full-width controls.
- Minimum 44×44px touch targets.
- No hover-only interactions.
- Keep price, capacity and variant information visible.
- Optimise images and defer 3D.

---

## 15. Accessibility and usability requirements

Target WCAG 2.2 AA where practical:
- Text contrast at least 4.5:1 for normal text.
- Keyboard-operable menus, filters, gallery and cart.
- Visible focus indicators.
- Form labels and useful error messages.
- Alt text for informative product images.
- Captions/transcripts for meaningful video.
- Reduced-motion support.
- Do not use colour alone for stock or validation states.
- Clear language for price, quantity and delivery conditions.

---

## 16. Technical implementation recommendations

### Suggested stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS or CSS Modules using the tokens in this file
- React Three Fiber + Drei for 3D
- Framer Motion for interface transitions
- Zustand or equivalent lightweight state management for cart/UI state
- Existing WooCommerce/WordPress REST API or a documented commerce backend, depending on migration scope

### Architecture
Separate:
- Product/catalogue data
- Cart and checkout logic
- UI components
- 3D assets/viewers
- CMS-managed content
- Analytics and tracking

Use a product data model that supports:
- Product ID and SKU
- Slug and title
- Description
- Category and attributes
- Images and optional GLB model
- Variants
- Price per variant
- Price basis
- Stock status
- Minimum order quantity
- Weight/dimensions where relevant

### Data and integration
If retaining WooCommerce:
- Preserve product IDs, SKUs, variants and order history where possible.
- Use secure server-side API access for private credentials.
- Do not expose WooCommerce consumer secrets in browser code.
- Ensure cart and checkout remain consistent with backend pricing.
- Treat backend price and stock as authoritative.

### SEO
- Server-render category and product content.
- Unique title and meta description per page.
- Canonical URLs.
- Product structured data with accurate price, currency, availability and variant data.
- Breadcrumb structured data.
- Descriptive image filenames and alt text.
- XML sitemap and robots configuration.
- Preserve or redirect legacy URLs during migration.

### Performance targets
Use Core Web Vitals as release criteria:
- LCP: aim for 2.5s or less
- INP: aim for 200ms or less
- CLS: aim for 0.1 or less

Implementation:
- Responsive AVIF/WebP images.
- Correct image dimensions to prevent layout shift.
- Lazy-load below-fold images.
- Preload only critical hero assets.
- Keep client-side JavaScript lean.
- Load 3D code and models on demand.
- Avoid 3D on every product tile.
- Test on mid-range Android devices and slower mobile networks common in Bangladesh.

---

## 17. Content and product photography direction

### Photography
- Consistent white/off-white studio background.
- Soft directional lighting.
- Accurate colour and transparency.
- Product photographed at consistent scale.
- Show lids, bases, closures and stacking where relevant.
- Include a real-world food-use image only when it represents actual intended use.
- Include a size reference or dimension graphic where useful.

### Product naming
Use a consistent format:
`[Capacity] [Shape/Type] [Material/Colour if verified] [Product]`

Example format:
`1000 ml Black Premium Box`

### Price display
- Always show `৳` and use consistent number formatting.
- Make clear whether price is per piece, per pack or for a selected quantity.
- For variable products, show a range or “From ৳X” only when accurate.
- Never imply the lowest variant price applies to all variants.

### Bengali localisation
- Support Bangla and English if the business can maintain both.
- Use `Noto Sans Bengali` or a tested equivalent for Bengali.
- Format phone numbers and addresses for local users.
- Keep BDT as the default currency.
- Use Bangladesh-relevant address and district fields.

---

## 18. Analytics and conversion measurement

Track events with privacy-conscious analytics:
- `view_item_list`
- `select_item`
- `view_item`
- `search`
- `filter_products`
- `select_variant`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `purchase`
- `request_quote`
- `click_whatsapp`
- `submit_contact_form`

Monitor:
- Product-list to product-detail click-through
- Product detail to add-to-cart rate
- Variant selection abandonment
- Cart to checkout rate
- Checkout completion
- Quote submissions
- Mobile conversion rate
- Search with no results

Do not collect unnecessary personal data.

---

## 19. Page checklist

### Must-have pages
- [ ] Home
- [ ] All products
- [ ] Square & rectangular boxes
- [ ] Round containers
- [ ] Dessert cups
- [ ] Product detail
- [ ] Cart
- [ ] Checkout
- [ ] Order confirmation
- [ ] About
- [ ] Contact
- [ ] Bulk quote
- [ ] Delivery and returns
- [ ] Privacy policy
- [ ] Terms and conditions
- [ ] FAQ

### Must-have functional requirements
- [ ] Search works across product name, capacity and SKU
- [ ] Filters reflect real product attributes
- [ ] Variant selection updates price and cart data
- [ ] Cart persists across navigation
- [ ] Backend validates price and stock
- [ ] Checkout supports only active payment methods
- [ ] WhatsApp links open the correct business contact
- [ ] Forms validate and confirm submission
- [ ] 3D viewer has a static image fallback
- [ ] All primary flows work on mobile

---

## 20. Suggested implementation phases

### Phase 1 — Commerce foundation
- Confirm brand assets and product data.
- Audit existing WooCommerce products, variants, prices and categories.
- Establish design tokens and responsive shell.
- Build homepage, listing, product detail, cart and checkout.

### Phase 2 — Conversion and B2B
- Add search, filters and sorting.
- Add bulk quote workflow.
- Improve contact, FAQ and policy pages.
- Add analytics events and SEO metadata.

### Phase 3 — 3D and advanced polish
- Create GLB models for selected flagship products.
- Add product viewer and exploded view where useful.
- Optimise model loading and mobile fallbacks.
- Add refined transitions and visual details.

### Phase 4 — QA and launch
- Verify product/variant/price accuracy.
- Test payment, order creation and notifications.
- Test responsive layouts and accessibility.
- Run performance checks on real mobile devices.
- Set up redirects, sitemap and monitoring.

---

## 21. Final design acceptance criteria

The rebuild is ready when:
1. A first-time visitor understands what the company sells within five seconds.
2. A customer can find a product by category, capacity or search.
3. Product price basis and pack variants are unambiguous.
4. A customer can complete a mobile purchase without avoidable friction.
5. A business buyer can request a bulk quote from the homepage or product page.
6. The design is visually consistent across every page.
7. 3D enhances product understanding and never blocks core shopping tasks.
8. All claims, product specifications, contact details and policies are verified.
9. No placeholder links, lorem ipsum, dead buttons or fake testimonials remain.
10. Performance and accessibility are validated before launch.

---

## 22. Reference audit notes

This document is based on a public-page review of:
- Homepage: `https://onetimeproductbd.com/`
- All products: `https://onetimeproductbd.com/product-category/all-products/`
- Square boxes: `https://onetimeproductbd.com/product-category/square-boxes/`
- Round boxes: `https://onetimeproductbd.com/product-category/round-boxes/`
- About: `https://onetimeproductbd.com/about/`
- Contact: `https://onetimeproductbd.com/contact/`
- Example product: `https://onetimeproductbd.com/product/heart-shape-dessert-cup-acrylic/`

**Audit limitation:** This is a public-facing page and content audit, not a source-code, backend, payment-gateway or authenticated customer-account audit. Some content and navigation may be dynamically rendered or unavailable to automated page extraction. Confirm current product data, policies, contact information, payment methods, fulfilment rules and brand assets with the business before implementation.

**Important:** Existing site content and product categories are used to understand the business. The colour palette, layout, component system, motion language and Three.js experiences in this document are proposed design recommendations for the rebuild, not descriptions of the current implementation.

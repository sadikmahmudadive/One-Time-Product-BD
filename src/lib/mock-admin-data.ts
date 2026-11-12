import type { EnquiryRecord, InventoryRecord, NewsletterSubscription, OrderRecord } from "./firebase/firestore";

const now = Date.now();
const day = (d: number) => ({
  toDate: () => new Date(now - d * 86400000),
});

export const DEMO_ORDERS: OrderRecord[] = [
  {
    id: "ORD-8491A",
    customer: {
      name: "Rafiqul Islam",
      phone: "01711223344",
      email: "rafiq@dhakadesserts.com",
      district: "Dhaka",
      address: "House 14, Road 7, Dhanmondi, Dhaka",
    },
    items: [
      {
        slug: "semi-square-dessert-cup-acrylic",
        name: "Semi-Square Dessert Cup (Acrylic)",
        variantLabel: "Carton (200 pcs)",
        unitPrice: 1600,
        qty: 3,
        subtotal: 4800,
      },
      {
        slug: "kraft-salad-bowl-window-lid",
        name: "Kraft Salad Bowl with Window Lid",
        variantLabel: "Pack (50 pcs)",
        unitPrice: 850,
        qty: 2,
        subtotal: 1700,
      },
    ],
    totalPrice: 6500,
    status: "pending",
    createdAt: day(0.2),
  },
  {
    id: "ORD-8488B",
    customer: {
      name: "Tahmina Akter",
      phone: "01819988776",
      email: "tahmina.chef@gmail.com",
      district: "Chittagong",
      address: "GEC Circle, Nasirabad, Chattogram",
    },
    items: [
      {
        slug: "bento-cake-box-eco-kraft",
        name: "Bento Cake Box (Eco Kraft)",
        variantLabel: "Pack (50 pcs)",
        unitPrice: 750,
        qty: 5,
        subtotal: 3750,
      },
    ],
    totalPrice: 3750,
    status: "confirmed",
    createdAt: day(1.1),
  },
  {
    id: "ORD-8472C",
    customer: {
      name: "Tanvir Hasan (Herfy BD)",
      phone: "01912345678",
      email: "procurement@herfybd.com",
      district: "Dhaka",
      address: "Banani 11, Dhaka",
    },
    items: [
      {
        slug: "double-wall-coffee-cup-kraft",
        name: "Double-Wall Coffee Cup (Kraft)",
        variantLabel: "Case (500 pcs)",
        unitPrice: 3200,
        qty: 4,
        subtotal: 12800,
      },
    ],
    totalPrice: 12800,
    status: "shipped",
    createdAt: day(2.4),
  },
  {
    id: "ORD-8460D",
    customer: {
      name: "Kamrul Ahsan",
      phone: "01678901234",
      district: "Sylhet",
      address: "Zindabazar, Sylhet Sadar",
    },
    items: [
      {
        slug: "clear-pet-beverage-cup-dome",
        name: "Clear PET Beverage Cup with Dome Lid",
        variantLabel: "Sleeve (100 pcs)",
        unitPrice: 950,
        qty: 2,
        subtotal: 1900,
      },
    ],
    totalPrice: 1900,
    status: "confirmed",
    createdAt: day(3.5),
  },
  {
    id: "ORD-8451E",
    customer: {
      name: "Nusrat Jahan",
      phone: "01521432109",
      email: "nusrat@sweettreats.bd",
      district: "Dhaka",
      address: "Uttara Sector 3, Dhaka",
    },
    items: [
      {
        slug: "aluminum-foil-baking-tray-lid",
        name: "Aluminium Foil Baking Tray with Lid",
        variantLabel: "Pack (100 pcs)",
        unitPrice: 1100,
        qty: 3,
        subtotal: 3300,
      },
    ],
    totalPrice: 3300,
    status: "pending",
    createdAt: day(4.2),
  },
  {
    id: "ORD-8440F",
    customer: {
      name: "Shahidul Alam",
      phone: "01733445566",
      district: "Rajshahi",
      address: "Shaheb Bazar, Rajshahi",
    },
    items: [
      {
        slug: "wooden-cutlery-set-wrapped",
        name: "Wooden Cutlery Set (Individually Wrapped)",
        variantLabel: "Box (250 sets)",
        unitPrice: 1450,
        qty: 2,
        subtotal: 2900,
      },
    ],
    totalPrice: 2900,
    status: "shipped",
    createdAt: day(5.8),
  },
  {
    id: "ORD-8433G",
    customer: {
      name: "Anisur Rahman",
      phone: "01855667788",
      district: "Khulna",
      address: "Shibbari More, Khulna",
    },
    items: [
      {
        slug: "kraft-salad-bowl-window-lid",
        name: "Kraft Salad Bowl with Window Lid",
        variantLabel: "Pack (50 pcs)",
        unitPrice: 850,
        qty: 1,
        subtotal: 850,
      },
    ],
    totalPrice: 850,
    status: "cancelled",
    createdAt: day(6.5),
  },
];

export const DEMO_QUOTES: EnquiryRecord[] = [
  {
    id: "ENQ-101",
    kind: "quote",
    status: "new",
    createdAt: day(0.4),
    data: {
      name: "Mahmudul Hasan",
      phone: "01712987654",
      email: "mahmud@bakerybd.com",
      business: "Sweet Nation Bakers Ltd.",
      district: "Dhaka",
      products: "Bento Cake Box (Eco Kraft)",
      quantity: "5,000 pcs monthly",
      message: "Need custom gold foil logo branding on lid. What is the lead time and volume pricing?",
    },
  },
  {
    id: "ENQ-102",
    kind: "quote",
    status: "in_progress",
    createdAt: day(1.8),
    data: {
      name: "Farzana Yasmin",
      phone: "01822334455",
      email: "farzana@chillcafe.com",
      business: "Chill & Grill Cafe",
      district: "Chittagong",
      products: "Double-Wall Coffee Cup (Kraft) 250ml & 350ml",
      quantity: "10,000 pcs per quarter",
      message: "Requesting sample pack delivery to Nasirabad branch before placing order.",
    },
  },
  {
    id: "ENQ-103",
    kind: "contact",
    status: "completed",
    createdAt: day(4.0),
    data: {
      name: "Arif Chowdhury",
      phone: "01998877665",
      email: "arif@courierbd.com",
      district: "Dhaka",
      message: "Inquiry about corporate delivery partnership and bulk shipping discounts.",
    },
  },
];

export const DEMO_SUBSCRIBERS: NewsletterSubscription[] = [
  { id: "SUB-1", email: "procurement@tastebuds.com", createdAt: day(1.2) },
  { id: "SUB-2", email: "sultans.manager@gmail.com", createdAt: day(3.4) },
  { id: "SUB-3", email: "bakeryhub.dhaka@yahoo.com", createdAt: day(5.1) },
  { id: "SUB-4", email: "cafe.latte.ctg@gmail.com", createdAt: day(7.0) },
];


import type { EnquiryRecord, InventoryRecord, NewsletterSubscription, OrderRecord } from "./firebase/firestore";

const now = Date.now();
const day = (d: number) => ({
  toDate: () => new Date(now - d * 86400000),
});

export const DEMO_ORDERS: OrderRecord[] = [
  // Today's orders
  {
    id: "ORD-8495A",
    customer: {
      name: "Sabbir Hossain (Glazed Donuts)",
      phone: "01722334455",
      email: "sabbir@glazed.com.bd",
      district: "Dhaka",
      address: "Gulshan 2, Dhaka",
    },
    items: [
      {
        slug: "bento-cake-box-eco-kraft",
        name: "Bento Cake Box (Eco Kraft)",
        variantLabel: "Carton (200 pcs)",
        unitPrice: 2800,
        qty: 3,
        subtotal: 8400,
      },
    ],
    totalPrice: 8400,
    status: "confirmed",
    createdAt: day(0.08),
  },
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
    id: "ORD-8490Z",
    customer: {
      name: "Sadia Rahman (Sweet Corner)",
      phone: "01944556677",
      email: "sadia@sweetcorner.bd",
      district: "Dhaka",
      address: "Mirpur DOHS, Dhaka",
    },
    items: [
      {
        slug: "heart-shape-dessert-cup-acrylic",
        name: "Heart Shape Dessert Cup (Acrylic)",
        variantLabel: "Pack (100 pcs)",
        unitPrice: 1500,
        qty: 2,
        subtotal: 3000,
      },
    ],
    totalPrice: 3000,
    status: "confirmed",
    createdAt: day(0.38),
  },
  // Yesterday's orders
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
    id: "ORD-8485Y",
    customer: {
      name: "Fahim Shahriar",
      phone: "01611223399",
      email: "fahim.catering@gmail.com",
      district: "Dhaka",
      address: "Bashundhara R/A, Block C, Dhaka",
    },
    items: [
      {
        slug: "clear-pet-beverage-cup-dome",
        name: "Clear PET Beverage Cup with Dome Lid",
        variantLabel: "Case (500 pcs)",
        unitPrice: 4200,
        qty: 2,
        subtotal: 8400,
      },
    ],
    totalPrice: 8400,
    status: "shipped",
    createdAt: day(1.6),
  },
  // Past 7 days
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
  // Past 30 days (Month)
  {
    id: "ORD-8420H",
    customer: {
      name: "Kazi Farhan (Bakers Delight)",
      phone: "01788990011",
      district: "Dhaka",
      address: "Mohakhali DOHS, Dhaka",
    },
    items: [
      {
        slug: "semi-square-dessert-cup-acrylic",
        name: "Semi-Square Dessert Cup (Acrylic)",
        variantLabel: "Carton (500 pcs)",
        unitPrice: 3800,
        qty: 4,
        subtotal: 15200,
      },
    ],
    totalPrice: 15200,
    status: "shipped",
    createdAt: day(8.4),
  },
  {
    id: "ORD-8412J",
    customer: {
      name: "Nazmul Huda",
      phone: "01933445522",
      district: "Comilla",
      address: "Kandirpar, Cumilla",
    },
    items: [
      {
        slug: "foodsafe-durable-plastic-crate",
        name: "Foodsafe Durable Plastic Crate",
        variantLabel: "Pack of 10",
        unitPrice: 4500,
        qty: 3,
        subtotal: 13500,
      },
    ],
    totalPrice: 13500,
    status: "shipped",
    createdAt: day(12.1),
  },
  {
    id: "ORD-8405K",
    customer: {
      name: "Shamima Nasrin",
      phone: "01877665544",
      district: "Dhaka",
      address: "Lalmatia, Block D, Dhaka",
    },
    items: [
      {
        slug: "double-wall-coffee-cup-kraft",
        name: "Double-Wall Coffee Cup (Kraft)",
        variantLabel: "Pack (100 pcs)",
        unitPrice: 750,
        qty: 6,
        subtotal: 4500,
      },
    ],
    totalPrice: 4500,
    status: "shipped",
    createdAt: day(16.5),
  },
  {
    id: "ORD-8392L",
    customer: {
      name: "Rezaul Karim (ChocoLush)",
      phone: "01655443322",
      district: "Chittagong",
      address: "Agrabad C/A, Chattogram",
    },
    items: [
      {
        slug: "heart-shape-dessert-cup-acrylic",
        name: "Heart Shape Dessert Cup (Acrylic)",
        variantLabel: "Carton (1000 pcs)",
        unitPrice: 10000,
        qty: 2,
        subtotal: 20000,
      },
    ],
    totalPrice: 20000,
    status: "shipped",
    createdAt: day(21.0),
  },
  {
    id: "ORD-8380M",
    customer: {
      name: "Mustafizur Rahman",
      phone: "01533221100",
      district: "Dhaka",
      address: "Tejgaon Industrial Area, Dhaka",
    },
    items: [
      {
        slug: "bento-cake-box-eco-kraft",
        name: "Bento Cake Box (Eco Kraft)",
        variantLabel: "Pack (50 pcs)",
        unitPrice: 750,
        qty: 8,
        subtotal: 6000,
      },
    ],
    totalPrice: 6000,
    status: "shipped",
    createdAt: day(26.2),
  },
  // Past months (Yearly metrics)
  {
    id: "ORD-8350N",
    customer: {
      name: "Sharmin Sultana",
      phone: "01766554433",
      district: "Dhaka",
      address: "Baridhara DOHS, Dhaka",
    },
    items: [
      {
        slug: "semi-square-dessert-cup-acrylic",
        name: "Semi-Square Dessert Cup (Acrylic)",
        unitPrice: 1600,
        qty: 10,
        subtotal: 16000,
      },
    ],
    totalPrice: 16000,
    status: "shipped",
    createdAt: day(45),
  },
  {
    id: "ORD-8310P",
    customer: {
      name: "Enamul Haque (Artisan Bakes)",
      phone: "01833445566",
      district: "Sylhet",
      address: "Shahjalal Uposhohor, Sylhet",
    },
    items: [
      {
        slug: "foodsafe-durable-plastic-crate",
        name: "Foodsafe Durable Plastic Crate",
        unitPrice: 4500,
        qty: 6,
        subtotal: 27000,
      },
    ],
    totalPrice: 27000,
    status: "shipped",
    createdAt: day(78),
  },
  {
    id: "ORD-8270Q",
    customer: {
      name: "Mizanur Rahman",
      phone: "01922334411",
      district: "Dhaka",
      address: "Wari, Dhaka",
    },
    items: [
      {
        slug: "clear-pet-beverage-cup-dome",
        name: "Clear PET Beverage Cup with Dome Lid",
        unitPrice: 4200,
        qty: 5,
        subtotal: 21000,
      },
    ],
    totalPrice: 21000,
    status: "shipped",
    createdAt: day(115),
  },
  {
    id: "ORD-8210R",
    customer: {
      name: "Tariqul Islam (Coffee Republic)",
      phone: "01799887711",
      district: "Chittagong",
      address: "Khulshi, Chattogram",
    },
    items: [
      {
        slug: "double-wall-coffee-cup-kraft",
        name: "Double-Wall Coffee Cup (Kraft)",
        unitPrice: 3200,
        qty: 8,
        subtotal: 25600,
      },
    ],
    totalPrice: 25600,
    status: "shipped",
    createdAt: day(160),
  },
  {
    id: "ORD-8150S",
    customer: {
      name: "Zubaida Khan",
      phone: "01688776655",
      district: "Dhaka",
      address: "Banani DOHS, Dhaka",
    },
    items: [
      {
        slug: "heart-shape-dessert-cup-acrylic",
        name: "Heart Shape Dessert Cup (Acrylic)",
        unitPrice: 10000,
        qty: 3,
        subtotal: 30000,
      },
    ],
    totalPrice: 30000,
    status: "shipped",
    createdAt: day(210),
  },
  {
    id: "ORD-8090T",
    customer: {
      name: "Habibur Rahman (Food Express)",
      phone: "01544332211",
      district: "Rajshahi",
      address: "Alupotti, Rajshahi",
    },
    items: [
      {
        slug: "bento-cake-box-eco-kraft",
        name: "Bento Cake Box (Eco Kraft)",
        unitPrice: 2800,
        qty: 12,
        subtotal: 33600,
      },
    ],
    totalPrice: 33600,
    status: "shipped",
    createdAt: day(270),
  },
  {
    id: "ORD-8020U",
    customer: {
      name: "Ashraful Haque",
      phone: "01811224466",
      district: "Dhaka",
      address: "Kawran Bazar, Dhaka",
    },
    items: [
      {
        slug: "foodsafe-durable-plastic-crate",
        name: "Foodsafe Durable Plastic Crate",
        unitPrice: 4500,
        qty: 8,
        subtotal: 36000,
      },
    ],
    totalPrice: 36000,
    status: "shipped",
    createdAt: day(330),
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


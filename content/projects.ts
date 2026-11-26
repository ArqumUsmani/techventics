import type { Project } from "./types";

// PLACEHOLDER case studies. Replace with real projects (and set placeholder: false)
// once they are cleared for publishing. Names are deliberately generic.
// Each project gets its own page at /work/<id>; add images to `gallery` to make its slider slide.
export const projects: Project[] = [
  {
    id: "freight-portal",
    placeholder: true,
    title: "Freight operations portal",
    client: "Logistics client",
    year: "2025",
    services: ["development", "design"],
    summary: "A shipment tracking and billing portal that replaced three spreadsheets and a weekly phone call.",
    image: "/images/services/project-freight.webp",
    previewSrc: null,
    gallery: [
      {
        src: "/images/services/project-freight.webp",
        srcSmall: "/images/services/project-freight-800.webp",
        alt: "Freight operations dashboard with live shipment map, fleet status and billing panels",
        width: 1400,
        height: 594,
      },
    ],
    overview:
      "A regional logistics company ran its operations from three shared spreadsheets and a Monday phone call between dispatch, accounts and the warehouse. We designed and built one portal that all three teams now work from.",
    challenge:
      "Shipment status lived in one sheet, rates in another and invoices in a third. Nothing matched, customers called to ask where their freight was, and month-end billing took a week of copying numbers between files.",
    approach: [
      "Two weeks with dispatch, accounts and the warehouse floor, mapping how a shipment actually moves.",
      "A design system built around the dispatcher's day: one board, live statuses, nothing more than two clicks away.",
      "A Next.js portal on a PostgreSQL backend, with role-based access and an import that brought in four years of history.",
      "Automatic invoices from delivered shipments, and a customer view so clients can track their own freight.",
    ],
    outcome:
      "The spreadsheets were retired in the first month. Customers track shipments themselves, and billing closes in a day instead of a week.",
    results: [
      { value: "3 → 1", label: "Spreadsheets replaced by one portal" },
      { value: "1 day", label: "Month-end billing, down from a week" },
      { value: "−60%", label: "“Where is my shipment?” calls" },
    ],
  },
  {
    id: "restaurant-brand",
    placeholder: true,
    title: "Restaurant group identity",
    client: "Hospitality client",
    year: "2025",
    services: ["brand-identity", "design"],
    summary: "Name, mark and menu system for a group opening its fourth location.",
    image: "/images/services/project-restaurant.webp",
    previewSrc: null,
    gallery: [
      {
        src: "/images/services/project-restaurant.webp",
        srcSmall: "/images/services/project-restaurant-800.webp",
        alt: "Restaurant identity applied to menus, signage and packaging",
        width: 1400,
        height: 594,
      },
    ],
    overview:
      "Three restaurants had grown up under three different names and looks. Ahead of a fourth opening, the owners wanted one group brand that still let each location keep its own character.",
    challenge:
      "Guests didn't know the restaurants were related, so loyalty never carried from one to the next. Every new menu or sign was designed from scratch, and none of them matched.",
    approach: [
      "Workshops with the owners and head chefs to agree what the group stands for, and what each location adds.",
      "A new group name, a mark that works from a shopfront down to a stamp, and a colour for each location.",
      "A menu system with templates the kitchen team can update themselves without breaking the layout.",
      "Signage, packaging and social templates, delivered with a short brand guide.",
    ],
    outcome:
      "The fourth location opened under the new brand, and the first three were re-signed within the quarter. Menu changes now take the team an afternoon, not a round trip to a designer.",
    results: [
      { value: "4", label: "Locations under one brand" },
      { value: "1", label: "Menu system the kitchen updates itself" },
      { value: "6 wks", label: "From first workshop to launch" },
    ],
  },
  {
    id: "taxi-app",
    placeholder: true,
    title: "Taxi booking app",
    client: "Transport client",
    year: "2024",
    services: ["development", "design"],
    summary: "iOS and Android app for booking, reminders and follow-ups, designed with taxi drivers.",
    image: "/images/services/project-taxi.webp",
    previewSrc: null,
    gallery: [
      {
        src: "/images/services/project-taxi.webp",
        srcSmall: "/images/services/project-taxi-800.webp",
        alt: "Taxi booking app screens on several phones beside a taxi at night",
        width: 1400,
        height: 525,
      },
    ],
    overview:
      "A city taxi firm took bookings by phone and radioed them out to drivers. We designed and built an app for riders and a companion app for drivers, working with the drivers from the first sketch.",
    challenge:
      "At peak times the phone line was busy and bookings were lost. Drivers had no way to confirm a pickup, and riders had no idea when their car would arrive.",
    approach: [
      "Ride-alongs and interviews with drivers, so the driver app fits how they actually work behind the wheel.",
      "Booking in three taps, live arrival times, and reminders for booked rides.",
      "React Native apps for iOS and Android with a shared backend for dispatch, payments and follow-ups.",
      "A staged rollout: a small group of drivers first, then the whole fleet once they were happy with it.",
    ],
    outcome:
      "Most bookings now come through the app, the phone line is free for the customers who prefer it, and drivers confirm pickups with one tap.",
    results: [
      { value: "3 taps", label: "To book a ride" },
      { value: "70%", label: "Of bookings through the app" },
      { value: "4.8★", label: "Average store rating" },
    ],
  },
  {
    id: "it-hardware-licensing",
    placeholder: true,
    title: "IT hardware licensing",
    client: "Enterprise client",
    year: "2024",
    services: ["it-hardware"],
    summary: "Servers, networking and workstations supplied with the right licences, warranties and support, all on one renewal calendar.",
    image: "/images/services/project-it-licensing.webp",
    previewSrc: null,
    gallery: [
      {
        src: "/images/services/project-it-licensing.webp",
        srcSmall: "/images/services/project-it-licensing-800.webp",
        alt: "Enterprise servers, network switches, a workstation and components beside a hardware inventory in a code editor",
        width: 1280,
        height: 714,
      },
    ],
    overview:
      "A multi-site company was buying hardware from several vendors and licensing it piece by piece. We took over supply and licensing, so every server, switch and workstation arrives with the right licences, warranties and support already in place.",
    challenge:
      "Licences, warranties and support contracts were spread across vendors, inboxes and spreadsheets. Renewals were missed, some machines ran out of warranty unnoticed, and an audit showed the company was both under- and over-licensed.",
    approach: [
      "A full audit of the hardware estate: every server, switch and workstation, with its licences, warranty and support status.",
      "One plan for the right-sized licences: operating systems, virtualisation, firewall subscriptions and Microsoft Azure.",
      "Genuine hardware from Dell, HPE, Cisco, Lenovo and Fortinet, supplied with licences and warranties registered to the company.",
      "One renewal calendar with reminders well ahead of each expiry, and a single point of contact for support.",
    ],
    outcome:
      "The company now buys hardware and licences from one supplier, is fully compliant, and gets warning of every renewal months before it is due.",
    results: [
      { value: "100%", label: "Licences accounted for after the audit" },
      { value: "1", label: "Supplier for hardware, licences and support" },
      { value: "0", label: "Missed renewals since" },
    ],
  },
];

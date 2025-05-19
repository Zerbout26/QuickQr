
import { User, QRCode } from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "usr-123",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    trialStartDate: new Date('2023-01-01'),
    trialEndDate: new Date('2023-01-15'),
    isActive: true,
    hasActiveSubscription: false,
    createdAt: new Date('2022-12-15'),
    updatedAt: new Date('2022-12-15')
  },
  {
    id: "usr-456",
    email: "expired@example.com",
    name: "Expired User",
    role: "user",
    trialStartDate: new Date('2022-01-01'),
    trialEndDate: new Date('2022-01-15'),
    isActive: false,
    hasActiveSubscription: false,
    createdAt: new Date('2021-12-15'),
    updatedAt: new Date('2022-01-16')
  },
  {
    id: "usr-789",
    email: "subscriber@example.com",
    name: "Subscriber",
    role: "user",
    trialStartDate: new Date('2023-01-01'),
    trialEndDate: new Date('2023-01-15'),
    isActive: true,
    hasActiveSubscription: true,
    createdAt: new Date('2022-12-15'),
    updatedAt: new Date('2023-01-15')
  },
  {
    id: "adm-123",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    trialStartDate: new Date('2023-01-01'),
    trialEndDate: new Date('2023-01-15'),
    isActive: true,
    hasActiveSubscription: true,
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2022-12-01')
  },
  {
    id: "adm-456",
    email: "superadmin@example.com",
    name: "Super Admin",
    role: "admin",
    trialStartDate: new Date('2022-01-01'),
    trialEndDate: new Date('2022-01-15'),
    isActive: true,
    hasActiveSubscription: true,
    createdAt: new Date('2021-12-01'),
    updatedAt: new Date('2021-12-01')
  },
];

// Mock QR Codes
export const mockQRCodes: QRCode[] = [
  {
    id: "qr-123",
    name: "Restaurant Menu",
    type: "menu",
    url: "https://example.com/menu",
    originalUrl: "https://example.com/menu",
    links: [],
    menu: {
      restaurantName: "Delicious Bites",
      description: "Home of the best burgers in town!",
      categories: [
        {
          name: "Appetizers",
          items: [
            {
              name: "Mozzarella Sticks",
              description: "Crispy on the outside, gooey on the inside. Served with marinara.",
              price: 8.99,
              category: "Appetizers",
              imageUrl: "/uploads/items/item-1747613328646-965541719.png"
            }
          ],
        },
        {
          name: "Main Dishes",
          items: [
            {
              name: "Classic Burger",
              description: "Juicy beef patty with lettuce, tomato, onion, and our special sauce.",
              price: 12.99,
              category: "Main Dishes",
              imageUrl: "/uploads/items/item-1747613383629-430941781.jpeg"
            }
          ],
        },
      ],
    },
    logoUrl: "/uploads/logos/logo-1747487613512-874229422.png",
    foregroundColor: "#5D5FEF",
    backgroundColor: "#F9FAFB",
    user: mockUsers[0],
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-02-15')
  },
  {
    id: "qr-456",
    name: "Business Card",
    type: "url",
    url: "https://example.com/contact",
    originalUrl: "https://example.com/contact",
    links: [
      { label: "Website", url: "https://example.com" },
      { label: "Facebook", url: "https://facebook.com/example" },
      { label: "Contact Me", url: "mailto:contact@example.com" },
    ],
    logoUrl: "/uploads/logos/logo-1747487702205-220060420.png",
    foregroundColor: "#8B5CF6",
    backgroundColor: "#F3F4F6",
    user: mockUsers[2],
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01')
  },
  {
    id: "qr-789",
    name: "Both Types",
    type: "both",
    url: "https://example.com/restaurant",
    originalUrl: "https://example.com/restaurant",
    links: [
      { label: "Reserve a Table", url: "https://example.com/reservations" },
      { label: "Directions", url: "https://maps.google.com" },
      { label: "Instagram", url: "https://instagram.com/restaurant" },
      { label: "Twitter", url: "https://twitter.com/restaurant" },
      { label: "LinkedIn", url: "https://linkedin.com/company/restaurant" },
    ],
    menu: {
      restaurantName: "Fancy Dining",
      description: "Fine dining experience with the best ingredients",
      categories: [
        {
          name: "Starters",
          items: [
            {
              name: "Truffle Fries",
              description: "Hand-cut fries with truffle oil and parmesan",
              price: 14.99,
              category: "Starters",
              imageUrl: "/uploads/items/item-1747614049285-273052679.png"
            }
          ],
        }
      ],
    },
    logoUrl: "/uploads/logos/logo-1747488412434-849390581.png",
    foregroundColor: "#10B981",
    backgroundColor: "#ECFDF5",
    user: mockUsers[0],
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  },
];

export const mockUserWithoutQRCodes: User = {
  id: "usr-999",
  email: "new@example.com",
  role: "user",
  trialStartDate: new Date('2023-05-01'),
  trialEndDate: new Date('2023-05-15'),
  isActive: true,
  hasActiveSubscription: false,
  createdAt: new Date('2023-05-01'),
  updatedAt: new Date('2023-05-01')
};

// Function to find QR codes by user id
export const getQRCodesByUser = (userId: string) => {
  return mockQRCodes.filter(qr => qr.user.id === userId);
};

export const metrics = {
  revenue: {
    value: "$45,200",
    change: "+12%",
    isPositive: true,
  },
  ticketsSold: {
    value: "1,240",
    change: "+5%",
    isPositive: true,
  },
  activeRaffles: {
    value: "5",
    change: "0%",
    isPositive: false, // Neutral
  },
  participants: {
    value: "890",
    change: "+8%",
    isPositive: true,
  },
};

export const activeRaffles = [
  {
    id: 1,
    name: "Sorteo benéfico de verano",
    initials: "SB",
    initialsColor: "from-orange-400 to-red-500",
    endDate: "24 oct 2023",
    salesSold: 75,
    salesPercentage: 75,
    action: "Administrar",
  },
  {
    id: 2,
    name: "Sorteo de paquete tecnológico",
    initials: "PT",
    initialsColor: "from-blue-400 to-indigo-500",
    endDate: "01 nov 2023",
    salesSold: 45,
    salesPercentage: 45,
    action: "Administrar",
  },
  {
    id: 3,
    name: "Premio en efectivo navideño",
    initials: "PN",
    initialsColor: "from-emerald-400 to-teal-500",
    endDate: "15 dic 2023",
    salesSold: 0,
    salesPercentage: 0,
    action: "Editar",
  },
];

export const raffles = [
  {
    id: "RF-2024-001",
    title: "Sorteo Tesla Model 3",
    price: 10.00,
    sold: 500,
    total: 1000,
    status: "Publicada",
    endDate: "24 Oct, 2024",
    image: "https://images.unsplash.com/photo-1536700503339-1e4b065207d3?auto=format&fit=crop&q=80&w=200",
    initials: "TM",
    initialsColor: "from-red-500 to-red-600"
  },
  {
    id: "RF-2024-002",
    title: "iPhone 15 Pro Max",
    price: 5.00,
    sold: 0,
    total: 500,
    status: "Borrador",
    endDate: "15 Nov, 2024",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=200",
    initials: "IP",
    initialsColor: "from-blue-400 to-indigo-500"
  },
  {
    id: "RF-2023-089",
    title: "Viaje Todo Incluido a Bali",
    price: 20.00,
    sold: 1000,
    total: 1000,
    status: "Finalizada",
    endDate: "01 Oct, 2023",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=200",
    initials: "VB",
    initialsColor: "from-cyan-400 to-blue-500"
  },
  {
    id: "RF-2024-005",
    title: "MacBook Air M2",
    price: 8.00,
    sold: 250,
    total: 400,
    status: "Publicada",
    endDate: "10 Dic, 2024",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=200",
    initials: "MA",
    initialsColor: "from-slate-400 to-slate-600"
  },
  {
    id: "RF-2024-006",
    title: "Consola PS5 Slim",
    price: 15.00,
    sold: 120,
    total: 300,
    status: "Publicada",
    endDate: "20 Dic, 2024",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=200",
    initials: "PS",
    initialsColor: "from-blue-600 to-indigo-700"
  },
  {
    id: "RF-2024-007",
    title: "Tarjeta de Regalo Amazon $500",
    price: 2.00,
    sold: 45,
    total: 250,
    status: "Borrador",
    endDate: "30 Dic, 2024",
    image: null,
    initials: "TR",
    initialsColor: "from-orange-400 to-yellow-500"
  }
];

export const recentActivity = [
  {
    id: 1,
    type: "purchase",
    user: "Sarah Jenkins",
    action: "compró 5 boletos",
    amount: "+$50.00",
    time: "hace 2 min",
    icon: "shopping_cart",
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    borderColor: "border-primary/30",
  },
  {
    id: 2,
    type: "registration",
    user: "Registro de nuevo usuario",
    handle: "@mike_d",
    time: "hace 15 min",
    icon: "person_add",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  {
    id: 3,
    type: "ended",
    text: "Rifa finalizada:",
    raffleName: "Lanzamiento de zapatillas",
    status: "Ganador pendiente",
    statusColor: "text-orange-300 bg-orange-500/10",
    time: "hace 1 h",
    icon: "emoji_events",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
];

export const winnerSpotlight = {
  name: "James K.",
  prize: "Paquete de relojes de lujo",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCgZ2jYX4ZyB34seKiIyUCsQnu2XmmyPw35ZOMgNCa93GYhIhJNVOxZFDAqn_cv1BITfwy8B2jnplZzh6WBl558Uh10bGrr2nKqqOwqJsGi7yN1CYBiO2yHlJgpuC5O_dZRMI38QozLpzF4gJS-rMkBvYhjincp6P03nnxk3dOJGbjpECJSF21m5K662p5Alrh0Wsxd7JvN8KkXIQ3DyQk3C2jh4rGXiN5ENzyNQ8n4fzykvvvEkNREA-n0LASWQbROwUai96zTcZq",
};

export const userProfile = {
  name: "Alex Morgan",
  role: "Súper administrador",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7N2ZDIU89m7gP3o0t_USWDGVAkmPMPv4OOzIVDVIHBmK4DRVQTYg-MEMG4-R9xrSQvP2pwvqzZTbtIyPJ5ezVRtnjYbfKy_HnDwsK0zsLM91jOCemc3G5GT8nuLmDF-GWucaM_rRdxV1WIvZIW6s44R1EWEsROMA5CE3EUkqw9QfKybp_-Hr9Lnuuj0NnoNExLto4hUDsJR5E7GwQ8mTY_gNZAhIOJo4iqezngoFxMAwRKPvuE-4fY4flpI9j30DlNxb13eaUfM_5",
};

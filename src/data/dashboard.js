export const kpis = [
  { label: "Total submissions", value: "248", delta: "+18 this week", tone: "cyan" },
  { label: "Accepted papers", value: "64", delta: "26% acceptance rate", tone: "mint" },
  { label: "Pending reviews", value: "39", delta: "8 overdue", tone: "gold" },
  { label: "Payments cleared", value: "121", delta: "17 awaiting settlement", tone: "coral" },
];

export const submissions = [
  {
    id: "P-1042",
    title: "Vision-Language Compression for Edge Robotics",
    author: "Fahim Hasan",
    track: "Artificial Intelligence",
    status: "Under Review",
    reviewers: 3,
    updatedAt: "Apr 24, 2026",
  },
  {
    id: "P-1068",
    title: "Flood Prediction with Multi-Sensor Time Series",
    author: "Nusrat Jahan",
    track: "Data Science",
    status: "Accepted",
    reviewers: 2,
    updatedAt: "Apr 23, 2026",
  },
  {
    id: "P-1091",
    title: "Secure Lightweight Authentication for IoT Labs",
    author: "Arif Rahman",
    track: "Cyber Security",
    status: "Revision",
    reviewers: 2,
    updatedAt: "Apr 22, 2026",
  },
  {
    id: "P-1107",
    title: "Energy-Aware Scheduling in Smart Campuses",
    author: "Tasnia Karim",
    track: "Smart Systems",
    status: "Submitted",
    reviewers: 0,
    updatedAt: "Apr 25, 2026",
  },
];

export const reviewers = [
  { name: "Dr. Samia Akter", expertise: "AI, NLP", assigned: 14, completion: "86%", risk: "On Track" },
  { name: "Prof. Imran Kabir", expertise: "Data Science", assigned: 11, completion: "73%", risk: "Watch" },
  { name: "Dr. Mehedi Islam", expertise: "IoT Security", assigned: 9, completion: "92%", risk: "On Track" },
  { name: "Dr. Ayesha Sultana", expertise: "Systems", assigned: 15, completion: "61%", risk: "Overdue" },
];

export const users = [
  { name: "Admin Team", email: "admin@duet.ac.bd", role: "Admin", status: "Active" },
  { name: "Farzana Noor", email: "author1@duet.ac.bd", role: "Author", status: "Active" },
  { name: "Rakib Ahmed", email: "reviewer2@duet.ac.bd", role: "Reviewer", status: "Active" },
  { name: "Shila Khatun", email: "guest@duet.ac.bd", role: "Guest", status: "Blocked" },
];

export const tracks = [
  { name: "Artificial Intelligence", submissions: 82, chair: "Dr. Samia Akter" },
  { name: "Data Science", submissions: 69, chair: "Prof. Imran Kabir" },
  { name: "Cyber Security", submissions: 38, chair: "Dr. Mehedi Islam" },
  { name: "Smart Systems", submissions: 59, chair: "Dr. Ayesha Sultana" },
];

export const schedule = [
  { session: "Opening Keynote", time: "09:00 AM", room: "Auditorium", type: "Keynote" },
  { session: "AI Paper Session", time: "11:00 AM", room: "Lab-201", type: "Technical" },
  { session: "Data Science Panel", time: "01:30 PM", room: "Seminar Hall", type: "Panel" },
  { session: "Poster Showcase", time: "03:00 PM", room: "Gallery", type: "Poster" },
];

export const notices = [
  { title: "Submission confirmation", audience: "Authors", status: "Automated" },
  { title: "Review reminder", audience: "Reviewers", status: "Scheduled" },
  { title: "Acceptance decision", audience: "Selected authors", status: "Draft" },
];

export const payments = [
  { registrant: "Nusrat Jahan", amount: "$120", method: "SSLCommerz", status: "Paid" },
  { registrant: "Arif Rahman", amount: "$120", method: "Card", status: "Pending" },
  { registrant: "Tasnia Karim", amount: "$120", method: "Bank Transfer", status: "Paid" },
];

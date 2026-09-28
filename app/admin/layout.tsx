// The owner area is the only place that uses Tailwind and the shadcn kit, so its stylesheet loads here and never on
// public pages.
import "../globals.css";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

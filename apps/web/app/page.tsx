const modules = [
  {
    href: "/products",
    label: "Product Master",
    description: "Create and manage products by name, category, and lot number.",
    icon: "📦",
  },
  {
    href: "/intake",
    label: "Add Intake",
    description: "Record inbound inventory and lock the transaction on save.",
    icon: "📥",
  },
  {
    href: "/outtake",
    label: "Add Outtake",
    description: "Record sales and depletions from available inventory.",
    icon: "📤",
  },
  {
    href: "/inventory",
    label: "Current Inventory",
    description: "Review units on hand with filtering by product, category, and lot.",
    icon: "📊",
  },
  {
    href: "/history",
    label: "Transaction History",
    description: "Browse intake and outtake records and manage lock status.",
    icon: "🗂",
  },
  {
    href: "/api/reports/inventory",
    label: "Export CSV",
    description: "Download a snapshot of current inventory as a CSV file.",
    icon: "⬇",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-wide text-charcoal m-0">Organizize</h1>
        <p className="text-charcoal/60 mt-2 text-lg m-0">
          Inventory management for day-to-day operations. Select a module to get started.
        </p>
      </div>

      <nav aria-label="Primary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map(({ href, label, description, icon }) => (
          <a
            key={href}
            href={href}
            className="group block bg-white border border-charcoal/10 rounded-sm p-5 shadow-sm hover:border-charcoal/30 hover:shadow-md transition-all no-underline"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{icon}</span>
              <div>
                <div className="font-bold text-charcoal tracking-wide group-hover:text-amber transition-colors">
                  {label}
                </div>
                <div className="text-sm text-charcoal/55 mt-1 leading-snug">{description}</div>
              </div>
            </div>
          </a>
        ))}
      </nav>
    </div>
  );
}

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
    <div className="page-stack">
      <div>
        <h1 className="page-title">Organizize</h1>
        <p className="page-subtitle">
          Inventory management for day-to-day operations. Select a module to get started.
        </p>
      </div>

      <nav aria-label="Primary" className="module-grid">
        {modules.map(({ href, label, description, icon }) => (
          <a key={href} href={href} className="module-card">
            <div className="module-card-inner">
              <span className="module-card-icon">{icon}</span>
              <div>
                <div className="module-card-label">{label}</div>
                <div className="module-card-desc">{description}</div>
              </div>
            </div>
          </a>
        ))}
      </nav>
    </div>
  );
}

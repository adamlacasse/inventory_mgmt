export default function HomePage() {
  return (
    <main>
      <h1>Organizize</h1>
      <p>Get organized with the workflow links below for day-to-day inventory operations.</p>
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href="/products">Product Master</a>
          </li>
          <li>
            <a href="/intake">Add Intake</a>
          </li>
          <li>
            <a href="/outtake">Add Outtake</a>
          </li>
          <li>
            <a href="/inventory">Current Inventory</a>
          </li>
          <li>
            <a href="/history">Transaction History</a>
          </li>
          <li>
            <a href="/api/reports/inventory">Export Inventory CSV</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}

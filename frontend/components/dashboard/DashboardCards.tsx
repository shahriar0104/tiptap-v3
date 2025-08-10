export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card p-5">
        <h3 className="text-base font-semibold">Get started</h3>
        <p className="mt-1 text-sm text-gray-600">Create a fresh agenda and generate sections with your AI copilot.</p>
        <a href="/agenda/new" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-sm font-medium">New board paper</a>
      </div>
      <div className="card p-5">
        <h3 className="text-base font-semibold">Past meetings</h3>
        <p className="mt-1 text-3xl font-bold">—</p>
        <p className="text-sm text-gray-600">Pulled from your API.</p>
      </div>
      <div className="card p-5">
        <h3 className="text-base font-semibold">Uploads</h3>
        <p className="mt-1 text-sm text-gray-600">Attach PDFs, CSVs, and spreadsheets to agenda items.</p>
      </div>
    </div>
  );
}
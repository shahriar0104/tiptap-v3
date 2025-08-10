import CardButton from "@/components/ui-helper/CardButton";

export default function Dashboard() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Board Meetings Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Board Meetings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Create and manage your board meetings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardButton
            href="/agenda/new"
            title="Create New Meeting"
            description="Set up a new board meeting with agenda and documentation"
            icon="📋"
            tone="brand"
          />
          <CardButton
            href="/meetings"
            title="View Past Meetings"
            description="Browse previous board meetings and their records"
            icon="📚"
          />
        </div>
      </section>

      {/* Data Repo Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Data Repository
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Connect and manage your document sources
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardButton
            href="/connectors/zero"
            title="Zero Connector"
            description="Connect to Zero for automated data sync"
            icon="🔗"
            tone="brand"
          />
          <CardButton
            href="/import/pdf"
            title="PDF Import"
            description="Upload and process PDF documents"
            icon="📄"
          />
          <CardButton
            href="/repo"
            title="Document Repository"
            description="Browse and search all your documents"
            icon="🗂️"
          />
        </div>
      </section>
    </div>
  );
}

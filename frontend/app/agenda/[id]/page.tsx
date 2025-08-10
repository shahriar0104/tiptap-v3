import AgendaBuilder from "@/components/agenda/AgendaBuilder";

async function getPaper(id: string) {
  // Replace with your API. Fallback sample mirrors screenshots.
  try {
    const res = await fetch(`${process.env.API_BASE_URL || "http://localhost:4000"}/papers/${id}`, {
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch {}
  // sample shape
  return {
    id,
    title: "Create Board Meeting Agenda",
    groups: [
      {
        id: "g1",
        items: [
          { id: "i1", time: "10:00", title: "Minutes of Meetings and Action Items", action: "Action" },
          { id: "i2", time: "", title: "Minutes of meeting of 26 March 2025", action: "Approve" },
          { id: "i3", time: "", title: "Action items", action: "Noting" },
        ],
      },
      {
        id: "g2",
        items: [
          { id: "i4", time: "10:20", title: "Strategic Context", action: "Action" },
          { id: "i5", time: "", title: "CEO Report (incl. Service Delivery + Strategic Outcomes)", action: "Noting" },
          { id: "i6", time: "", title: "FY26 budget Approach - Deferred to AFR", action: "Noting" },
          { id: "i7", time: "", title: "Voice of Lived Experience - Individual (Client) Rights ", action: "Approve" },
          { id: "i8", time: "", title: "Support Co-ordination Paper", action: "Approve" },
          { id: "i9", time: "", title: "ACT Regional Exit", action: "Approve" },
        ],
      },
      {
        id: "g3",
        items: [
          { id: "i10", time: "", title: "People, SRA and Finance Updates", action: "Action" },
          { id: "i11", time: "", title: "CFO Report", action: "Noting" },
          { id: "i12", time: "", title: "CFO Audit Plan & EY FY25 Audit Engagement & Fee Letter", action: "Approve" },
        ],
      },
    ],
  };
}

export default async function AgendaPage({ params }: { params: { id: string } }) {
  const paper = await getPaper(params.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{paper.title}</h1>
      <AgendaBuilder paperId={paper.id} initialGroups={paper.groups} />
    </div>
  );
}
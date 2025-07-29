// Mock AI Copilot service for text and chart suggestions
export type CopilotChartRequest = {
  prompt: string;
  context?: string;
};

export type CopilotTextRequest = {
  prompt: string;
  context?: string;
};

export type CopilotChartResponse = {
  options: any;
  series: any;
};

export type CopilotTextResponse = {
  suggestions: string[];
  rewritten?: string;
};

export async function mockCopilotChart(req: CopilotChartRequest): Promise<CopilotChartResponse> {
  // Simulate AI chart config
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        options: {
          chart: { id: "mock-bar" },
          xaxis: { categories: ["Q1", "Q2", "Q3", "Q4"] },
        },
        series: [
          { name: "Revenue", data: [12000, 15000, 11000, 17000] },
        ],
      });
    }, 1200);
  });
}

export async function mockCopilotText(req: CopilotTextRequest): Promise<CopilotTextResponse> {
  // Simulate AI text suggestions
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        suggestions: [
          "Rewrite: " + (req.context || "") + " (improved)",
          "Summarize: " + (req.context || "") + " (summary)",
          "Make clearer: " + (req.context || "") + " (clear)",
        ],
        rewritten: (req.context || "") + " (rewritten)",
      });
    }, 900);
  });
}

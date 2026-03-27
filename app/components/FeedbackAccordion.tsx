import { useState } from "react";

type FeedbackSectionItem = {
  key: string;
  title: string;
  score: number;
  tips: {
    type: "good" | "improve";
    tip: string;
    explanation?: string;
  }[];
};

const getStatus = (score: number) => {
  if (score >= 80) {
    return {
      label: "Good",
      badgeClassName: "status-badge status-good",
      remark: "This section is strong and needs only minor tuning.",
    };
  }

  if (score >= 60) {
    return {
      label: "Better",
      badgeClassName: "status-badge status-better",
      remark: "This section is decent but still has visible room for improvement.",
    };
  }

  return {
    label: "Need to Improve",
    badgeClassName: "status-badge status-improve",
    remark: "This section is holding the resume back and should be revised first.",
  };
};

const FeedbackAccordion = ({ sections }: { sections: FeedbackSectionItem[] }) => {
  const [openKey, setOpenKey] = useState<string | null>(sections[0]?.key ?? null);

  return (
    <div className="feedback-accordion">
      {sections.map((section) => {
        const status = getStatus(section.score);
        const isOpen = openKey === section.key;

        return (
          <div key={section.key} className="feedback-panel">
            <button
              type="button"
              className="flex w-full items-center gap-4 text-left"
              onClick={() => setOpenKey(isOpen ? null : section.key)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                  <span className={status.badgeClassName}>{status.label}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Score</p>
                <p className="text-xl font-semibold text-slate-900">{section.score}/100</p>
              </div>
              <span
                className={`text-2xl text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>

            {isOpen ? (
              <div className="feedback-panel-body">
                <div className="mb-5 flex items-center gap-3">
                  <span className={status.badgeClassName}>{status.label}</span>
                  <p className="text-slate-600">{status.remark}</p>
                </div>

                <div className="flex flex-col gap-3">
                  {section.tips.length > 0 ? (
                    section.tips.map((tip, index) => (
                      <div key={`${section.key}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-3">
                          <span
                            className={`status-badge ${
                              tip.type === "good" ? "status-good" : "status-improve"
                            }`}
                          >
                            {tip.type === "good" ? "Good" : "Need to Improve"}
                          </span>
                          <p className="font-semibold text-slate-900">{tip.tip}</p>
                        </div>
                        {tip.explanation ? (
                          <p className="text-slate-600">{tip.explanation}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                      No detailed remarks were returned for this section.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default FeedbackAccordion;

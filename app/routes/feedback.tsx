import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import FeedbackAccordion from "~/components/FeedbackAccordion";
import Navbar from "~/components/navbar";
import ScoreCircle from "~/components/ScoreCircle";
import { usePuterStore } from "~/lib/puter";
import { useObjectUrl } from "~/lib/useObjectUrl";

const FeedbackPage = () => {
  const { id } = useParams();
  const { kv, fs } = usePuterStore();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // const imageUrl = useObjectUrl(resume?.imagePath, fs.read);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const loadResume = async () => {
      if (!id) {
        setError("Missing resume id");
        setIsLoading(false);
        return;
      }

      const storedValue = await kv.get(id);

      if (!storedValue) {
        setError("Feedback record not found");
        setIsLoading(false);
        return;
      }

      try {
        const data = JSON.parse(storedValue);
        const resumeBlob = await fs.read(data.resumePath);
        if (!resumeBlob) return;
        const imageBlob = await fs.read(data.imagePath);
        if (!imageBlob) return;
        const imageUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageUrl);
        setResume(JSON.parse(storedValue) as Resume);
      } catch {
        setError("Failed to read feedback");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id, kv]);

  if (isLoading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Feedback</h1>
            <h2>Loading feedback...</h2>
          </div>
        </section>
      </main>
    );
  }

  if (error || !resume || typeof resume.feedback === "string") {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Feedback</h1>
            <h2>{error || "Feedback is not available yet."}</h2>
            <Link
              to={resume ? `/resume/${resume.id}` : "/"}
              className="primary-button mt-6 inline-flex items-center justify-center"
            >
              Back
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const sections = [
    {
      key: "ats",
      title: "ATS",
      score: resume.feedback.ATS.score,
      tips: resume.feedback.ATS.tips,
    },
    {
      key: "tone",
      title: "Tone",
      score: resume.feedback.toneAndStyle.score,
      tips: resume.feedback.toneAndStyle.tips,
    },
    {
      key: "content",
      title: "Content",
      score: resume.feedback.content.score,
      tips: resume.feedback.content.tips,
    },
    {
      key: "structure",
      title: "Structure",
      score: resume.feedback.structure.score,
      tips: resume.feedback.structure.tips,
    },
    {
      key: "skills",
      title: "Skills",
      score: resume.feedback.skills.score,
      tips: resume.feedback.skills.tips,
    },
  ];

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Feedback</h1>
          <h2>{resume.companyName} | {resume.jobTitle}</h2>
        </div>

        <div className="flex w-full max-w-6xl flex-col gap-8 pb-16">
          <div className="flex w-full flex-col gap-8 xl:flex-row">
          <div className="gradient-border xl:w-[360px]">
            <div className="flex h-full flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Overall Score
              </p>
              <ScoreCircle score={resume.feedback.overallScore} />
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-slate-900">
                  {resume.feedback.overallScore}/100
                </h3>
                <p className="text-slate-600">
                  Review each section below to see what is working and what needs revision.
                </p>
              </div>
              <Link
                to={`/resume/${resume.id}`}
                className="primary-button inline-flex items-center justify-center"
              >
                Back to resume
              </Link>
            </div>
          </div>

          <div className="w-full xl:flex-1">
            <FeedbackAccordion sections={sections} />
          </div>
        </div>
          <div className="feedback-panel w-full">
            <div className="mb-5 text-left">
              <h3 className="text-2xl font-semibold text-slate-900">Resume Preview</h3>
              <p className="text-slate-600">Generated image of the uploaded resume.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="generated resume preview"
                  className="w-full object-contain object-top"
                />
              ) : (
                <div className="flex min-h-40 items-center justify-center text-slate-500">
                  Loading generated resume image...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FeedbackPage;

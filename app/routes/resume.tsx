import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Navbar from "~/components/navbar";
import ScoreCircle from "~/components/ScoreCircle";
import { AIResponseFormat, prepareInstructions } from "../../constants";
import { usePuterStore } from "~/lib/puter";
import { useObjectUrl } from "~/lib/useObjectUrl";

const extractJsonText = (content: AIResponse["message"]["content"]) => {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object" && "text" in item) {
        const text = item.text;
        return typeof text === "string" ? text : "";
      }

      return "";
    })
    .join("")
    .trim();
};

const sanitizeJsonResponse = (raw: string) =>
  raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

const ResumePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { kv, ai, fs } = usePuterStore();
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      if (!id) {
        setError("Missing resume id");
        setIsLoading(false);
        return;
      }

      const storedValue = await kv.get(id);

      if (!storedValue) {
        setError("Resume not found");
        setIsLoading(false);
        return;
      }

      try {
        setResume(JSON.parse(storedValue) as Resume);
      } catch {
        setError("Failed to read saved resume");
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id, kv]);

  const handleGenerateFeedback = async () => {
    if (!resume || !id) return;

    try {
      setIsGenerating(true);
      setError("");

      const prompt = prepareInstructions({
        jobTitle: resume.jobTitle ?? "",
        jobDescription: resume.jobDescription ?? "",
        AIResponseFormat,
      });

      const response = await ai.feedback(resume.resumePath, prompt);
      const content = response?.message.content;
      const textContent = sanitizeJsonResponse(extractJsonText(content ?? ""));

      if (!textContent) {
        throw new Error("Feedback response was empty");
      }

      const feedback = JSON.parse(textContent) as Feedback;

      const updatedResume: Resume = {
        ...resume,
        feedback,
      };

      await kv.set(id, JSON.stringify(updatedResume));
      setResume(updatedResume);
      navigate(`/resume/${id}/feedback`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate feedback");
    } finally {
      setIsGenerating(false);
    }
  };

  const score = resume?.feedback && typeof resume.feedback !== "string"
    ? resume.feedback.overallScore
    : 0;
  const imageUrl = useObjectUrl(resume?.imagePath, fs.read);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>{resume?.companyName ?? "Resume"}</h1>
          <h2>{resume?.jobTitle ?? "Saved resume details"}</h2>
        </div>

        {isLoading ? (
          <div className="page-heading pb-16">
            <h2>Loading resume...</h2>
          </div>
        ) : error && !resume ? (
          <div className="page-heading pb-16">
            <h2>{error}</h2>
            <Link to="/" className="primary-button mt-6 inline-flex">
              Back to home
            </Link>
          </div>
        ) : resume ? (
          <div className="flex flex-col gap-8 pb-16">
            <div className="resume-card">
              <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                  <h2 className="text-black! font-bold">{resume.companyName}</h2>
                  <h3 className="text-lg text-gray-500">{resume.jobTitle}</h3>
                </div>
                <ScoreCircle score={score} />
              </div>

              <div className="gradient-border">
                <div className="w-full h-full">
                  <img
                    src={imageUrl || resume.imagePath}
                    alt="resume preview"
                    className="w-full object-cover object-top"
                    style={{ maxHeight: "600px" }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 text-left">
                <p><strong>Company:</strong> {resume.companyName}</p>
                <p><strong>Job Title:</strong> {resume.jobTitle}</p>
                <p><strong>Job Description:</strong> {resume.jobDescription}</p>
              </div>

              {typeof resume.feedback === "string" ? (
                <div className="mt-8 flex flex-col gap-4">
                  <p>No feedback generated yet.</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleGenerateFeedback}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating feedback..." : "Generate feedback"}
                  </button>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-4">
                  <p>Feedback is ready for this resume.</p>
                  <Link
                    to={`/resume/${resume.id}/feedback`}
                    className="primary-button inline-flex items-center justify-center"
                  >
                    View feedback
                  </Link>
                </div>
              )}

              {error ? <p className="mt-4 text-red-500">{error}</p> : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default ResumePage;

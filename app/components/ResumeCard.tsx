import React from 'react';
import { Link } from 'react-router';
import ScoreCircle from '~/components/ScoreCircle';
import { usePuterStore } from "~/lib/puter";
import { useObjectUrl } from "~/lib/useObjectUrl";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const score = feedback && typeof feedback !== "string" ? feedback.overallScore : 0;
  const imageUrl = useObjectUrl(imagePath, fs.read);

  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          <h2 className="text-black! font-bold wrap-break-word">
            {companyName}
          </h2>
          <h3 className="text-lg wrap-break-word text-gray-500">{jobTitle}</h3>
        </div>
        <div className="shrink-0">
          <ScoreCircle score={score} />
        </div>
      </div>
      <div className="gradient-border animate-in fade-in duration-1000">
        <div className="w-full h-full">
          <img
            src={imageUrl || imagePath}
            alt="resume"
            className="w-full max-sm\:h-\[200px\] object-cover object-top" style={{ height: '350px' }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;

import type { Route } from './+types/home';
import Navbar from '~/components/navbar';
import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import { useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Resumind' },
    { name: 'description', content: 'Smart Feedback for Your Dream Job' },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!auth.isAuthenticated) return;

      const items = await kv.list('*', true);

      if (!Array.isArray(items)) {
        setResumes([]);
        return;
      }

      const parsedResumes = items
        .filter((item): item is KVItem => typeof item === 'object' && item !== null && 'value' in item)
        .map((item) => {
          try {
            return JSON.parse(item.value) as Resume;
          } catch {
            return null;
          }
        })
        .filter((resume): resume is Resume => resume !== null)
        .reverse();

      setResumes(parsedResumes);
    };

    loadResumes();
  }, [auth.isAuthenticated, kv]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2> Review your submissions and AI-Powered feedback</h2>
        </div>
        {resumes.length > 0 ? (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        ) : (
          <div className="page-heading pb-16">
            <h2>No saved resumes yet. Upload one to get started.</h2>
          </div>
        )}
      </section>
    </main>
  );
}

import { useResumeAnalysis } from '../hooks/useResumeAnalysis';
import { Link } from 'react-router-dom';
import Badge   from '../components/Badge';
import Spinner from '../components/Spinner';
import Alert   from '../components/Alert';

function scoreColor(score: number): string {
  if (score >= 70) return 'emerald';
  if (score >= 40) return 'amber';
  return 'red';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Strong resume — a few tweaks will make it outstanding.';
  if (score >= 40) return 'Decent base — several improvements needed.';
  return 'Needs significant work before applying.';
}

const barColors: Record<'emerald' | 'amber' | 'red', string> = {
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
};

export default function ResumeAnalysis() {
  const { analysis, loading, error } = useResumeAnalysis();

  if (loading) return <Spinner text="Loading analysis…" />;

  if (error) return (
    <div className="max-w-xl mx-auto space-y-4">
      <Alert type="info" message="No analysis found yet." />
      <Link
        to="/resume/upload"
        className="block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
      >
        Upload and analyze your resume
      </Link>
    </div>
  );

  if (!analysis) return null;

  const color = scoreColor(analysis.score);
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50  border-amber-200  text-amber-600',
    red:     'bg-red-50    border-red-200    text-red-600',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Resume analysis</h1>
        <Link
          to="/resume/upload"
          className="text-sm text-indigo-600 hover:underline"
        >
          Re-upload &amp; analyze
        </Link>
      </div>

      {/* Score */}
      <div className={`border rounded-xl p-6 flex items-center gap-6 ${colorMap[color]}`}>
        <div className="text-6xl font-bold">{analysis.score}</div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">Resume score</p>
          <p className="text-gray-500 text-sm">{scoreLabel(analysis.score)}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${analysis.score}%`,
            backgroundColor: barColors[color as keyof typeof barColors],
          }}
        />
      </div>

      {/* Missing skills */}
      {analysis.missing_skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Missing skills</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills.map((skill, i) => (
              <Badge key={i} label={skill} variant="red" />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Suggestions</h2>
          <ul className="space-y-2.5">
            {analysis.suggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-indigo-500 font-bold mt-0.5">→</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Last analyzed: {new Date(analysis.created_at).toLocaleString()}
      </p>
    </div>
  );
}
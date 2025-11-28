/**
 * Vote Page
 * Accessible via unique voting token link: /vote/:token
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, User, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { buildUrl } from '../config/api';

const VotePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [electionData, setElectionData] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [votedPositions, setVotedPositions] = useState(new Set());
  const recaptcha = useRecaptcha('v3', 'vote');

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildUrl('/vote/validate-link'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setElectionData(data.data);
        
        // Mark positions that are already voted
        const voted = new Set();
        data.data.positions.forEach(pos => {
          if (pos.hasVoted) {
            voted.add(pos._id);
          }
        });
        setVotedPositions(voted);
      } else {
        toast.error(data.message || 'Invalid voting link');
        navigate('/');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error('Failed to validate voting link');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (positionId, candidateId) => {
    if (votedPositions.has(positionId)) {
      toast.warning('You have already voted for this position');
      return;
    }

    if (!window.confirm('Are you sure you want to vote for this candidate? This action cannot be undone.')) {
      return;
    }

    setSubmitting(true);

    try {
      // Get reCAPTCHA token if enabled
      let recaptchaToken = null;
      if (recaptcha.isEnabled) {
        recaptchaToken = await recaptcha.execute();
        if (!recaptchaToken) {
          toast.error('reCAPTCHA verification failed');
          setSubmitting(false);
          return;
        }
      }

      const response = await fetch(buildUrl('/vote/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          positionId,
          electionId: electionData.election._id,
          token,
          recaptchaToken
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Vote cast successfully!');
        setSelectedCandidates({ ...selectedCandidates, [positionId]: candidateId });
        setVotedPositions(new Set([...votedPositions, positionId]));
        
        // Redirect to results after a delay
        setTimeout(() => {
          navigate(`/elections/${electionData.election._id}/results`);
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral-600">Validating voting link...</p>
        </div>
      </div>
    );
  }

  if (!electionData) {
    return null;
  }

  const { election, positions } = electionData;
  const now = new Date();
  const isActive = election.status === 'active' && 
                   now >= new Date(election.startTime) && 
                   now <= new Date(election.endTime);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Election Header */}
        <div className="card p-8 mb-6">
          <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
            {election.title}
          </h1>
          {election.description && (
            <p className="text-neutral-600 mb-4">{election.description}</p>
          )}
          
          <div className="flex items-center gap-4 mt-4">
            {isActive ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircle2 size={16} className="inline mr-1" />
                Voting Open
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                <AlertCircle size={16} className="inline mr-1" />
                {election.status === 'closed' ? 'Voting Closed' : 'Not Yet Open'}
              </span>
            )}
            <span className="text-sm text-neutral-600">
              Closes: {new Date(election.endTime).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Voting Instructions */}
        {isActive && (
          <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-heading font-bold text-charcoal mb-2">Voting Instructions</h3>
            <ul className="list-disc list-inside text-sm text-neutral-700 space-y-1">
              <li>Select one candidate per position</li>
              <li>You can vote for multiple positions</li>
              <li>Once submitted, your vote cannot be changed</li>
              <li>Your vote is anonymous and secure</li>
            </ul>
          </div>
        )}

        {/* Positions */}
        <div className="space-y-6">
          {positions.map((position) => {
            const hasVoted = votedPositions.has(position._id);
            const selectedCandidate = selectedCandidates[position._id];

            return (
              <div key={position._id} className="card p-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-4">
                  {position.name}
                </h2>
                {position.description && (
                  <p className="text-neutral-600 mb-6">{position.description}</p>
                )}

                {hasVoted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">You have voted for this position</p>
                    {selectedCandidate && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {position.candidates.find(c => c._id === selectedCandidate)?.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {position.candidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {candidate.photoUrl ? (
                            <img
                              src={candidate.photoUrl}
                              alt={candidate.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-heading font-bold text-charcoal mb-1">
                              {candidate.name}
                            </h3>
                            {candidate.bio && (
                              <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                                {candidate.bio}
                              </p>
                            )}
                            {candidate.manifesto && (
                              <details className="text-sm">
                                <summary className="cursor-pointer text-primary font-medium">
                                  View Manifesto
                                </summary>
                                <p className="mt-2 text-neutral-600">{candidate.manifesto}</p>
                              </details>
                            )}
                            <button
                              onClick={() => handleVote(position._id, candidate._id)}
                              disabled={!isActive || submitting}
                              className="btn-primary mt-3 w-full"
                            >
                              {submitting ? (
                                <>
                                  <Loader2 size={16} className="inline mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                'Vote for this Candidate'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View Results Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(`/elections/${election._id}/results`)}
            className="btn-outline"
          >
            View Live Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotePage;


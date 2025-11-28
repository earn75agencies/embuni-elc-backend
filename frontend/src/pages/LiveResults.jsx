/**
 * Live Results Page
 * Real-time election results with Socket.io
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { io } from 'socket.io-client';
import { CheckCircle2, Users, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { buildWebSocketUrl, buildUrl } from '../config/api';

const LiveResults = () => {
  const { electionId } = useParams();
  const auth = useAuth();
  const token = auth?.token || null;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a'];

  useEffect(() => {
    // Load initial results
    loadInitialResults();

    // Connect to Socket.io
    const socket = io(buildWebSocketUrl('votes'), {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Subscribe to election updates
      socket.emit('subscribe', { electionId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('initial-results', (data) => {
      console.log('Initial results received:', data);
      setResults(data.results);
      setLoading(false);
    });

    socket.on('vote-update', (update) => {
      console.log('Vote update received:', update);
      handleVoteUpdate(update);
    });

    socket.on('election-status', (status) => {
      console.log('Election status update:', status);
      if (results) {
        setResults(prev => ({
          ...prev,
          election: {
            ...prev.election,
            status: status.status,
            totalVotesCast: status.totalVotesCast,
            turnoutPercentage: status.turnoutPercentage
          }
        }));
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unsubscribe', { electionId });
        socketRef.current.disconnect();
      }
    };
  }, [electionId]);

  const loadInitialResults = async () => {
    try {
      const response = await fetch(
        buildUrl(`/vote/results/${electionId}`)
      );
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Failed to load results:', error);
      toast.error('Failed to load election results');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteUpdate = (update) => {
    setResults(prev => {
      if (!prev) return prev;

      const newPositions = prev.positions.map(positionData => {
        if (positionData.position._id === update.positionId) {
          const newCandidates = positionData.candidates.map(candidate => {
            if (candidate._id === update.candidateId) {
              return {
                ...candidate,
                votesCount: update.candidateVotes,
                votePercentage: update.candidatePercentage
              };
            }
            // Recalculate percentages for other candidates
            const totalVotes = update.totalVotesPosition;
            if (totalVotes > 0) {
              return {
                ...candidate,
                votePercentage: parseFloat((candidate.votesCount / totalVotes * 100).toFixed(2))
              };
            }
            return candidate;
          });

          return {
            ...positionData,
            position: {
              ...positionData.position,
              totalVotes: update.totalVotesPosition
            },
            candidates: newCandidates.sort((a, b) => b.votesCount - a.votesCount)
          };
        }
        return positionData;
      });

      return {
        ...prev,
        positions: newPositions
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading election results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">No results available</p>
        </div>
      </div>
    );
  }

  const { election, positions } = results;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
                {election.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  election.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {connected && election.status === 'active' && (
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  )}
                  {election.status === 'active' ? 'Live' : election.status}
                </span>
                <span className="text-sm text-neutral-600">
                  <Users size={16} className="inline mr-1" />
                  {election.totalVotesCast} votes cast
                </span>
                <span className="text-sm text-neutral-600">
                  <TrendingUp size={16} className="inline mr-1" />
                  {election.turnoutPercentage}% turnout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results by Position */}
        <div className="space-y-8">
          {positions.map((positionData, index) => {
            const { position, candidates } = positionData;
            const chartData = candidates.map((c, i) => ({
              name: c.name,
              votes: c.votesCount,
              percentage: c.votePercentage,
              color: COLORS[i % COLORS.length]
            }));

            const leader = candidates[0];

            return (
              <div key={position._id} className="card p-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-4">
                  {position.name}
                </h2>
                {position.description && (
                  <p className="text-neutral-600 mb-6">{position.description}</p>
                )}

                {/* Leader Badge */}
                {leader && leader.votesCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="font-bold text-charcoal">Current Leader</p>
                        <p className="text-neutral-600">{leader.name} - {leader.votesCount} votes ({leader.votePercentage}%)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Bar Chart */}
                  <div>
                    <h3 className="font-heading font-bold text-charcoal mb-4">Vote Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="votes" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div>
                    <h3 className="font-heading font-bold text-charcoal mb-4">Percentage Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Candidate List */}
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-charcoal mb-4">Candidates</h3>
                  {candidates.map((candidate, idx) => (
                    <div
                      key={candidate._id}
                      className="border border-neutral-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-white font-bold text-lg">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-heading font-bold text-charcoal">
                              {candidate.name}
                            </h4>
                            {candidate.bio && (
                              <p className="text-sm text-neutral-600">{candidate.bio}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {candidate.votesCount}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {candidate.votePercentage}%
                          </p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3 w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${candidate.votePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statistics */}
                <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-neutral-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">{position.totalVotes}</p>
                    <p className="text-sm text-neutral-600">Total Votes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">{candidates.length}</p>
                    <p className="text-sm text-neutral-600">Candidates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-charcoal">
                      {leader ? leader.votePercentage : 0}%
                    </p>
                    <p className="text-sm text-neutral-600">Leader's Share</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Update */}
        <div className="mt-6 text-center text-sm text-neutral-500">
          <Clock size={16} className="inline mr-1" />
          Last updated: {new Date().toLocaleTimeString()}
          {connected && (
            <span className="ml-2 text-green-600">● Live</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveResults;


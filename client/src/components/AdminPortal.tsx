'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkCounters, initializeFirestoreCounters } from '@/lib/firestoreSetup';
import TeamForm from './TeamForm';
import CardForm from './CardForm';

interface Team {
  id: string;
  teamName: string;
  score: number;
}

interface Card {
  id: string;
  name: string;
  question: string;
  options: string[];
  correctAnswer: number;
  image: string;
  mindFile: string;
  modelUrl: string;
  isCaught: boolean;
  caughtByTeam: string;
}

interface AdminPortalProps {
  onClose: () => void;
}

export default function AdminPortal({ onClose }: AdminPortalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'teams' | 'cards'>('teams');
  const [initializingCounters, setInitializingCounters] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  
  // Team management state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Card management state
  const [cards, setCards] = useState<Card[]>([]);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);

  // Check counters when logged in
  useEffect(() => {
    if (isLoggedIn) {
      checkFirestoreSetup();
    }
  }, [isLoggedIn]);

  // Fetch data when view changes
  useEffect(() => {
    if (!isLoggedIn || setupRequired) return;

    if (currentView === 'teams') {
      fetchTeams();
    } else if (currentView === 'cards') {
      fetchCards();
    }
  }, [isLoggedIn, currentView, setupRequired]);

  const checkFirestoreSetup = async () => {
    const counterStatus = await checkCounters();
    const needsSetup = !counterStatus.teams || !counterStatus.cards;
    setSetupRequired(needsSetup);
  };

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Team[];
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const cardsCollection = collection(db, 'cards');
      const cardsSnapshot = await getDocs(cardsCollection);
      const cardsData = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Card[];
      setCards(cardsData);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === process.env.NEXT_PUBLIC_ADMIN_USER && 
        password === process.env.NEXT_PUBLIC_ADMIN_PASS) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (deleteConfirm !== teamId) {
      setDeleteConfirm(teamId);
      return;
    }

    try {
      await deleteDoc(doc(db, 'teams', teamId));
      setTeams(teams.filter(team => team.id !== teamId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (deleteConfirm !== cardId) {
      setDeleteConfirm(cardId);
      return;
    }

    try {
      await deleteDoc(doc(db, 'cards', cardId));
      setCards(cards.filter(card => card.id !== cardId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white">Admin Portal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           text-white placeholder-gray-400"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           text-white placeholder-gray-400"
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium
                         rounded-md transition-colors focus:outline-none focus:ring-2
                         focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                         shadow-lg shadow-indigo-500/20"
              >
                Login
              </button>
            </form>
          ) : (
            <div className="text-gray-200">
              {setupRequired ? (
                <div className="text-center py-8">
                  <h3 className="text-xl font-semibold text-white mb-4">First-Time Setup Required</h3>
                  <p className="text-gray-400 mb-6">
                    The admin portal needs to initialize some required documents in Firestore.
                  </p>
                  <button
                    onClick={async () => {
                      setInitializingCounters(true);
                      try {
                        await initializeFirestoreCounters();
                        setSetupRequired(false);
                      } catch (err) {
                        console.error('Error initializing counters:', err);
                        setError('Failed to initialize counters. Please try again.');
                      } finally {
                        setInitializingCounters(false);
                      }
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 
                             focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
                    disabled={initializingCounters}
                  >
                    {initializingCounters ? 'Initializing...' : 'Initialize Admin Portal'}
                  </button>
                  {error && (
                    <p className="mt-4 text-red-400 text-sm">{error}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setCurrentView('teams')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        currentView === 'teams'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Manage Teams
                    </button>
                    <button
                      onClick={() => setCurrentView('cards')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        currentView === 'cards'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Manage Cards
                    </button>
                  </div>

                  {currentView === 'teams' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">Teams</h3>
                        <button
                          onClick={() => {
                            setTeamToEdit(null);
                            setIsTeamFormOpen(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md 
                                   transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          Add New Team
                        </button>
                      </div>

                      {isLoading ? (
                        <p className="text-center py-4 text-gray-400">Loading teams...</p>
                      ) : teams.length === 0 ? (
                        <p className="text-center py-4 text-gray-400">No teams found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Team Name
                                </th>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Score
                                </th>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {teams.map((team) => (
                                <tr key={team.id} className="bg-gray-800 hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                    {team.teamName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                    {team.score}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap space-x-4">
                                    <button
                                      onClick={() => {
                                        setTeamToEdit(team);
                                        setIsTeamFormOpen(true);
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTeam(team.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      {deleteConfirm === team.id ? 'Confirm Delete?' : 'Delete'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <TeamForm
                        isOpen={isTeamFormOpen}
                        onClose={() => {
                          setIsTeamFormOpen(false);
                          setTeamToEdit(null);
                          fetchTeams();
                        }}
                        teamToEdit={teamToEdit || undefined}
                      />
                    </div>
                  )}

                  {currentView === 'cards' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">Cards</h3>
                        <button
                          onClick={() => {
                            setCardToEdit(null);
                            setIsCardFormOpen(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md 
                                   transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          Add New Card
                        </button>
                      </div>

                      {isLoading ? (
                        <p className="text-center py-4 text-gray-400">Loading cards...</p>
                      ) : cards.length === 0 ? (
                        <p className="text-center py-4 text-gray-400">No cards found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Question
                                </th>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                              {cards.map((card) => (
                                <tr key={card.id} className="bg-gray-800 hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                    {card.name}
                                  </td>
                                  <td className="px-6 py-4 text-gray-300">
                                    <div className="line-clamp-2">{card.question}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      card.isCaught
                                        ? 'bg-green-900/50 text-green-400'
                                        : 'bg-yellow-900/50 text-yellow-400'
                                    }`}>
                                      {card.isCaught ? 'Caught' : 'Available'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap space-x-4">
                                    <button
                                      onClick={() => {
                                        setCardToEdit(card);
                                        setIsCardFormOpen(true);
                                      }}
                                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCard(card.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      {deleteConfirm === card.id ? 'Confirm Delete?' : 'Delete'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <CardForm
                        isOpen={isCardFormOpen}
                        onClose={() => {
                          setIsCardFormOpen(false);
                          setCardToEdit(null);
                          fetchCards();
                        }}
                        cardToEdit={cardToEdit || undefined}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
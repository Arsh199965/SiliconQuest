'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Pokeball from '@/components/Pokeball';
import ARCamera from '@/components/ARCamera';

// Mock data for teams
const mockTeams = [
  { id: 1, name: 'Dragon Slayers', charactersCaught: 45 },
  { id: 2, name: 'Shadow Hunters', charactersCaught: 42 },
  { id: 3, name: 'Storm Chasers', charactersCaught: 38 },
  { id: 4, name: 'Mystic Warriors', charactersCaught: 35 },
  { id: 5, name: 'Phoenix Rising', charactersCaught: 32 },
  { id: 6, name: 'Thunder Strikers', charactersCaught: 30 },
  { id: 7, name: 'Void Walkers', charactersCaught: 28 },
  { id: 8, name: 'Star Seekers', charactersCaught: 25 },
  { id: 9, name: 'Moon Guardians', charactersCaught: 22 },
  { id: 10, name: 'Solar Knights', charactersCaught: 20 },
  { id: 11, name: 'Frost Legends', charactersCaught: 18 },
  { id: 12, name: 'Crimson Blades', charactersCaught: 15 },
];

// Mock characters caught by selected team
interface CaughtCharacter {
  id: number;
  name: string;
  image: string;
  tier: 'Common' | 'Rare' | 'Legendary';
}

const initialMockCharacters: CaughtCharacter[] = [
  { id: 1, name: 'Naruto', image: '🦊', tier: 'Legendary' },
  { id: 3, name: 'Goku', image: '💪', tier: 'Legendary' },
];

export default function Home() {
  const [charactersLeft] = useState(12);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [charactersCaught, setCharactersCaught] = useState<CaughtCharacter[]>(initialMockCharacters);
  const [isARActive, setIsARActive] = useState(false);
  const [isPokeballExploding, setIsPokeballExploding] = useState(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const selectedTeamRef = useRef<HTMLDivElement>(null);

  // Load selected team from localStorage on mount
  useEffect(() => {
    const storedTeamId = localStorage.getItem('selectedTeamId');
    if (storedTeamId) {
      setSelectedTeamId(parseInt(storedTeamId, 10));
    }
  }, []);

  // Scroll to selected team in leaderboard
  useEffect(() => {
    if (selectedTeamId && selectedTeamRef.current && leaderboardRef.current) {
      setTimeout(() => {
        selectedTeamRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [selectedTeamId]);

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeamId(teamId);
    localStorage.setItem('selectedTeamId', teamId.toString());
    
    // Keep the initial characters when team is selected
    const team = mockTeams.find(t => t.id === teamId);
    if (team) {
      setCharactersCaught(initialMockCharacters);
    }
  };

  const handlePokeballClick = () => {
    if (!selectedTeam) return;
    
    setIsPokeballExploding(true);
    
    // Wait for explosion animation to complete, then show AR camera
    setTimeout(() => {
      setIsARActive(true);
      setIsPokeballExploding(false);
    }, 600);
  };

  const handleARClose = () => {
    setIsARActive(false);
  };

  const handleCharacterCollected = (character: CaughtCharacter) => {
    // Add the new character to the collection if not already present
    setCharactersCaught(prev => {
      const exists = prev.find(c => c.id === character.id);
      if (exists) return prev;
      return [...prev, character];
    });
  };

  const selectedTeam = mockTeams.find(t => t.id === selectedTeamId);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(30, 30, 46, 0.3);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <Header />

          {/* Main Game Card */}
          <main className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 shadow-2xl shadow-purple-500/20">
            {/* Title */}
            <h1 className="text-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 tracking-tight">
              {selectedTeam ? 'Hunt is On!!' : "Let's start hunting"}
            </h1>

            {/* Pokeball Icon */}
            <Pokeball onClick={handlePokeballClick} isExploding={isPokeballExploding} />

            {/* Characters Left */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-xl p-3 mb-6 text-center">
              <p className="text-purple-300 text-sm font-medium">
                Show character left to hunt
              </p>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mt-1">
                {charactersLeft}
              </p>
            </div>

            {/* Select Your Team - Only shown when no team is selected */}
            {!selectedTeam && (
              <div className="mb-6">
                <h2 className="text-purple-300 text-center font-semibold mb-4 tracking-wide">
                  Select Your Team
                </h2>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-2xl p-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                    {mockTeams.map((team) => (
                      <div
                        key={team.id}
                        onClick={() => handleTeamSelect(team.id)}
                        className="h-12 rounded-xl border-2 border-slate-700 bg-slate-800/30 hover:border-purple-500/50 hover:bg-slate-700/30 transition-all duration-300 cursor-pointer flex items-center px-4 group"
                      >
                        <span className="text-slate-300 text-sm font-medium group-hover:text-purple-300 transition-colors">
                          {team.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Characters Caught by Selected Team - Only shown when team is selected */}
            {selectedTeam && (
              <div className="mb-6">
                <h2 className="text-purple-300 text-center font-semibold mb-3 tracking-wide text-sm">
                  Characters Caught by {'{' + selectedTeam.name + '}'}
                </h2>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-purple-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {/* Left Arrow */}
                    <button 
                      className="flex-shrink-0 w-8 h-16 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
                      onClick={() => {
                        const container = document.getElementById('characters-container');
                        if (container) container.scrollLeft -= 120;
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Character Cards */}
                    <div id="characters-container" className="flex gap-3 overflow-x-auto flex-1 scrollbar-hide scroll-smooth">
                      {charactersCaught.map((character) => (
                        <div
                          key={character.id}
                          className="flex-shrink-0 w-24 h-32 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 border-purple-500/40 rounded-xl flex flex-col items-center justify-center hover:border-purple-400 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="text-4xl mb-2">{character.image}</div>
                          <div className="text-xs text-purple-200 font-medium text-center px-2">{character.name}</div>
                        </div>
                      ))}
                    </div>

                    {/* Right Arrow */}
                    <button 
                      className="flex-shrink-0 w-8 h-16 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors"
                      onClick={() => {
                        const container = document.getElementById('characters-container');
                        if (container) container.scrollLeft += 120;
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div>
              <h2 className="text-purple-300 text-center font-semibold mb-4 tracking-wide">
                Leaderboard
              </h2>
              <div 
              ref={leaderboardRef}
              className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin"
            >
              {mockTeams.map((team, index) => (
                <div
                  key={team.id}
                  ref={team.id === selectedTeamId ? selectedTeamRef : null}
                  className={`bg-gradient-to-r from-slate-800/50 to-slate-700/50 border rounded-xl p-4 transition-all duration-300 ${
                    team.id === selectedTeamId
                      ? 'border-purple-500 shadow-lg shadow-purple-500/30 scale-[1.02]'
                      : 'border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-slate-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-slate-900' :
                      'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`font-semibold text-sm truncate ${
                          team.id === selectedTeamId ? 'text-purple-300' : 'text-slate-300'
                        }`}>
                          {team.name}
                        </h3>
                        <span className="text-amber-400 font-bold text-sm ml-2 flex-shrink-0">
                          {team.charactersCaught}
                        </span>
                      </div>
                      {team.id === selectedTeamId && (
                        <div className="text-xs text-purple-400 font-medium">
                          Your Team
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>

    {/* AR Camera Overlay */}
    {isARActive && selectedTeam && (
      <ARCamera 
        teamName={selectedTeam.name} 
        onClose={handleARClose} 
        onCharacterCollected={handleCharacterCollected}
      />
    )}
    </>
  );
}
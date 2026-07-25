import React, { forwardRef } from 'react';
import { User, MatchRecord } from '@/store/useStore';
import { MapPin, Trophy as TrophyIcon } from 'lucide-react';

interface StoryExportTemplateProps {
  match: MatchRecord;
  users: User[];
}

function getInitials(name: string) {
  return name.split(" ").map(n => n.charAt(0)).join("").toUpperCase().substring(0, 2);
}

export const StoryExportTemplate = forwardRef<HTMLDivElement, StoryExportTemplateProps>(({ match, users }, ref) => {
  const t1Users = match.team1.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
  const t2Users = match.team2.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];

  const renderTeam = (teamUsers: User[]) => {
    if (teamUsers.length === 1) {
      const u = teamUsers[0];
      return (
        <div className="flex flex-col items-center flex-1">
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt={u.name} className="w-[240px] h-[240px] rounded-full shadow-lg bg-gray-200 object-cover" crossOrigin="anonymous" />
          ) : (
            <div className="w-[240px] h-[240px] rounded-full shadow-lg bg-gray-200 flex items-center justify-center text-[80px] font-extrabold text-gray-500">
              {getInitials(u.name)}
            </div>
          )}
          <span className="text-[45px] font-bold text-gray-700 mt-6 text-center">{u.name.split(' ')[0]}</span>
          <p className="text-[35px] font-semibold text-gray-500 mt-2">Elo: <span className="text-gray-800">{(match.matchFormat === 'doubles' ? u.doublesRating : u.singlesRating)?.toFixed(3) || '3.000'}</span></p>
        </div>
      );
    } else {
      // Doubles
      return (
        <div className="flex flex-col items-center flex-1">
          <div className="flex justify-center">
            {teamUsers.map((u, i) => (
              <div key={u.id} className={`${i === 0 ? '-mr-12' : ''} relative`} style={{ zIndex: 10 - i }}>
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="w-[200px] h-[200px] rounded-full shadow-lg bg-gray-200 object-cover border-[6px] border-white" crossOrigin="anonymous" />
                ) : (
                  <div className="w-[200px] h-[200px] rounded-full shadow-lg bg-gray-200 flex items-center justify-center text-[60px] font-extrabold text-gray-500 border-[6px] border-white">
                    {getInitials(u.name)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center mt-6 gap-3">
            {teamUsers.map(u => (
              <div key={u.id} className="flex flex-col items-center">
                <span className="text-[35px] font-bold text-gray-700 text-center leading-none">{u.name.split(' ')[0]}</span>
                <p className="text-[28px] font-semibold text-gray-500 mt-1 leading-none">Elo: <span className="text-gray-800">{(match.matchFormat === 'doubles' ? u.doublesRating : u.singlesRating)?.toFixed(3) || '3.000'}</span></p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div ref={ref} className="fixed left-[-9999px] top-0">
      <div 
        style={{ width: '1080px', height: '1920px' }} 
        className="flex flex-col items-center justify-center relative bg-gradient-to-br from-[#e6ffed] via-[#f4fbff] to-[#e0f2fe] font-sans"
      >
        <div className="w-[900px] flex justify-between items-end mb-16">
          {renderTeam(t1Users)}
          <h2 className="text-[100px] font-black text-gray-600 pb-20 mx-8">VS</h2>
          {renderTeam(t2Users)}
        </div>

        <div className="bg-white w-[900px] rounded-[60px] flex flex-col items-center justify-start pt-20 pb-24 px-12 z-10 relative">
          <div className="flex w-full justify-between items-center px-12 mt-4 mb-24">
            <span className="text-[220px] font-black text-slate-800 leading-none tracking-tighter">{match.team1Score}</span>
            <span className="text-[220px] font-black text-slate-800 leading-none tracking-tighter">-</span>
            <span className="text-[220px] font-black text-slate-800 leading-none tracking-tighter">{match.team2Score}</span>
          </div>

          {match.status === 'approved' && match.eloChange && (
            <div className="flex w-full justify-between px-20 mb-16">
              <div className={`font-bold text-[35px] px-8 py-3 rounded-2xl ${match.team1Score > match.team2Score ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                {match.team1Score > match.team2Score ? '+' : ''}{(match.eloChange.team1Change).toFixed(3)}
              </div>
              <div className={`font-bold text-[35px] px-8 py-3 rounded-2xl ${match.team2Score > match.team1Score ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                {match.team2Score > match.team1Score ? '+' : ''}{(match.eloChange.team2Change).toFixed(3)}
              </div>
            </div>
          )}

          {(match.location || match.eventName) && (
            <div className="flex flex-col items-center gap-6">
              {match.location && (
                <div className="flex items-center justify-center gap-3 bg-blue-50 text-blue-500 font-bold text-[35px] px-12 py-5 rounded-3xl uppercase tracking-wider">
                  <MapPin size={40} /> {match.location}
                </div>
              )}
              {match.eventName && (
                <div className="flex items-center justify-center gap-3 bg-yellow-50 text-yellow-600 font-bold text-[35px] px-12 py-5 rounded-3xl uppercase tracking-wider">
                  <TrophyIcon size={40} /> {match.eventName}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-[200px] text-[60px] font-black text-gray-700 tracking-tight">
          trpickle.com
        </div>
      </div>
    </div>
  );
});

StoryExportTemplate.displayName = 'StoryExportTemplate';

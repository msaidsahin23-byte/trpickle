"use client";
import { X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";

export default function MatchScoreModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [opponentId, setOpponentId] = useState("");
  const [myScore, setMyScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting match score:", { opponentId, myScore, opponentScore });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pb-dark/40 backdrop-blur-sm p-4">
      <div className="bg-white  rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden transform transition-all border border-gray-100  ">
        <div className="flex justify-between items-center p-6 border-b border-gray-100  bg-gray-50  ">
          <h2 className="text-xl font-bold text-pb-dark  ">Maç Skoru Gir</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 :bg-gray-700 text-gray-500 hover:text-pb-dark  :text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 text-pb-dark  ">
          <div>
            <label className="block font-semibold mb-2 text-gray-700 ">Rakip Seç</label>
            <select 
              value={opponentId}
              onChange={(e) => setOpponentId(e.target.value)}
              required
              className="w-full border border-gray-200  rounded-2xl p-4 bg-white  font-medium outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all cursor-pointer"
            >
              <option value="">Rakip seçiniz...</option>
              {users.filter(u => u.id !== currentUser?.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-pb-dark  ">Benim Skorum</label>
              <input 
                type="number" 
                min="0"
                required
                value={myScore}
                onChange={(e) => setMyScore(e.target.value)}
                className="w-full border border-gray-200  rounded-2xl p-4 bg-white  font-bold text-2xl text-center outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2 text-gray-700 ">Rakip Skor</label>
              <input 
                type="number" 
                min="0"
                required
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                className="w-full border border-gray-200  rounded-2xl p-4 bg-white  font-bold text-2xl text-center outline-none focus:ring-1 focus:ring-pb-blue/30 focus:border-pb-blue/50 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="mt-4 w-full bg-pb-green text-pb-dark  font-bold py-4 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 uppercase"
          >
            Skoru Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}

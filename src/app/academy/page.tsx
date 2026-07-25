"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { academyLessons, AcademyLesson } from "@/data/academyLessons";
import { BookOpen, CheckCircle, MonitorPlay, HelpCircle, Award, Sparkles, Clock, Check, AlertCircle, ChevronRight, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AcademyPage() {
  const [mounted, setMounted] = useState(false);
  const currentUser = useStore((state) => state.currentUser);
  const toggleVideoCompletion = useStore((state) => state.toggleVideoCompletion);
  const unlockAchievement = useStore((state) => state.unlockAchievement);

  const [activeLesson, setActiveLesson] = useState<AcademyLesson>(academyLessons[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [shuffledQuiz, setShuffledQuiz] = useState<{
    options: string[];
    correctIndex: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset & shuffle quiz options whenever activeLesson changes or mounts
  useEffect(() => {
    setSelectedQuizOption(null);
    setQuizSubmitted(false);

    if (activeLesson.quiz) {
      const originalOptions = activeLesson.quiz.options;
      const originalCorrectIndex = activeLesson.quiz.correctIndex;
      const correctText = originalOptions[originalCorrectIndex];

      // Shuffle options randomly
      const shuffled = [...originalOptions].sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffled.indexOf(correctText);

      setShuffledQuiz({
        options: shuffled,
        correctIndex: newCorrectIndex,
      });
    } else {
      setShuffledQuiz(null);
    }
  }, [activeLesson]);

  if (!mounted) return null;

  const completedIds = currentUser?.completedVideoIds || [];
  const progressPercentage = Math.round((completedIds.length / academyLessons.length) * 100);

  const filteredLessons = selectedCategory === "Tümü"
    ? academyLessons
    : academyLessons.filter(l => l.category === selectedCategory);

  const isCompleted = completedIds.includes(activeLesson.id);

  const handleToggleCompletion = (lessonId: string) => {
    if (!currentUser) return;
    toggleVideoCompletion(lessonId);
  };

  const getLevelBadgeColor = (level?: string) => {
    if (level === "Başlangıç") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    if (level === "Orta") return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
    return "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-pb-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pb-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pb-green/20 text-pb-green text-xs font-black uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>TRPickle Masterclass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pickleball Akademi & Taktik Rehberi
          </h1>
          <p className="text-gray-300 font-medium mt-2 text-sm sm:text-base">
            Başlangıçtan turnuva şampiyonluğuna kadar uzanan interaktif dersler, saha geometri grafikleri ve bilgini test eden mini testler.
          </p>
        </div>

        {currentUser && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col items-center sm:items-start min-w-[220px] shrink-0">
            <div className="flex items-center justify-between w-full text-xs font-extrabold uppercase tracking-wider text-gray-300 mb-1">
              <span>Akademi Başarın</span>
              <span className="text-pb-green font-black">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden my-2">
              <motion.div
                className="bg-pb-green h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-gray-300 font-medium">
              {completedIds.length} / {academyLessons.length} Ders tamamlandı
            </span>
          </div>
        )}
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        {["Tümü", "Temeller", "Taktikler", "İleri Seviye"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? "bg-pb-dark dark:bg-pb-green text-white dark:text-pb-dark border-pb-dark dark:border-pb-green shadow-md scale-105"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Lesson Reader */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col">
            <div className="w-full h-64 sm:h-96 relative">
              <img src={activeLesson.imageUrl} alt={activeLesson.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-black text-white bg-pb-blue px-3 py-1 rounded-full uppercase tracking-widest">
                      {activeLesson.category}
                    </span>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border ${getLevelBadgeColor(activeLesson.level)} bg-white/90 dark:bg-slate-900/90`}>
                      {activeLesson.level}
                    </span>
                    <span className="text-xs font-bold text-gray-200 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeLesson.durationMinutes} dk okuma
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">{activeLesson.title}</h2>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-10">
              <div 
                className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 prose-headings:text-pb-dark dark:prose-headings:text-white prose-a:text-pb-blue prose-strong:text-pb-dark dark:prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: activeLesson.content }}
              />

              {/* Interactive Quiz Box */}
              {activeLesson.quiz && shuffledQuiz && (
                <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gray-50 dark:bg-slate-900/80 border-2 border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-pb-blue font-black uppercase tracking-wider text-xs mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>İnteraktif Bilgi Testi</span>
                  </div>
                  <h4 className="text-lg font-black text-pb-dark dark:text-white mb-4">
                    {activeLesson.quiz.question}
                  </h4>

                  <div className="flex flex-col gap-2.5">
                    {shuffledQuiz.options.map((option, idx) => {
                      const isCorrect = idx === shuffledQuiz.correctIndex;
                      const isSelected = selectedQuizOption === idx;

                      let btnStyle = "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:border-pb-blue";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-red-500/15 border-red-500 text-red-700 dark:text-red-300";
                        }
                      } else if (isSelected) {
                        btnStyle = "border-pb-blue bg-blue-50/50 dark:bg-blue-900/20";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted && isCorrect}
                          onClick={() => {
                            setSelectedQuizOption(idx);
                            setQuizSubmitted(true);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <span className="text-sm font-semibold">{option}</span>
                          {quizSubmitted && isCorrect && (
                            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && selectedQuizOption !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-2.5 ${
                        selectedQuizOption === shuffledQuiz.correctIndex
                          ? "bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <strong>{selectedQuizOption === shuffledQuiz.correctIndex ? "🎉 Harika! Doğru Cevap:" : "💡 İpucu & Açıklama:"}</strong>{" "}
                        {activeLesson.quiz.explanation}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {currentUser && (
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dersi tamamladığınızda ilerlemeniz profilinize kaydedilir.
                  </div>
                  <button
                    onClick={() => handleToggleCompletion(activeLesson.id)}
                    className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black transition-all shadow-md text-sm sm:text-base ${
                      isCompleted
                        ? "bg-pb-green text-pb-dark hover:bg-green-400"
                        : "bg-pb-dark dark:bg-white text-white dark:text-pb-dark hover:opacity-90"
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-pb-dark' : 'text-pb-green'}`} />
                    {isCompleted ? "Ders Tamamlandı ✓" : "Dersi Tamamla & Okundu İşaretle"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Playlist / Curriculum */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-[740px]">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-pb-dark dark:text-white">Müfredat Listesi</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {filteredLessons.length} ders gösteriliyor
                </p>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2">
              {filteredLessons.map((lesson, idx) => {
                const isVidCompleted = completedIds.includes(lesson.id);
                const isVidActive = activeLesson.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all ${
                      isVidActive 
                        ? "bg-pb-blue/10 border-2 border-pb-blue shadow-sm" 
                        : "hover:bg-gray-50 dark:hover:bg-slate-700/50 border-2 border-transparent"
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 w-7 h-7 flex items-center justify-center rounded-xl font-bold text-xs ${
                      isVidActive 
                        ? 'bg-pb-blue text-white' 
                        : isVidCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-500'
                    }`}>
                      {isVidCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                          {lesson.category}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          • {lesson.durationMinutes} dk
                        </span>
                      </div>
                      <div className={`font-black text-sm leading-snug ${isVidActive ? 'text-pb-blue' : 'text-pb-dark dark:text-white'}`}>
                        {lesson.title}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {lesson.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

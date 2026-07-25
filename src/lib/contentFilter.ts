// Tam eşleşme aranacak (içinde geçmesi yeterli olmayan, kısa veya başka kelime içinde sık geçenler)
export const EXACT_MATCH_WORDS = [
  "am", "aq", "sg", "sik", "pic", "piç", "o.ç", "o.c"
];

// Kelimenin neresinde geçerse geçsin engellenecek şiddetli kelimeler
export const SUBSTRING_WORDS = [
  "amk", "yarak", "yarrak", "yarra", "yara", "amcık", "amcik", "göt", "meme", 
  "yavşak", "orospu", "fahişe", "kahpe", "pezevenk", "amına", "gavat", "ibne", 
  "puşt", "siktir",
  "fuck", "shit", "bitch", "asshole", "dick", "pussy", "cunt", "slut", "whore",
  "bastard", "nigger", "nigga", "faggot", "cock", "penis", "vajina"
];

export const checkTextSafety = (text: string): boolean => {
  if (!text) return true;
  
  const normalizedText = text.toLowerCase().replace(/[\s.,!?;:()_]/g, '');
  const words = text.toLowerCase().replace(/[.,!?;:()]/g, '').split(/\s+/);

  // 1. Kısa/Riskli kelimeler için tam kelime eşleşmesi
  for (const word of words) {
    if (EXACT_MATCH_WORDS.includes(word)) {
      return false;
    }
  }

  // 2. Şiddetli kelimeler için substring eşleşmesi (bütünleşik string üzerinde)
  for (const badWord of SUBSTRING_WORDS) {
    if (normalizedText.includes(badWord)) {
      return false;
    }
  }

  return true;
};

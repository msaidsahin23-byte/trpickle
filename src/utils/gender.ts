import { User } from '@/store/useStore';

const FEMALE_NAMES = [
  'zeynep', 'ayşe', 'ayse', 'elif', 'deniz', 'selin', 'fatma', 'merve',
  'gamze', 'gizem', 'ece', 'büşra', 'busra', 'cagla', 'çağla', 'ceren',
  'aslı', 'asli', 'seda', 'esra', 'melis', 'nazlı', 'nazli', 'ebru',
  'sinem', 'damla', 'irem', 'beyza', 'kübra', 'kubra'
];

const FEMALE_IDS: (number | string)[] = [2, 6, 7, 10, 11];

export const resolveUserGender = (user: { id?: number | string; name?: string; gender?: string }): 'male' | 'female' => {
  if (user.gender === 'male' || user.gender === 'female') {
    return user.gender;
  }
  if (user.id && FEMALE_IDS.includes(user.id)) {
    return 'female';
  }
  if (user.name) {
    const lower = user.name.toLowerCase();
    const firstWord = lower.split(' ')[0];
    if (FEMALE_NAMES.some(fn => lower.includes(fn) || firstWord === fn)) {
      return 'female';
    }
  }
  return 'male';
};

import { useSyncExternalStore } from 'react'

export type Lang = 'en' | 'bn'

const BN: Record<string, string> = {
  Dashboard: 'ড্যাশবোর্ড',
  'Semesters & Courses': 'সেমিস্টার ও কোর্স',
  'Target CGPA': 'টার্গেট সিজিপিএ',
  'Planner & Insights': 'পরিকল্পনা ও বিশ্লেষণ',
  Skills: 'দক্ষতা',
  Projects: 'প্রজেক্ট',
  Applications: 'আবেদন',
  Scholarships: 'বৃত্তি',
  'Test Scores': 'পরীক্ষার স্কোর',
  Requirements: 'গ্র্যাজুয়েশন শর্ত',
  Documents: 'ডকুমেন্ট',
  Settings: 'সেটিংস',
  'Export PDF': 'পিডিএফ ডাউনলোড',
  'Dark mode': 'ডার্ক মোড',
  'Light mode': 'লাইট মোড',
  'Log out': 'লগ আউট',
  'Log in': 'লগ ইন',
  'Create account': 'অ্যাকাউন্ট তৈরি করুন',
  Username: 'ইউজারনেম',
  Email: 'ইমেইল',
  'Password (8+ characters)': 'পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)',
  'New here? Create an account': 'নতুন? অ্যাকাউন্ট তৈরি করুন',
  'Have an account? Log in': 'অ্যাকাউন্ট আছে? লগ ইন করুন',
  'Try the demo (labelled sample data)': 'ডেমো চালান (নমুনা তথ্য)',
  'Smart CGPA and career planner': 'স্মার্ট সিজিপিএ ও ক্যারিয়ার প্ল্যানার',
  'Current CGPA': 'বর্তমান সিজিপিএ',
  'Credits earned': 'অর্জিত ক্রেডিট',
  'Credits remaining': 'বাকি ক্রেডিট',
  'CGPA trend': 'সিজিপিএ ট্রেন্ড',
  Highlights: 'মূল তথ্য',
  'Semester results': 'সেমিস্টার ফলাফল',
  'How this was calculated': 'কীভাবে হিসাব করা হয়েছে',
}

const listeners = new Set<() => void>()

export const getLang = (): Lang => (localStorage.getItem('lang') === 'bn' ? 'bn' : 'en')

export function setLang(lang: Lang) {
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

document.documentElement.lang = getLang()

/** t('English text') returns the Bangla text when Bangla is on and a translation exists, else the English. */
export function useT() {
  const lang = useSyncExternalStore(subscribe, getLang)
  return { lang, t: (s: string) => (lang === 'bn' ? (BN[s] ?? s) : s) }
}

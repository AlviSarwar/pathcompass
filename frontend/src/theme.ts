export const isDark = () => localStorage.getItem('theme') === 'dark'

export function setDark(on: boolean) {
  document.documentElement.classList.toggle('dark', on)
  localStorage.setItem('theme', on ? 'dark' : 'light')
}

document.documentElement.classList.toggle('dark', isDark())

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const pad = (num: number) => num.toString().padStart(2, "0")
  return `${pad(minutes)}:${pad(seconds)}`
}

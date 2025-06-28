import softwareDevelopmentQuotes from "../data/software-developer.json"

export interface Quote {
  author: string
  type: string
  quote: string
}

export const getRandomQuote = (): Quote => {
  const randomIndex = Math.floor(
    Math.random() * softwareDevelopmentQuotes.length
  )
  const raw = softwareDevelopmentQuotes[randomIndex]
  return {
    author: (raw as any).author ?? "Unknown",
    quote: raw.quote,
    type: Array.isArray(raw.type) ? raw.type.join(", ") : raw.type ?? "",
  }
}

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const pad = (num: number) => num.toString().padStart(2, "0")
  return `${pad(minutes)}:${pad(seconds)}`
}
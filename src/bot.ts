import { sample } from "./math"


export async function queryStartingState (level: number): Promise<number> {
  const sampleSize = 10000
  const startIndex = (level - 1) * sampleSize
  const index = startIndex + Math.floor(Math.random() * sampleSize)
  const advantage = sample([0,1])
  const url = advantage === 0 ? '/startingStates0.bin' : '/startingStates1.bin'
  const byteStart = index * 4
  const response = await fetch(url, {
    headers: { Range: `bytes=${byteStart}-${byteStart + 3}` }
  })
  if (!response.ok) throw new Error(`Failed to fetch starting state: ${response.status}`)
  const buffer = await response.arrayBuffer()
  const view = new DataView(buffer)
  return response.status === 206
    ? view.getInt32(0, true)
    : view.getInt32(byteStart, true)
}
import { mean, range, sample } from "./math"
import { actionSpace, goals, gridVecs } from "./parameters"
import { getOutcome, stateToLocs } from "./state"


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

export async function queryValue (state: number): Promise<number> {
  const response = await fetch('/values.bin', {
    headers: { Range: `bytes=${state}-${state}` }
  })
  const bytes = new Uint8Array(await response.arrayBuffer())
  return bytes[0]
}

export async function queryAction (state: number): Promise<number> {
  const outcomes = actionSpace.map(action => getOutcome(state, action))
  const actionValues: number[] = []
  for(const i of range(4)) {
    const enemyValue = await queryValue(outcomes[i])
    const netDistance = getNetDistance(outcomes[i])
    actionValues[i] = 200 - enemyValue + 0.0001 * netDistance
  }
  const maxActionValue = Math.max(...actionValues)
  const options = actionSpace.filter(a => actionValues[a] === maxActionValue)
  return sample(options)
}

export function getNetDistance (state: number): number {
  const locs = stateToLocs(state)
  const vecs = locs.map(loc => gridVecs[loc])
  const dist = vecs.map(vec => {
    const goalDistances = goals.map(goalIndex => {
      const goalVec = gridVecs[goalIndex]
      const dx = vec.x - goalVec.x
      const dy = vec.y - goalVec.y
      return Math.sqrt(dx * dx + dy * dy)
    })
    return Math.min(...goalDistances)
  })
  const dist0 = [dist[0], dist[2], dist[4]]
  const dist1 = [dist[1], dist[3], dist[5]]
  return mean(dist0) - mean(dist1)
}
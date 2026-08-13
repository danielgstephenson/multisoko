import { GUI } from "./gui"
import { Input } from "./input"
import { goals, tickInterval, timeScale } from "./parameters"
import { stateToLocs } from "./state"

export class Game {
  font: opentype.Font
  gui: GUI
  input: Input
  state: number
  level = 1
  phase = 'team'
  busy = false
  tick = 0
  round = 0
  playerTeam = -1
  
  constructor(font: opentype.Font, state: number) {
    this.font = font
    this.state = state
    this.gui = new GUI(this)
    this.input = new Input(this)
    setInterval(() => this.update(), tickInterval / timeScale * 1000)
  }

  async update(): Promise<void> {
    if (this.busy) return
    this.busy = true
    this.gui.update()
    this.tick += 1
    this.busy = false
  }

  async act(dir: number) {
    console.log('choice', dir)
  }

  async selectTeam(team: number) {
    if(this.phase !== 'team') return
    this.playerTeam = team
    this.phase = 'choice'
  }

  getScores(): number[] {
    const scores = [0,0]
    stateToLocs(this.state).forEach((unitLoc, i) => {
      const team = (this.round + i) % 2
      goals.forEach(goal => {
        if (goal === unitLoc) scores[team] += 1
      })
    })
    return scores
  }

}
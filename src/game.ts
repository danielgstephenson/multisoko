import { queryAction } from "./bot"
import { GUI } from "./gui"
import { Input } from "./input"
import { goals, tickInterval, timeScale, unitCount } from "./parameters"
import { getOutcome, stateToLocs } from "./state"

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

  update(): void {
    this.gui.update()
    this.tick += 1
    if (this.phase === 'move') {
      const finished = this.gui.units.every(unit => !unit.moving)
      if(finished) {
        this.round += 1
        this.phase = 'choice'
      }
    }
    if (this.phase === 'choice') {
      this.botAct()
    }
  }

  async botAct(): Promise<void> {
    if (this.busy) return
    if (this.phase !== 'choice') return
    const activeTeam = this.round % 2
    if (activeTeam === this.playerTeam) return
    const rank = this.round % unitCount
    const unit = this.gui.units[rank]
    this.busy = true
    unit.dir = await queryAction(this.state)
    this.busy = false
    this.advance()
  }

  playerAct(dir: number) {
    if (this.phase !== 'choice') return
    const activeTeam = this.round % 2
    if (activeTeam !== this.playerTeam) return
    const rank = this.round % unitCount
    const unit = this.gui.units[rank]
    unit.dir = (4 - this.gui.angle + dir) % 4
    this.advance()
  }

  advance(): void {
    const rank = this.round % unitCount
    const unit = this.gui.units[rank]
    this.state = getOutcome(this.state, unit.dir)
    this.gui.units.forEach(unit => unit.move())
    this.phase = 'move'
  }  

  selectTeam(team: number) {
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
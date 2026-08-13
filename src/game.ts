import { queryAction, queryStartingState } from "./bot"
import { GUI } from "./gui"
import { Input } from "./input"
import { clamp, range, sample } from "./math"
import { endInterval, getPosition, goals, maxRound, tickInterval, timeScale, unitCount } from "./parameters"
import { getOutcome, stateToLocs } from "./state"

export class Game {
  font: opentype.Font
  gui: GUI
  input: Input
  state: number
  level = 1
  phase = 'team'
  time = 0
  round = 0
  countdown = 0
  playerTeam = -1
  winner = -1
  
  constructor(font: opentype.Font, state: number) {
    this.font = font
    this.state = state
    this.gui = new GUI(this)
    this.input = new Input(this)
    setInterval(() => this.update(), tickInterval / timeScale * 1000)
  }

  update(): void {
    this.countdown = Math.max(0, this.countdown - tickInterval)
    this.gui.update()
    this.time += tickInterval
    if (this.phase === 'move') {
      const complete = this.gui.units.every(unit => !unit.moving)
      if(complete) this.onMoveComplete()
    } else if (this.phase === 'end') {
      if(this.countdown === 0) {
        void this.onMatchComplete()
      }
    }
  }

  async onMatchComplete(): Promise<void> {
    let levelChange = 0
    const botTeam = 1 - this.playerTeam
    if(this.winner === this.playerTeam) levelChange = 1
    if(this.winner === botTeam) levelChange = -1
    this.level = clamp(0,30,this.level + levelChange)
    this.state = await queryStartingState(this.level)
    this.gui.angle = sample(range(4))
    const locs = stateToLocs(this.state)
    this.gui.units.forEach(unit => {
      const loc = locs[unit.rank]
      const position = getPosition(loc, this.gui.angle)
      unit.group.transform({
        translateX: position.x,
        translateY: position.y
      })
    })
    this.round = 0
    this.winner = -1
    this.playerTeam = -1
    this.phase = 'team'
  }

  onMoveComplete(): void {
    this.round += 1
    const scores = this.getScores()
    const maxScore = Math.max(...scores)
    range(2).forEach(team => {
      if(scores[team] > 1) this.winner = team
    })
    if(maxScore > 1 || this.round > maxRound) {
      this.phase = 'end'
      this.countdown = endInterval
      return
    }
    this.phase = 'choice'
    const activeTeam = this.round % 2
    if (activeTeam == this.playerTeam) return
    void this.botAct()
  }

  async botAct(): Promise<void> {
    if (this.phase !== 'choice') return
    const activeTeam = this.round % 2
    if (activeTeam === this.playerTeam) return
    const rank = this.round % unitCount
    const unit = this.gui.units[rank]
    unit.dir = await queryAction(this.state)
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
    if (this.playerTeam == 0) return
    void this.botAct()
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
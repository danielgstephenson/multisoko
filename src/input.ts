import type { Game } from "./game"

export class Input {
  game: Game

  constructor (game: Game) {
    this.game = game
    window.onkeydown = (event: KeyboardEvent) => this.onkeydown(event)
    window.onmousedown = (event: MouseEvent) => this.onmousedown(event)
    window.ontouchstart = (event: TouchEvent) => this.ontouchstart(event)
    window.oncontextmenu = () => false
  }

  onkeydown (event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'w') {
      this.game.act(1)
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      this.game.act(3)
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
      this.game.act(2)
      this.game.selectTeam(0)
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
      this.game.act(0)
      this.game.selectTeam(1)
    }
  }

  onmousedown (event: MouseEvent): void {
    const focus = this.game.gui.focus
    if (event.button !== 0) return
    const x = event.clientX - focus.x
    const y = focus.y - event.clientY
    let dir = 0
    if (Math.abs(x) > Math.abs(y)) {
      dir = x > 0 ? 0 : 2
    } else {
      dir = y > 0 ? 1 : 3
    }
    this.game.act(dir)
  }

  ontouchstart (event: TouchEvent): void {}
}

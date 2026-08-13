import { GUI } from "./gui"
import { tickInterval, timeScale } from "./parameters"

export class Game {
  font: opentype.Font
  gui: GUI
  level = 1
  phase = 'team'
  tick = 0
  
  constructor(font: opentype.Font) {
    this.font = font
    this.gui = new GUI(this)
    setInterval(() => this.update(), tickInterval / timeScale * 1000)
  }

  update(): void {
    this.tick += 1
    this.gui.update()
  }

}
import * as opentype from 'opentype.js'
import { Game } from './game'
import { queryStartingState } from './bot'
 
const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)
const state = await queryStartingState(5)

void new Game(font, state)

 import * as opentype from 'opentype.js'
import { Game } from './game'
 
const response = await fetch('/Lekton-Bold.ttf')
const buffer = await response.arrayBuffer()
const font = opentype.parse(buffer)

void new Game(font)

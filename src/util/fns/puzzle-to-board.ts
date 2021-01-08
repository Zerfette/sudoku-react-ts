import { mapWithIndex, flatten, map } from 'fp-ts/Array'
import { eqNumber } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import { fold, monoidSum, monoidProduct } from 'fp-ts/Monoid'
import { Board, Cell, Puzzle } from '~core/types'

type ToTuple = (r: number, c: number) => [number, number]
const toTuple: ToTuple = (r, c) => [r, c]

type Times = (x: number) => (y: number) => number
const times: Times = x => y => monoidProduct.concat(x, y)

type Op = (x: number) => number
const op: Op = x => pipe(x, times(1/3), Math.floor) // Math.floor(x / 3)

type GetRegion = (r: number, c: number) => number
const getRegion: GetRegion = (r, c) =>
  pipe(toTuple(r, c), map(op), fold(monoidSum), times(3)) // 3 * op(r) + op(c)

type ToCell = (rowIndex: number) => (colIndex: number, value: number) => Cell
const toCell: ToCell = rowIndex => (colIndex, value) => ({
  value: value,
  row: rowIndex,
  col: colIndex,
  reg: getRegion(rowIndex, colIndex),
  selected: false,
  color: false,
  locked: !eqNumber.equals(value, 0),
  corner: [],
  middle: []
})

type ToCells = (rowIndex: number, row: number[]) => Cell[]
const toCells: ToCells = (rowIndex, row) =>
  pipe(row, mapWithIndex(toCell(rowIndex)))

type PuzzleToBoard = (puzzle: Puzzle) => Board
export const puzzleToBoard: PuzzleToBoard = puzzle =>
  pipe(puzzle, mapWithIndex(toCells), flatten)
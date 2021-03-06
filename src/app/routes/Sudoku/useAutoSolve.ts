/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { filter, head, map } from 'fp-ts/Array'
import { constant, constFalse, flow, pipe, Predicate } from 'fp-ts/function'
import { Eq as nEq } from 'fp-ts/number'
import { fold, getOrElse } from 'fp-ts/Option'
import { Lens } from 'monocle-ts'
import { rowLens, colLens, regLens } from '~core/board/optics'
import { getAvailables, getSelected } from '~core/board/selectors'
import { getAutoSolve } from '~core/toggles/selectors'
import { getNumberSelected } from '~core/numberSelected/selectors'
import { autoSolve } from '~core/actions'
import { Cell } from '~core/types'
import { lengthIs, lensEq } from '~util/fns'

export const useAutoSolve = (): void => {
  const dispatch = useDispatch()
  const selection = useSelector(getSelected)
  const numberSelected = useSelector(getNumberSelected)
  const { cell } = useSelector(getAvailables)
  const shouldAutoSolve = useSelector(getAutoSolve)

  type DispatchAutoSolve = (cell: Cell) => void
  const dispatchAutoSolve: DispatchAutoSolve = ({ ind }) =>
    pipe({ ind, value: numberSelected }, autoSolve, dispatch)

  type IsSingleton = (lens: Lens<Cell, number>, i: number) => boolean
  const isSingleton: IsSingleton = (lens, i) =>
    pipe(
      selection,
      fold(constFalse, flow(filter(lensEq(lens, i)(nEq)), lengthIs(1)))
    )

  const canSolve: Predicate<Cell> = ({ row, col, reg }) =>
    isSingleton(rowLens, row) ||
    isSingleton(colLens, col) ||
    isSingleton(regLens, reg)

  //When number is selected check if any selected can autoSolve
  useEffect(() => {
    if (!!numberSelected && shouldAutoSolve)
      pipe(
        selection,
        fold(() => {}, flow(filter(canSolve), map(dispatchAutoSolve)))
      )
  }, [selection])

  //When there is only one selected try to autoSolve
  useEffect(() => {
    if (shouldAutoSolve) {
      const singlePossible = pipe(cell, lengthIs(1))
      if (singlePossible) {
        pipe(
          selection,
          fold(
            () => {},
            selection => {
              const [{ ind }] = selection
              const value = pipe(head(cell), getOrElse(constant(0)))
              dispatch(autoSolve({ ind, value }))
            }
          )
        )
      }
    }
  }, [cell])
}

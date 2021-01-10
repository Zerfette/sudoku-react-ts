import React, { FC, ReactNode } from 'react'
import { SimpleGrid } from '@chakra-ui/react'
import { mapWithIndex } from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { Cell } from '~core/types'
import { useClickAwayListener } from '~util/hooks'
import { Region } from './region'
import { useModel } from './useModel'

type ToRegion = (i: number, region: Cell[]) => ReactNode
const toRegion: ToRegion = (i, region) => <Region region={region} key={i} />

export const Board: FC = () => {
  const { getRegion, onClickAway } = useModel()
  const ref = useClickAwayListener(onClickAway)

  return (
    <SimpleGrid
      ref={ref}
      columns={3}
      spacing={3}
      m={3}
      width='fit-content'
      height='fit-content'
    >
      {pipe(
        new Array(9).fill(0),
        mapWithIndex(getRegion),
        mapWithIndex(toRegion)
      )}
    </SimpleGrid>
  )
}

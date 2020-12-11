import type { Transpose } from '~/src/game/utils'
import type { DataType } from '@javelin/ecs'
import { createDataType } from '@javelin/ecs'

export { number, string, boolean, array } from '@javelin/ecs'

export const unknown = createDataType({
    name: "unknown",
    create: value => value,
    reset: (c, key, defaultValue) => c[key] = defaultValue
})

/** Create DataType of fixed length array (tuple) at most 2
 * @example
 * tuple()                  // error
 * tuple(number)            // error
 * tuple(number, number)    as DataType<[number, number]>
 */
export const tuple = <
    T1 extends DataType<unknown>,
    T2 extends DataType<unknown>,
    T extends DataType<unknown>[],
    Args extends [T1, T2, ...T]
>(t1: T1, t2: T2, ...t: T): Transpose.ArrayOfDataType<Args> => {
    type DataType = Transpose.ArrayOfDataType<Args>
    type Tuple = ReturnType<DataType['create']>

    const defaultTuple = [t1, t2, ...t].map(t => t.create()) as Tuple
    return createDataType({
        name: "tuple",
        create: (value = defaultTuple) => value,
        reset: (c, key, defaultValue) => c[key] = defaultValue?.slice() ?? defaultTuple,
    })
}

import { number, string, boolean, array } from '@javelin/ecs'

let c: DataType<[number, number]> = tuple(number, number)
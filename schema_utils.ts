import type { DataType } from '@javelin/ecs'
import type { Transpose } from '~/src/game/utils'

import { number, string, boolean, array, tuple, unknown } from './standard_data_types'
const { isArray } = Array
const { entries, fromEntries } = Object

type DataTypeConstructor = Exclude<PrimitiveConstructor, SymbolConstructor | BigIntConstructor>

/** Construct `DataType` from primitive constructor
 * @example as(String)  as DataType<string>
 * @param arg primitive constructor like Number, String, or Boolean
 */
export function as<T extends DataType<unknown> | DataTypeConstructor>
    (arg: T): T extends DataTypeConstructor ? DataType<ReturnType<T>> : T

/** Construct `DataType` from tuple of primitive constructor
 * @example
 * as([Number] as const)            as DataType<number[]>
 * as([Number, number] as const)    as DataType<[number, number]>
 * as([Number, Number] as const)    as DataType<[number, number]>
 * @param args tuple of primitive constructor like Number, String, or Boolean
 */
export function as<T extends readonly (DataType<unknown> | DataTypeConstructor)[]>
    (args: T): Transpose.ArrayOfDataType<// @ts-ignore
        NarrowTuple<{ [K in keyof T]: T[K] extends
            DataTypeConstructor ? DataType<ReturnType<T[K]>> : T[K] }>>

export function as(arg: unknown | unknown[]): DataType<unknown> {
    if (isArray(arg))
        switch (arg.length) {
            case 0: return array(unknown)
            case 1: return array(as(arg[0])) //@ts-ignore👇
            default: return tuple(...arg.map(ty => as(ty)))
        }
    else
        switch (arg) {
            case Number: return number
            case String: return string
            case Boolean: return boolean
            default: return arg as DataType<unknown>
        }
}

type SchemaType<T = unknown> =
    | DataType<T>
    | DataTypeConstructor
    | readonly (DataTypeConstructor | DataType<T>)[]

type WithDefault<T = unknown, S extends SchemaType = SchemaType<T>> = {
    type: S // BUG(typescript): can't infer from key
    defaultValue?: NarrowSchemaType<S> extends DataType<infer E> ? E : unknown
}

type NarrowSchemaType<T extends SchemaType> = ( // @ts-ignore
    T extends readonly unknown[] ? Transpose.ArrayOfDataType<NarrowTuple<{ [K in keyof T]:// @ts-ignore
        T[K] extends DataTypeConstructor ? DataType<ReturnType<T[K]>> : T[K]
    }>>
    : T extends DataTypeConstructor ? DataType<ReturnType<T>>
    : T // extends DataType<unknown>
)

type SchemaKey<T = unknown> =
    | Schema<T>
    | WithDefault<T>
    | SchemaType<T>

export type Schema<T = unknown> = {
    [key: string]: SchemaKey<T>
}

/** Helper type to narrow Schema into the original Schema (Schema of DataType).
 * It mostly used to infer the return type of generic Schema.
 * @example
 * declare function createSchema<S extends Schema>(schema: S): NarrowSchema<S>;
 * 
 * expectType<{
 *  value: DataType<[number, string]>
 * }>(createSchema({
 *  value: [Number, String] as const
 * }))
 */
export type NarrowSchema<S extends Schema> = { [K in keyof S]:
    S[K] extends SchemaType<unknown> ? NarrowSchemaType<S[K]>
    : S[K] extends WithDefault ? NarrowSchemaType<S[K]['type']> //@ts-ignore
    : NarrowSchema<S[K]>
}

import { $isDataType } from '@javelin/ecs'

export const createSchema = <S extends Schema>(schema: S): NarrowSchema<S> => //@ts-ignore
    fromEntries(entries(schema)
        .map(([key, value]) => {
            if (isArray(value))
                return value.map(ty => as(ty))
            else if (value[$isDataType])                // DataType
                return value
            else if (typeof value === 'function')       // DataTypeConstructor
                return as(value)
            else if ('type' in value) {                 // WithDefault
                if (isArray(value.type))
                    value.type = value.type.map(ty => as(ty))
                else
                    value.type = as(value.type as Exclude<SchemaType, readonly unknown[]>)
                return value
            } else                                      // Schema
                return createSchema(value as Schema)
        })
    )


let c
    // : { b: DataType<[number, string, ...string[]]> }
    // : { b: DataType<[number, string]> }
    // : { b: { type: DataType<Number>, defaultValue: number } }
    : { b: { c: DataType<number[]> } }
    // : { b: DataType<NumberConstructor> }
    // : { b: NumberConstructor }
    =
    createSchema({
        // b: { type: number },
        // b: { type: [Number, String, ...Array(String)] as const },
        b: {
            c: Array.of(number)
            // c: number
        },
        // b: [Number, String] as const,
        // b: number,
        // c: [Number] as const,
        // c: [Number, Number] as const,
    })

// componentType({
//     type: 1,
//     schema: {
//         x: { type: number, defaultValue: '' }
//     }
// })

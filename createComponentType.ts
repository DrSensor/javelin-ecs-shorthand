import { createComponentType as componentType, ComponentType as _ComponentType, DataType } from '@javelin/ecs'
import { createSchema, Schema, NarrowSchema } from './schema_utils'
import { tuple, number, string } from './standard_data_types'

//@ts-ignore
type ComponentType = _ComponentType<Schema>
type NarrowComponentTypeSchema<T extends ComponentType> = {
    [K in keyof T]: K extends 'schema' ? NarrowSchema<T[K]> : T[K]
}

type _Test = {
    schema: {
        value: DataType<[number, string]>,
        name: DataType<[string, [number, string]]>,
    }
}
const schema = {
    value: [Number, String],
    name: [String, tuple(number, string)],
} as const

    , _origin: _Test =
        createComponentType({
            type: 1,
            schema,
        })
    //@ts-expect-error
    , _1: _Test =
        createComponentType(schema)
    //@ts-expect-error
    , _2: _Test =
        createComponentType("name", schema)
    //@ts-expect-error
    , _3: _Test =
        createComponentType(1, schema)

/** 
 * @example
 * createComponentType(??, {x: number, y: number})
 * createComponentType(??, {x: number, y: number}, (position, x = 0, y = 0) => { })
 * createComponentType(??, {x: number, y: number}, {
 *     ?type: 1, ?name: "position",
 *     initialize(position, x = 0, y = 0) { }
 * })
 */
export function createComponentType<C extends ComponentType>(
    schema: C['schema'],
    initializeOrOptions?: C['initialize'] | Omit<C, 'schema'>
): NarrowComponentTypeSchema<C> // TODO: should infer from schema and initializeOrOptions arguments

export function createComponentType<C extends ComponentType>(
    name: string,
    schema: C['schema'],
    initializeOrOptions?: C['initialize'] | Omit<C, 'schema' | 'name'>
): NarrowComponentTypeSchema<C> // TODO: should infer from schema and initializeOrOptions arguments

export function createComponentType<C extends ComponentType>(
    type: number,
    schema: C['schema'],
    initializeOrOptions?: C['initialize'] | Omit<C, 'schema' | 'type'>
): NarrowComponentTypeSchema<C> // TODO: should infer from schema and initializeOrOptions arguments

// origin
export function createComponentType<C extends ComponentType>(componentType: C): NarrowComponentTypeSchema<C>

export function createComponentType<C extends ComponentType>(
    component: C | string | number,
    schemaOrOptions?: any,
    options?: any
): C {
    const type = Number(crypto.getRandomValues(new Uint32Array(1)))

    options = { type, ...(typeof options === 'function' ? { initialize: options } : options) }
    //Note: random👆`type` value will be overrided when `type` exists in `...options`

    switch (typeof component) {
        case 'string': return componentType({
            ...options,
            schema: createSchema(schemaOrOptions),
            name: component
        })
        case 'number': return componentType({
            ...options,
            schema: createSchema(schemaOrOptions),
            type: component
        })
        default: // @ts-ignore
            if ('schema' in component) return componentType({// @ts-ignore origin
                ...component, schema: createSchema(component.schema)
            })
            else return componentType({// @ts-ignore
                schema: createSchema(component), ...options
            })
    }
}

import { createComponentType as componentType, ComponentType } from '@javelin/ecs'
import { createSchema, Schema, NarrowSchema } from './schema_utils'

// type ComponentType = 

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
): C

export function createComponentType<C extends ComponentType>(
    name: string,
    schema: C['schema'],
    initializeOrOptions?: C['initialize'] | Omit<C, 'schema' | 'name'>
): C

export function createComponentType<C extends ComponentType>(
    type: number,
    schema: C['schema'],
    initializeOrOptions?: C['initialize'] | Omit<C, 'schema' | 'type'>
): C

// origin
export function createComponentType<C extends ComponentType>(componentType: C): C

export function createComponentType<C extends ComponentType>(
    component: C | string | number,
    schemaOrOptions?: any,
    options?: any
): ComponentType {
    const type = Number(crypto.getRandomValues(new Uint32Array(1)))

    options = { type, ...(typeof options === 'function' ? { initialize: options } : options) }
    //Note: random👆`type` value will be overrided when `type` exists in `...options`

    switch (typeof component) {
        case 'string': return componentType({
            ...options,
            schema: schemaOrOptions,
            name: component
        })
        case 'number': return componentType({
            ...options,
            schema: schemaOrOptions,
            type: component
        })
        default: if ('schema' in component) return componentType(
            component // origin
        )
        else return componentType({
            schema: component, ...options
        })
    }
}

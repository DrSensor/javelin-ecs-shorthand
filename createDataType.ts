import { createDataType as dataType, DataType } from '@javelin/ecs'

type DataTypeConfig<T> = Pick<DataType<T>, 'name' | 'create' | 'reset'>

// accept {create: val, reset?: val} and vice versa where reset take value from create if empty
export function createDataType<T>(config: { name: string, create?: T, reset: T }): DataType<T>
export function createDataType<T>(config: { name: string, create: T, reset?: T }): DataType<T>

// accept {create(){}, reset: val} and vice versa
export function createDataType<T>(config: { name: string, create: DataType<T>['create'], reset: T }): DataType<T>
export function createDataType<T>(config: { name: string, create: T, reset: DataType<T>['reset'] }): DataType<T>

// accpet createDataType("name", value or function)
export function createDataType<T>(name: string, defaultValue: T | ((value: T) => T)): DataType<T>

/**@deprecated WIP */
export function createDataType<T extends new () => {}>(ctor: T, config?: Partial<DataTypeConfig<T>>): DataType<T>

/**@deprecated WIP */
export function createDataType<T extends new (...args: any) => {}>(
    defaultArgs: ConstructorParameters<T>, ctor: T, config?: Partial<DataTypeConfig<T>>
): DataType<T>

// origin
export function createDataType<T>(config: DataTypeConfig<T>): DataType<T>

export function createDataType(config: any, defaultValue?: any) {
    /** WIP
     * @todo: Handle `class`
     * @example
     switch (typeof config) {
         case 'string': return // handle createDataType("name", value or function)
         case 'function': return // handle createDataType(class {})
         default: if (Array.isArray(config)) return // handle createDataType([...args], class {})
         else { } // handle createDataType(config: {...})
     }
     */
    const _ = 'hover me!'

    if (typeof config === 'string') return dataType({ // handle createDataType("name", value or function)
        name: config,
        create: (val = defaultValue?.()) => val,
        reset: (c, key, val = defaultValue?.()) => c[key] = val
    })
    else { // handle createDataType({...})config?
        const { name, create, reset } = config
        if ([create, reset].every(e => typeof e === 'function')) return dataType({ // origin
            name, create, reset
        })
        else if (typeof create !== 'function') return dataType({ // handle config {create(), reset: val}
            name, reset, create: (val = create) => val
        })
        else if (typeof reset !== 'function') return dataType({ // handle config {create: val, reset()}
            name, create, reset: (c, key, val = reset) => c[key] = val
        })
        else return dataType({ // handle config {create: val, reset?: val} and vice versa
            name, create: (val = create ?? reset!) => val,
            reset: (c, key, val = reset ?? create!) => c[key] = val,
        })
    }
}

// import { Vector3 } from '@babylonjs/core'

// createDataType(Vector3)
// createDataType([1, 10], class {
//     constructor(x: number, y: number) { }
// })

const isConstructable = <C extends new (...args: any) => any>(c: C | InstanceType<C> | any): c is C =>
    typeof c === 'function' && typeof c.prototype === 'object'

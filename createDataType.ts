import { createDataType as dataType, DataType } from '@javelin/ecs'

// accept {create: val, reset?: val} and vice versa where reset take value from create if empty
export function createDataType<T>(config: { name: string, create?: T, reset: T }): DataType<T>
export function createDataType<T>(config: { name: string, create: T, reset?: T }): DataType<T>

// accept {create(){}, reset: val} and vice versa
export function createDataType<T>(config: { name: string, create: DataType<T>['create'], reset: T }): DataType<T>
export function createDataType<T>(config: { name: string, create: T, reset: DataType<T>['reset'] }): DataType<T>

// accpet createDataType("name", value or function)
export function createDataType<T>(name: string, defaultValue: T | ((value: T) => T)): DataType<T>

// origin
export function createDataType<T>(config: Pick<DataType<T>, 'name' | 'create' | 'reset'>): DataType<T>

export function createDataType(config: any, defaultValue?: any) {
    if (typeof config === 'string') return dataType({ // handle createDataType("name", value or function)
        name: config,
        create: (val = defaultValue?.()) => val,
        reset: (c, key, val = defaultValue?.()) => c[key] = val
    })
    else { // handle createDataType({...})
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

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type RequiredAndNotNullBy<ObjectType, RequiredKeys extends keyof ObjectType> = Omit<
    ObjectType,
    RequiredKeys
> &
    Required<{[PropertyName in RequiredKeys]: NonNullable<ObjectType[PropertyName]>}>;

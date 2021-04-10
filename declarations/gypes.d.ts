declare type TypeDiff<
    T,
    U,
    T0 = Omit<T, keyof U> & Omit<U, keyof T>,
    T1 = {[K in keyof T0]: T0[K]}
> = T1;

declare type TypeSame<T, U> = Omit<T | U, keyof TypeDiff<T, U>>;

declare type TypeMerge<
  T,
  U, 
  T0 = TypeDiff<T, U> & {[K in keyof TypeSame<T, U>]: TypeMergeDeep<T[K], U[K]>},
  T1 = { [K in keyof T0]: T0[K] }
> = T1

declare type TypeMergeDeep<T, U> = [T, U] extends [{ [key: string]: unknown}, { [key: string]: unknown } ] ? TypeMerge<T, U> : T | U;


declare type TypeExclude<
    T extends {[P in keyof T]: unknown},
    Et extends {[P in keyof Et]: unknown},
    P0 = {[K in keyof T]: K extends keyof Et ? TypeExcludeDeep<T[K], Et[K]> : T[K]},
    P1 = {[K in keyof P0]: P0[K]}
> = P1;

declare type TypeExcludeDeep<T, Et> = [T, Et] extends [{[key: string]: unknown}, {[key: string]: unknown}] ? TypeExclude<T, Et> : Exclude<T, Et>;

declare type TypeExtract<
    T extends {[P in keyof T]: unknown},
    Et extends {[P in keyof Et]: unknown},
    P0 = {[K in keyof T]: K extends keyof Et ? TypeExtractDeep<T[K], Et[K]> : T[K]},
    P1 = {[K in keyof P0]: P0[K]}
> = P1;

declare type TypeExtractDeep<T, Et> = [T, Et] extends [{[key: string]: unknown}, {[key: string]: unknown}] ? TypeExtract<T, Et> : Extract<T, Et>;


declare type TypeOmit<
    T extends {[P in keyof T]: unknown},
    Kt extends {[P in keyof Kt]: unknown},
    P0 = {[K in keyof T]: K extends keyof Kt ? TypeOmitDeep<T[K], Kt[K]> : T[K]},
    P1 = {[K in keyof P0 as P0[K] extends never ? never : K]: P0[K]}
> = P1;

declare type TypeOmitDeep<T, Kt> = [T, Kt] extends [{[key: string]: unknown}, {[key: string]: unknown}] ? TypeOmit<T, Kt> : never;


declare type TypeKeep<T, Ec, Et> = TypeMerge<TypeOmit<TypeExclude<T, Ec>, Et>, TypeOmit<TypeExtract<T, Et>, Ec>>;
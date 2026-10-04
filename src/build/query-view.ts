// The members of a model type that a reader may use. The model keeps commands and queries apart, and
// every command returns nothing, so a member whose result is nothing once void is taken out is left out.
type QueryKey<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => infer R
    ? [Exclude<R, void>] extends [never]
      ? never
      : K
    : K;
}[keyof T];

export type QueryView<T> = Pick<T, QueryKey<T>>;

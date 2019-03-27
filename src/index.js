/* @flow */

export type AccessLevelType = boolean | number | $ReadOnlyArray<number> | (n: number) => boolean;

export type Dictionary<D: string> = {|
  +[key: D]: number
|};

export type PoliciesType = number | $ReadOnlyArray<number>;

export type PolycyParams<D: string> = $ReadOnlyArray<D | $ReadOnlyArray<D>>;

export type RulesType<T: string> = {|
  +[key: T]: {
    (): boolean,
  }
|}

export type RilesDict<T: string> = {|
  +[key: T]: T,
|};


type RU<D> = (...args: $ReadOnlyArray<mixed>) => RulesType<D>

type AR<D> = {|
  dictionary: Dictionary<D>,
  restriction: {
    (...arg: $ReadOnlyArray<mixed>): number,
  },
  policy: {
    (...arg: PolycyParams<D>): PoliciesType,
  },
  paramsName: {|
    [key: D]: D,
  |}
|}

export function is(mask: number, value: number): boolean {
  return mask === (mask & value);
}

export function checkArray(masks: $ReadOnlyArray<number>, value: number): boolean {
  return masks.some(a => is(a, value));
}

export function check<L: AccessLevelType>(accessLevel: L, userRights: number): boolean {
  if (typeof accessLevel === 'boolean') {
    return accessLevel;
  } if (typeof accessLevel === 'function') {
    return accessLevel(userRights);
  } if (typeof accessLevel === 'object' && Array.isArray(accessLevel)) {
    return checkArray(accessLevel, userRights);
  } if (typeof accessLevel === 'number') {
    return is(accessLevel, userRights);
  } return false;
}

export function mergeMask<D: string>(dict: Dictionary<D>): (e: $ReadOnlyArray<D>) => number {
  return (arr: $ReadOnlyArray<D>): number => arr.reduce((A, V) => dict[V] | A, 0);
}

function createMask<D: string>(dictionary: Dictionary<D>): (e: D | $ReadOnlyArray<D>) => number {
  const merge = mergeMask(dictionary);
  return (element: D | $ReadOnlyArray<D>): number => {
    if (Array.isArray(element)) {
      return merge(element);
    }
    return dictionary[element];
  };
}

/**
 * Helper function
 * @function
 * @name createPolicies
 * @param dict object dictionary of all available rights
 * @param items array of rights for this instance
 *
 * */

// eslint-disable-next-line max-len
export function createPolicies<D: string>(dict: Dictionary<D>, items: PolycyParams<D>): PoliciesType {
  const maker = createMask(dict);
  if (items.length === 1) return maker(items[0]);
  return items.map(s => maker(s));
}

export function makeDictionary<D: string>(arr: $ReadOnlyArray<D>): Dictionary<D> {
  return arr.reduce((a, e, i) => Object.assign(a, { [e]: 1 << i }), { [arr[0]]: 1 });
}

export function arrayFilter(restriction: number): (f: { restriction: AccessLevelType }) => boolean {
  return f => check(f.restriction, restriction);
}

export function advancedRights<T: string>(rules: RU<T>): AR<T> {
  const pa: $ReadOnlyArray<T> = Object.keys(rules());
  const dictionary = makeDictionary(pa);
  return {
    dictionary,
    restriction(...args: $ReadOnlyArray<mixed>) {
      const r = rules(...args);
      return pa.reduce((a, v) => ((+r[v]() && dictionary[v]) | a), 0);
    },
    policy: (...arr: PolycyParams<T>) => createPolicies(dictionary, arr),
    paramsName: pa.reduce((a, v) => Object.assign(a, { [v]: v }), { [pa[0]]: pa[0] }),
  };
}

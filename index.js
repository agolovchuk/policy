// @flow

import type {
  AccessLevelType,
  Dictionary,
  PoliciesType,
  PolycyParams,
  RulesType,
} from './types.js.flow';

type RU<D> = (...args: mixed[]) => RulesType<D>

type AR<D> = {|
  dictionary: Dictionary<D>,
  restriction: {
    (...arg: mixed[]): number,
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

export function checkArray(masks: Array<number>, value: number): boolean {
  return masks.some(a => is(a, value));
}

export function check<L: AccessLevelType>(accessLevel: L, userRights: number): boolean {
  if (typeof accessLevel === 'boolean') {
    return accessLevel;
  } else if (typeof accessLevel === 'function') {
    return accessLevel(userRights);
  } else if (typeof accessLevel === 'object' && Array.isArray(accessLevel)) {
    return checkArray(accessLevel, userRights);
  } else if (typeof accessLevel === 'number') {
    return is(accessLevel, userRights);
  } return false;
}

export function mergeMask<D: string>(dict: Dictionary<D>): (e: Array<D>) => number {
  return (arr: D[]): number => arr.reduce((A, V) => dict[V] | A, 0);
}

function createMask<D: string>(dictionary: Dictionary<D>): (e: D | Array<D>) => number {
  const merge = mergeMask(dictionary);
  return (element: D | Array<D>): number => {
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

export function makeDictionary<D: string>(arr: Array<D>): Dictionary<D> {
  return arr.reduce((a, e, i) => Object.assign(a, { [e]: 1 << i }), { [arr[0]]: 1 });
}

export function arrayFilter(restriction: number): (f: { restriction: AccessLevelType }) => boolean {
  return f => check(f.restriction, restriction);
}

export function advancedRights<T: string>(rules: RU<T>): AR<T> {
  const pa: T[] = Object.keys(rules());
  const dictionary = makeDictionary(pa);
  return {
    dictionary,
    restriction(...args: mixed[]) {
      const r = rules(...args);
      return pa.reduce((a, v) => ((+r[v]() && dictionary[v]) | a), 0);
    },
    policy: (...arr: PolycyParams<T>) => createPolicies(dictionary, arr),
    paramsName: pa.reduce((a, v) => Object.assign(a, { [v]: v }), { [pa[0]]: pa[0] }),
  };
}

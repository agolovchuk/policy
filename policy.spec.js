import * as rf from './index';

const A = 1 << 5; // 100000
const B = 17;     // 010001
const C = 31;     // 011111


describe('Restriction', () => {
  const arr = [
    'guest_name',
    'arrival_time',
    'departure_time',
    'guest_price',
  ];
  const MASKS = {
    guest_name: 1,          // 0001
    arrival_time: 1 << 1,   // 0010
    departure_time: 1 << 2, // 0100
    guest_price: 1 << 3,    // 1000
  };

  it('is function', () => {
    expect(rf.is(A, 32)).toBeTruthy();
    expect(rf.is(A, 31)).toBeFalsy();
    expect(rf.is(128, 191)).toBeTruthy(); // 10000000
                                          // 10111111
    expect(rf.is(191, 128)).toBeFalsy();
  });

  it('checkArray function', () => {
    expect(rf.checkArray([A, A], 32)).toBeTruthy();
    expect(rf.checkArray([C, A], 32)).toBeTruthy();
    expect(rf.checkArray([C, C, B], 32)).toBeFalsy();
    expect(rf.checkArray([128, C, B], 191)).toBeTruthy();
  });

  it('makeDictionary function', () => {
    expect(rf.makeDictionary(arr)).toEqual(MASKS);
  });

  it('createPolicies function', () => {
    const dict = rf.makeDictionary(arr);
    expect(rf.createPolicies(dict, ['departure_time', 'guest_price'])).toEqual([4, 8]);
    expect(rf.createPolicies(dict, ['departure_time'])).toEqual(4);
    expect(rf.createPolicies(dict, [['departure_time', 'guest_price']])).toEqual(12);
    expect(rf.createPolicies(dict, [['departure_time', 'guest_price'], 'arrival_time'])).toEqual([12, 2]);
    expect(rf.createPolicies(dict, [['departure_time', 'guest_price'], ['arrival_time', 'guest_name']])).toEqual([12, 3]);
  });

  it('check function', () => {
    expect(rf.check(A, 32)).toBeTruthy();
    expect(rf.check([A, C], 32)).toBeTruthy();
    expect(rf.check((() => true), 32)).toBeTruthy();
    expect(rf.check(true, 32)).toBeTruthy();
    expect(rf.check(false, 32)).toBeFalsy();
    expect(rf.check([191], 128)).toBeFalsy();
    expect(rf.check({}, 128)).toBeFalsy();
    expect(rf.check(null, 128)).toBeFalsy();
    expect(rf.check(undefined, 128)).toBeFalsy();
    expect(rf.check(undefined, undefined)).toBeFalsy();
  });

});

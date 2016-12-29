import { utils } from '../www/index-ios';
import assert from 'assert';

describe('utils', () => {
  describe('validArrayOfStrings', () => {
    it('should return true on a valid non-empty string array', () => {
      assert(utils.validArrayOfStrings(['product1']) === true);
      assert(utils.validArrayOfStrings(['product1', 'product2']) === true);
    });

    it('should return false on a invalid non-empty string array', () => {
      assert(utils.validArrayOfStrings([]) === false);
      assert(utils.validArrayOfStrings(['']) === false);
      assert(utils.validArrayOfStrings([null]) === false);
      assert(utils.validArrayOfStrings([undefined]) === false);
      assert(utils.validArrayOfStrings(['product1', null]) === false);
      assert(utils.validArrayOfStrings(['product1', '']) === false);
      assert(utils.validArrayOfStrings(null) === false);
      assert(utils.validArrayOfStrings() === false);
      assert(utils.validArrayOfStrings(false) === false);
      assert(utils.validArrayOfStrings('product1') === false);
      assert(utils.validArrayOfStrings(123) === false);
    });
  });

  describe('validString', () => {
    it('should return true on a valid non-empty string', () => {
      assert(utils.validString('abc') === true);
    });

    it('should return false on anyting else', () => {
      assert(utils.validString() === false);
      assert(utils.validString(null) === false);
      assert(utils.validString('') === false);
      assert(utils.validString(123) === false);
      assert(utils.validString(true) === false);
      assert(utils.validString([]) === false);
      assert(utils.validString({}) === false);
    });
  });
});

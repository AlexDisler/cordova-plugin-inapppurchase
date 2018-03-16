import { utils } from '../www/index-ios';
import assert from 'assert';

describe('utils', () => {
  describe('#chunk', () => {
    it('should chunk a given array', () => {
      const chunks = utils.chunk(['1', '2', '3', '4', '5'], 2);
      assert.deepEqual(chunks, [['1', '2'], ['3', '4'], ['5']]);
    });

    it('should return on chunk when the size is bigger than the array size', () => {
      const chunks = utils.chunk(['1', '2', '3', '4', '5'], 42);
      assert.deepEqual(chunks, [['1', '2', '3', '4', '5']]);
    });

    it('should throw an error on size smaller 1', () => {
      assert.throws(() => {
        utils.chunk(['1', '2', '3', '4', '5'], 0);
      }, (err) => {
        return err.message === 'Invalid size';
      }, 'unexpected error');
    });

    it('should throw an error on non numeric size', () => {
      assert.throws(() => {
        utils.chunk(['1', '2', '3', '4', '5'], 'not a number');
      }, (err) => {
        return err.message === 'Invalid size';
      }, 'unexpected error');
    });

    it('should throw an error when on a non array type', () => {
      assert.throws(() => {
        utils.chunk(null, 2);
      }, (err) => {
        return err.message === 'Invalid array';
      }, 'unexpected error');
    });
  });
});

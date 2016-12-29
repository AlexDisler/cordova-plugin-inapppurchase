/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

const utils = {};

utils.errors = {
  101: 'invalid argument - productIds must be an array of strings',
  102: 'invalid argument - productId must be a string',
  103: 'invalid argument - product type must be a string',
  104: 'invalid argument - receipt must be a string of a json',
  105: 'invalid argument - signature must be a string',
};

utils.validArrayOfStrings = (val) => {
  return (val && Array.isArray(val) && val.length > 0 && !val.find(i => !i.length || typeof i !== 'string'));
};

utils.validString = (val) => {
  return (val && val.length && typeof val === 'string');
};

utils.chunk = (array, size) => {
  if (!Array.isArray(array)) {
    throw new Error('Invalid array');
  }

  if (typeof size !== 'number' || size < 1) {
    throw new Error('Invalid size');
  }

  const times = Math.ceil(array.length / size);
  return Array
    .apply(null, Array(times))
    .reduce((result, val, i) => {
      return result.concat([array.slice(i * size, (i + 1) * size)]);
    }, []);
};

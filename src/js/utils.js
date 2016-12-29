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
  return (Array.isArray(val) && val.length > 0 && val.every(utils.validString));
};

utils.validString = (val) => {
  return (typeof val === 'string' && val.length > 0);
};

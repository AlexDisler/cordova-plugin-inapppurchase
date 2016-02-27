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
};

utils.validArrayOfStrings = (val) => {
  return (val && Array.isArray(val) && val.length > 0 && !val.find(i => !i.length || typeof i !== 'string'));
};

utils.validString = (val) => {
  return (val && val.length && typeof val === 'string');
};

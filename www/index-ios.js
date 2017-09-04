'use strict';

/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

var utils = {};

utils.errors = {
  101: 'invalid argument - productIds must be an array of strings',
  102: 'invalid argument - productId must be a string',
  103: 'invalid argument - product type must be a string',
  104: 'invalid argument - receipt must be a string of a json',
  105: 'invalid argument - signature must be a string'
};

utils.validArrayOfStrings = function (val) {
  return val && Array.isArray(val) && val.length > 0 && !val.find(function (i) {
    return !i.length || typeof i !== 'string';
  });
};

utils.validString = function (val) {
  return val && val.length && typeof val === 'string';
};

utils.chunk = function (array, size) {
  if (!Array.isArray(array)) {
    throw new Error('Invalid array');
  }

  if (typeof size !== 'number' || size < 1) {
    throw new Error('Invalid size');
  }

  var times = Math.ceil(array.length / size);
  return Array.apply(null, Array(times)).reduce(function (result, val, i) {
    return result.concat([array.slice(i * size, (i + 1) * size)]);
  }, []);
};
'use strict';

/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

var inAppPurchase = { utils: utils };

var nativeCall = function nativeCall(name) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  return new Promise(function (resolve, reject) {
    window.cordova.exec(function (res) {
      resolve(res);
    }, function (err) {
      reject(err);
    }, 'PaymentsPlugin', name, args);
  });
};

inAppPurchase.getProducts = function (productIds) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validArrayOfStrings(productIds)) {
      reject(new Error(inAppPurchase.utils.errors[101]));
    } else {
      return nativeCall('getProducts', [productIds]).then(function (res) {
        if (!res || !res.products) {
          resolve([]);
        } else {
          var arr = res.products.map(function (val) {
            return {
              productId: val.productId,
              title: val.title,
              description: val.description,
              price: val.price,
              currency: val.currency,
              priceAsDecimal: val.priceAsDecimal,
            };
          });
          resolve(arr);
        }
      }).catch(reject);
    }
  });
};

inAppPurchase.buy = function (productId) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validString(productId)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      nativeCall('buy', [productId]).then(function (res) {
        resolve({
          transactionId: res.transactionId,
          receipt: res.receipt
        });
      }).catch(reject);
    }
  });
};

/**
 * This function exists so that the iOS plugin API will be compatible with that of Android -
 * where this function is required.
 * See README for more details.
 */
inAppPurchase.subscribe = function (productId) {
  return inAppPurchase.buy(productId);
};

/**
 * This function exists so that the iOS plugin API will be compatible with that of Android -
 * where this function is required.
 * See README for more details.
 */
inAppPurchase.consume = function () {
  return Promise.resolve();
};

inAppPurchase.getReceipt = function () {
  return nativeCall('getReceipt').then(function (res) {
    var receipt = '';
    if (res && res.receipt) {
      receipt = res.receipt;
    }
    return receipt;
  });
};

inAppPurchase.restorePurchases = function () {
  return nativeCall('restorePurchases').then(function (res) {
    var arr = [];
    if (res && res.transactions) {
      arr = res.transactions.map(function (val) {
        return {
          productId: val.productId,
          date: val.date,
          transactionId: val.transactionId,
          state: val.transactionState
        };
      });
    }
    return arr;
  });
};

module.exports = inAppPurchase;
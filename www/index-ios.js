'use strict';

var utils = {};

utils.errors = {
  101: 'invalid argument - productIds must be an array of strings',
  102: 'invalid argument - productId must be a string'
};

utils.validArrayOfStrings = function (val) {
  return val && Array.isArray(val) && val.length > 0 && !val.find(function (i) {
    return !i.length || typeof i !== 'string';
  });
};

utils.validString = function (val) {
  return val && val.length && typeof val === 'string';
};
'use strict';

/*!
 *
 * Author: Alex Disler (alexdisler@gmail.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

var inAppPurchase = { utils: utils };

var nativeCall = function nativeCall(name) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

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
            console.log('here!!!');
            console.log(JSON.stringify(val));
            return {
              productId: val.productId,
              title: val.title,
              description: val.description,
              price: val.price
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
          productId: res.productId,
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
inAppPurchase.consume = function (receipt) {
  return new Promise(function (resolve, reject) {
    if (!inAppPurchase.utils.validString(receipt)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      resolve();
    }
  });
};

inAppPurchase.restorePurchases = function () {
  return nativeCall('restorePurchases').then(function (purchases) {
    var arr = purchases.map(function (val) {
      return {
        productId: val.productId,
        state: val.transactionState,
        date: val.date,
        transactionId: val.transactionId };
    });
    // <- iOS only
    return arr;
  });
};

module.exports = inAppPurchase;
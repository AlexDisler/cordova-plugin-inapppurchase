/*!
 *
 * Author: Neil Rackett (mesmotronic.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

const inAppPurchase = { utils };

inAppPurchase.getProducts = (productIds) => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

inAppPurchase.buy = (productId) => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

inAppPurchase.subscribe = (productId) => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

inAppPurchase.consume = (type, receipt, signature) => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

inAppPurchase.restorePurchases = () => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

inAppPurchase.getReceipt = () => {
  return Promise.reject(new Error(inAppPurchase.utils.errors[106]));
};

module.exports = inAppPurchase;

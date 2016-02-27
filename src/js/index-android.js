/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

const inAppPurchase = { utils };

const nativeCall = (name, args = []) => {
  return new Promise((resolve, reject) => {
    window.cordova.exec((res) => {
      resolve(res);
    }, (err) => {
      reject(err);
    }, 'InAppBillingV3', name, args);
  });
};

inAppPurchase.getProducts = (productIds) => {
  return new Promise((resolve, reject) => {
    if(!inAppPurchase.utils.validArrayOfStrings(productIds)) {
      reject(new Error(inAppPurchase.utils.errors[101]));
    } else {
      nativeCall('init', []).then(() => {
        return nativeCall('getSkuDetails', productIds);
      })
      .then((items) => {
        const arr = items.map((val) => {
          return {
            productId   : val.productId,
            title       : val.title,
            description : val.description,
            price       : val.price,
          };
        });
        resolve(arr);
      }).catch(reject);
    }
  });
};

inAppPurchase.buy = (productId) => {
  return new Promise((resolve, reject) => {
    if(!inAppPurchase.utils.validString(productId)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      nativeCall('buy', [productId]).then((res) => {
        resolve({
          signature: res.signature, // <- Android only
          productId: res.productId,
          transactionId: res.purchaseToken,
          receipt : JSON.stringify({
            orderId: res.orderId,
            packageName: res.packageName,
            productId: res.productId,
            purchaseTime: res.purchaseTime,
            purchaseState: res.purchaseState,
            purchaseToken: res.purchaseToken,
          }),
        });
      }).catch(reject);
    }
  });
};

inAppPurchase.consume = (transactionId) => {
  return new Promise((resolve, reject) => {
    if(!inAppPurchase.utils.validString(transactionId)) {
      reject(new Error(inAppPurchase.utils.errors[102]));
    } else {
      nativeCall('consumePurchase', [transactionId]).then(resolve).catch(reject);
    }
  });
};

inAppPurchase.restorePurchases = () => {
  return nativeCall('restorePurchases', []).then((purchases) => {
    let arr = [];
    if (purchases) {
      arr = purchases.map((val) => {
        return {
          productId : val.productId,
          state     : val.state,
          date      : val.date,
          token     : val.token, // <- Android only
          type      : val.type, // <- Android only
        };
      });
    }
    return arr;
  });
};

module.exports = inAppPurchase;

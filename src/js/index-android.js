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
          signature: res.signature,
          productId: res.productId,
          transactionId: res.purchaseToken,
          type : res.type,
          productType : res.type,
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

inAppPurchase.consume = (type, receipt, signature) => {
  return new Promise((resolve, reject) => {
    if(!inAppPurchase.utils.validString(type)) {
      reject(new Error(inAppPurchase.utils.errors[103]));
    } else if (!inAppPurchase.utils.validString(receipt)) {
      reject(new Error(inAppPurchase.utils.errors[104]));
    } else if (!inAppPurchase.utils.validString(signature)) {
      reject(new Error(inAppPurchase.utils.errors[105]));
    } else {
      nativeCall('consumePurchase', [type, receipt, signature]).then(resolve).catch(reject);
    }
  });
};

inAppPurchase.restorePurchases = () => {
  return nativeCall('init', [])
    .then(() => {
      return nativeCall('restorePurchases', []);
    })
    .then((purchases) => {
      let arr = [];
      if (purchases) {
        arr = purchases.map((val) => {
          return {
            productId: val.productId,
            state : val.state,
            transactionId: val.orderId,
            date : val.date,
            type : val.type,
            productType : val.type,
            signature: val.signature,
            receipt : JSON.stringify({
              orderId: val.orderId,
              packageName: val.packageName,
              productId: val.productId,
              purchaseTime: val.purchaseTime,
              purchaseState: val.purchaseState,
              purchaseToken: val.purchaseToken,
            }),
          };
        });
      }
      return Promise.resolve(arr);
    });
};

module.exports = inAppPurchase;

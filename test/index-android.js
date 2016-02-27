import inAppPurchase from '../www/index-android';
import assert from 'assert';

describe('Android purchases', () => {

  before(() => {
    GLOBAL.window = {};
    GLOBAL.window.cordova = {};
  });

  describe('#getProducts()', () => {

    it('should initialize the Android plugin', async (done) => {
      try {
        const productIds = ['com.test.prod1', 'com.test.prod2'];
        let initCalled = false;
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          if (name === 'init') {
            assert(typeof success === 'function', 'should define a success callback');
            assert(typeof err === 'function', 'should define an error callback');
            assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
            assert(args.length === 0, 'args should be empty');
            initCalled = true;
            success();
          } else if (name === 'getSkuDetails') {
            success([]);
          }
        };
        await inAppPurchase.getProducts(productIds);
        assert(initCalled, 'init() should be called');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should call the Android getSkuDetails() function with the correct args', async (done) => {
      try {
        const productIds = ['com.test.prod1', 'com.test.prod2'];
        let getSkuDetailsCalled = false;
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          if (name === 'getSkuDetails') {
            assert(typeof success === 'function', 'should define a success callback');
            assert(typeof err === 'function', 'should define an error callback');
            assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
            assert(args === productIds, 'should get productIds as args');
            getSkuDetailsCalled = true;
            success([]);
          } else if (name === 'init') {
            success();
          }
        };
        await inAppPurchase.getProducts(productIds);
        assert(getSkuDetailsCalled, 'getSkuDetails() should be called');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an array of objects', async (done) => {
      try {
        const products = [
          { productId: 'com.test.prod1', title: 'prod1 title', description: 'prod1 description', price: '$0.99' },
          { productId: 'com.test.prod2', title: 'prod2 title', description: 'prod2 description', price: '$1.99' },
        ];
        const productIds = products.map(i => i.productId );
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          if (name === 'getSkuDetails') {
            success(products);
          } else if (name === 'init') {
            success();
          }
        };
        const resProducts = await inAppPurchase.getProducts(productIds);
        assert.deepEqual(resProducts, products);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should throw an error on an invalid argument', async (done) => {
      let err1 = false;
      let err2 = false;
      let err3 = false;
      try {
        await inAppPurchase.getProducts();
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[101]) {
          err1 = true;
        } else {
          done(err);
        }
      }
      try {
        await inAppPurchase.getProducts([1]);
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[101]) {
          err2 = true;
        } else {
          done(err);
        }
      }
      try {
        await inAppPurchase.getProducts('test');
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[101]) {
          err3 = true;
        } else {
          done(err);
        }
      }
      assert(err1, 'should throw an error for no arguments');
      assert(err2, 'should throw an error for an array of int');
      assert(err3, 'should throw an error for a string');
      done();
    });

  });

  describe('#buy()', () => {

    it('should call the Android buy() function with the correct args ', async (done) => {
      try {
        const productId = 'com.test.prod1';
        const orderId = '_some_order_id_';
        const purchaseToken = '_some_purchase_token_';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
          assert(name === 'buy', 'invalid function name');
          assert(args[0] === productId, 'should get productId as args');
          success({ orderId, purchaseToken });
        };
        await inAppPurchase.buy(productId);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should throw an error on an invalid argument', async (done) => {
      let err1 = false;
      let err2 = false;
      let err3 = false;
      try {
        await inAppPurchase.buy();
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[102]) {
          err1 = true;
        } else {
          done(err);
        }
      }
      try {
        await inAppPurchase.buy([1]);
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[102]) {
          err2 = true;
        } else {
          done(err);
        }
      }
      try {
        await inAppPurchase.buy(1);
      } catch (err) {
        if (err.message === inAppPurchase.utils.errors[102]) {
          err3 = true;
        } else {
          done(err);
        }
      }
      assert(err1, 'should throw an error for no arguments');
      assert(err2, 'should throw an error for an array of int');
      assert(err3, 'should throw an error for an int');
      done();
    });

    it('should return an object with the correct attributes', async (done) => {
      try {
        const productId = 'com.test.prod1';
        const packageName = 'com.test';
        const orderId = '_some_order_id_';
        const purchaseToken = '_some_purchase_token_';
        const signature = '_some_signature_';
        const purchaseTime = Date.now();
        const purchaseState = 0;
        GLOBAL.window.cordova.exec = (success) => {
          success({ productId, orderId, purchaseToken, signature, packageName, purchaseTime, purchaseState });
        };
        const res = await inAppPurchase.buy(productId);
        assert(res.signature === signature);
        assert(res.productId === productId);
        assert(res.transactionId === purchaseToken);
        assert(typeof res.receipt === 'string');
        const receiptJson = JSON.parse(res.receipt);
        assert(receiptJson.orderId === orderId);
        assert(receiptJson.packageName === packageName);
        assert(receiptJson.productId === productId);
        assert(receiptJson.purchaseTime === purchaseTime);
        assert(receiptJson.purchaseState === purchaseState);
        assert(receiptJson.purchaseToken === purchaseToken);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#consume()', () => {

    it('should call the Android buy() function with the correct args ', async (done) => {
      try {
        const receipt = '_some_purchase_token_';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
          assert(name === 'consumePurchase', 'invalid function name');
          assert(args[0] === receipt, 'should get receipt as args');
          success({});
        };
        await inAppPurchase.consume(receipt);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#restorePurchases()', () => {

    it('should call the Android restorePurchases() function with the correct args ', async (done) => {
      try {
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
          assert(name === 'restorePurchases', 'invalid function name');
          success([{}]);
        };
        await inAppPurchase.restorePurchases();
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an array of objects with the correct attributes', async (done) => {
      const productId = 'com.test.prod1';
      const state = 0;
      const date = new Date();
      const token = '_some_purchase_token_';
      const type = 'inapp';
      try {
        GLOBAL.window.cordova.exec = (success) => {
          success([{ productId, state, date, token, type }]);
        };
        const res = await inAppPurchase.restorePurchases();
        assert(res[0].productId === productId);
        assert(res[0].state === state);
        assert(res[0].date === date);
        assert(res[0].token === token);
        assert(res[0].type === type);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

});

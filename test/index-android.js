import inAppPurchase from '../www/index-android';
import assert from 'assert';

describe('Android purchases', () => {

  const execError = code => (success, err, pluginName, name, args) => err({ code });

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
            assert.deepEqual(args, productIds, 'should get productIds as args');
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

    it('should chunk the getSkuDetails call when more than 19 product ids are given', async (done) => {
      try {
        const productIds = [
          '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'
        ];
        const calls = [];
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          if (name === 'getSkuDetails') {
            calls.push(args);
            success([]);
          } else if (name === 'init') {
            success();
          }
        };
        await inAppPurchase.getProducts(productIds);
        assert.deepEqual(calls, [
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19'],
          ['20', '21']
        ],'getSkuDetails() should be called chunked');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an array of objects', async (done) => {
      try {
        const products = [
          { productId: 'com.test.prod1', title: 'prod1 title', description: 'prod1 description', price: '$0.99', currency: 'USD', priceAsDecimal: 0.99 },
          { productId: 'com.test.prod2', title: 'prod2 title', description: 'prod2 description', price: '$1.99', currency: 'USD', priceAsDecimal: 1.99 }
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

    it('should return an errorCode property when there is an error', async (done) => {
      try {
        GLOBAL.window.cordova.exec = execError(-1)
        await inAppPurchase.getProducts(['com.test.prod1']);
        done(new Error('Call to #getProducts() suceeded but was expected to fail.'));
      } catch (err) {
        assert(err.errorCode === -1, 'should create an errorCode property');
        done();
      }
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
        const receipt = '_some_receipt_';
        const purchaseTime = Date.now();
        const purchaseState = 0;
        GLOBAL.window.cordova.exec = (success) => {
          success({ productId, orderId, purchaseToken, signature, packageName, purchaseTime, purchaseState, receipt });
        };
        const res = await inAppPurchase.buy(productId);
        assert(res.signature === signature);
        assert(res.productId === productId);
        assert(res.transactionId === purchaseToken);
        assert(res.receipt === receipt);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an errorCode property when there is an error', async (done) => {
      try {
        GLOBAL.window.cordova.exec = execError(-1);
        await inAppPurchase.buy('com.test.prod1');
        done(new Error('Call to #buy() suceeded but was expected to fail.'));
      } catch (err) {
        assert(err.errorCode === -1, 'should create an errorCode property');
        done();
      }
    });

  });

  describe('#subscribe()', () => {

    it('should call the Android subscribe() function with the correct args ', async (done) => {
      try {
        const productId = 'com.test.prod1';
        const orderId = '_some_order_id_';
        const purchaseToken = '_some_purchase_token_';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
          assert(name === 'subscribe', 'invalid function name');
          assert(args[0] === productId, 'should get productId as args');
          success({ orderId, purchaseToken });
        };
        await inAppPurchase.subscribe(productId);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an errorCode property when there is an error', async (done) => {
      try {
        GLOBAL.window.cordova.exec = execError(-1);
        await inAppPurchase.subscribe('com.test.prod1');
        done(new Error('Call to #subscribe() suceeded but was expected to fail.'));
      } catch (err) {
        assert(err.errorCode === -1, 'should create an errorCode property');
        done();
      }
    });

  });

  describe('#consume()', () => {

    it('should call the Android consume() function with the correct args ', async (done) => {
      try {
        const receipt = '_some_receipt_';
        const signature = '_some_signature_';
        const type = 'inapp';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
          assert(name === 'consumePurchase', 'invalid function name');
          assert(args[0] === type, 'should get type as args 1');
          assert(args[1] === receipt, 'should get receipt as args 2');
          assert(args[2] === signature, 'should get signature as arg 3');
          success({});
        };
        await inAppPurchase.consume(type, receipt, signature);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an errorCode property when there is an error', async(done) => {
      try {
        const receipt = '_some_receipt_';
        const signature = '_some_signature_';
        const type = 'inapp';
        GLOBAL.window.cordova.exec = execError(-1);
        await inAppPurchase.consume(type, receipt, signature);
        done(new Error('Call to #consume() suceeded but was expected to fail.'));
      } catch (err) {
        assert(err.errorCode === -1, 'should create an errorCode property');
        done();
      }
    });

  });

  describe('#restorePurchases()', () => {

    it('should initialize the Android plugin', async (done) => {
      try {
        let initCalled = false;
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          if (name === 'init') {
            assert(typeof success === 'function', 'should define a success callback');
            assert(typeof err === 'function', 'should define an error callback');
            assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
            assert(args.length === 0, 'args should be empty');
            initCalled = true;
            success();
          } else if (name === 'restorePurchases') {
            success([]);
          }
        };
        await inAppPurchase.restorePurchases();
        assert(initCalled, 'init() should be called');
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should call the Android restorePurchases() function with the correct args ', async (done) => {
      try {
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          if (name === 'restorePurchases') {
            assert(typeof success === 'function', 'should define a success callback');
            assert(typeof err === 'function', 'should define an error callback');
            assert(pluginName === 'InAppBillingV3', 'invalid Android plugin name');
            success([{}]);
          } else if (name === 'init') {
            success();
          }
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
      const type = 'inapp';
      try {
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          if (name === 'restorePurchases') {
            success([{ productId, state, date, type }]);
          } else if (name === 'init') {
            success();
          }
        };
        const res = await inAppPurchase.restorePurchases();
        assert(res[0].productId === productId);
        assert(res[0].state === state);
        assert(res[0].date === date);
        assert(res[0].type === type);
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return an errorCode property when there is an error', async(done) => {
      try {
        GLOBAL.window.cordova.exec = execError(-1);
        await inAppPurchase.restorePurchases();
        done(new Error('Call to #restorePurchases() suceeded but was expected to fail.'));
      } catch (err) {
        assert(err.errorCode === -1, 'should create an errorCode property');
        done();
      }
    });

  });

  describe('#getReceipt()', () => {

    it('should always successfully resolve without doing anything', async (done) => {
      try {
        await inAppPurchase.getReceipt();
        done();
      } catch (err) {
        done(err);
      }
    });

  });

});

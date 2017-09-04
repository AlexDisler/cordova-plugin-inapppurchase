import inAppPurchase from '../www/index-ios';
import assert from 'assert';

describe('iOS purchases', () => {

  before(() => {
    GLOBAL.window = {};
    GLOBAL.window.cordova = {};
  });

  describe('#getProducts()', () => {

    it('should call the iOS requestProducts() function with the correct args', async (done) => {
      try {
        const productIds = ['com.test.prod1', 'com.test.prod2'];
        let requestProductsCalled = false;
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'PaymentsPlugin', 'invalid iOS plugin name');
          assert(args[0] === productIds, 'should get productIds as args');
          requestProductsCalled = true;
          success([]);
        };
        await inAppPurchase.getProducts(productIds);
        assert(requestProductsCalled, 'requestProducts() should be called');
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
        GLOBAL.window.cordova.exec = (success) => {
          success({ products });
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

    it('should call the iOS buy() function with the correct args ', async (done) => {
      try {
        const productId = 'com.test.prod1';
        const transactionId = '111111111';
        const receipt = '222222222';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'PaymentsPlugin', 'invalid iOS plugin name');
          assert(name === 'buy', 'invalid function name');
          assert(args[0] === productId, 'should get productId as args');
          success({ productId, transactionId, receipt });
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
        const transactionId = '111111111';
        const receipt = '222222222';
        GLOBAL.window.cordova.exec = (success) => {
          success({ transactionId, receipt });
        };
        const res = await inAppPurchase.buy(productId);
        assert(res.transactionId === transactionId);
        assert(res.receipt === receipt);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#subscribe()', () => {

    it('should call the iOS buy() function with the correct args ', async (done) => {
      try {
        const productId = 'com.test.prod1';
        const transactionId = '111111111';
        const receipt = '222222222';
        GLOBAL.window.cordova.exec = (success, err, pluginName, name, args) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'PaymentsPlugin', 'invalid iOS plugin name');
          assert(name === 'buy', 'invalid function name');
          assert(args[0] === productId, 'should get productId as args');
          success({ productId, transactionId, receipt });
        };
        await inAppPurchase.subscribe(productId);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#consume()', () => {

    it('should always successfully resolve without doing anything', async (done) => {
      try {
        await inAppPurchase.consume();
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#restorePurchases()', () => {

    it('should call the iOS restoreTransactions() function with the correct args ', async (done) => {
      try {
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'PaymentsPlugin', 'invalid iOS plugin name');
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
      const transactionId = '111111111';
      const productId = '111111111';
      const transactionState = 'REFUNDED';
      const date = new Date();
      try {
        GLOBAL.window.cordova.exec = (success) => {
          success({ transactions : [{ transactionId, productId, transactionState, date }]});
        };
        const res = await inAppPurchase.restorePurchases();
        assert(res[0].transactionId === transactionId);
        assert(res[0].productId === productId);
        assert(res[0].state === transactionState);
        assert(res[0].date === date);
        done();
      } catch (err) {
        done(err);
      }
    });

  });

  describe('#getReceipt()', () => {

    it('should call the iOS getReceipt() function', async (done) => {
      try {
        GLOBAL.window.cordova.exec = (success, err, pluginName, name) => {
          assert(typeof success === 'function', 'should define a success callback');
          assert(typeof err === 'function', 'should define an error callback');
          assert(pluginName === 'PaymentsPlugin', 'invalid iOS plugin name');
          assert(name === 'getReceipt', 'invalid function name');
          success('');
        };
        await inAppPurchase.getReceipt();
        done();
      } catch (err) {
        done(err);
      }
    });

  });

});

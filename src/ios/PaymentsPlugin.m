/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

#import "PaymentsPlugin.h"
#import "RMStore.h"

#define NILABLE(obj) ((obj) != nil ? (NSObject *)(obj) : (NSObject *)[NSNull null])

@implementation PaymentsPlugin

- (void)pluginInitialize {
}

- (void)getProducts:(CDVInvokedUrlCommand *)command {
  id productIds = [command.arguments objectAtIndex:0];

  if (![productIds isKindOfClass:[NSArray class]]) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"ProductIds must be an array"];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }

  NSSet *products = [NSSet setWithArray:productIds];
  [[RMStore defaultStore] requestProducts:products success:^(NSArray *products, NSArray *invalidProductIdentifiers) {

    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    NSMutableArray *validProducts = [NSMutableArray array];
    for (SKProduct *product in products) {
      [validProducts addObject:@{
                                 @"productId": NILABLE(product.productIdentifier),
                                 @"title": NILABLE(product.localizedTitle),
                                 @"description": NILABLE(product.localizedDescription),
                                 @"price": NILABLE([RMStore localizedPriceOfProduct:product]),
                              }];
    }
    [result setObject:validProducts forKey:@"products"];
    [result setObject:invalidProductIdentifiers forKey:@"invalidProductsIds"];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  } failure:^(NSError *error) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{
                                                                                                                   @"errorCode": NILABLE([NSNumber numberWithInteger:error.code]),
                                                                                                                   @"errorMessage": NILABLE(error.localizedDescription)
                                                                                                                   }];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

- (void)buy:(CDVInvokedUrlCommand *)command {
  id productId = [command.arguments objectAtIndex:0];
  if (![productId isKindOfClass:[NSString class]]) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"ProductId must be a string"];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    return;
  }
  [[RMStore defaultStore] addPayment:productId success:^(SKPaymentTransaction *transaction) {
    NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptURL];

    NSString *encReceipt = [receiptData base64EncodedStringWithOptions:0];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{
                                                                                                                   @"transactionId": NILABLE(transaction.transactionIdentifier),
                                                                                                                   @"productId": NILABLE(transaction.payment.productIdentifier),
                                                                                                                   @"receipt": NILABLE(encReceipt)
                                                                                                                   }];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

  } failure:^(SKPaymentTransaction *transaction, NSError *error) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{
                                                                                                                   @"errorCode": NILABLE([NSNumber numberWithInteger:error.code]),
                                                                                                                   @"errorMessage": NILABLE(error.localizedDescription)
                                                                                                                   }];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];

}

- (void)restorePurchases:(CDVInvokedUrlCommand *)command {
  [[RMStore defaultStore] restoreTransactionsOnSuccess:^(NSArray *transactions){
    NSMutableArray *validTransactions = [NSMutableArray array];
    NSMutableDictionary *result = [NSMutableDictionary dictionary];
    for (SKPaymentTransaction *transaction in transactions) {
      [validTransactions addObject:@{
                                 @"productId": NILABLE(transaction.payment.productIdentifier),
                                 @"date": NILABLE(transaction.transactionDate),
                                 @"transactionId": NILABLE(transaction.transactionIdentifier),
                                 @"transactionState": NILABLE([NSNumber numberWithInteger:transaction.transactionState])
                                 }];
    }
    [result setObject:validTransactions forKey:@"transactions"];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  } failure:^(NSError *error) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:@{
                                                                                                                   @"errorCode": NILABLE([NSNumber numberWithInteger:error.code]),
                                                                                                                   @"errorMessage": NILABLE(error.localizedDescription)
                                                                                                                   }];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }];
}

@end

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
#import "RMAppReceipt.h"

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
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    formatter.timeZone = [NSTimeZone timeZoneForSecondsFromGMT:0];
    formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss'Z'";
    for (SKPaymentTransaction *transaction in transactions) {
      NSString *transactionDateString = [formatter stringFromDate:transaction.transactionDate];
      [validTransactions addObject:@{
                                 @"productId": NILABLE(transaction.payment.productIdentifier),
                                 @"date": NILABLE(transactionDateString),
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


- (void)getReceiptBundle:(CDVInvokedUrlCommand *)command {
  NSMutableDictionary *result = [NSMutableDictionary dictionary];
  NSMutableArray *inAppPurchases = [NSMutableArray array];

  @try {
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
    formatter.timeZone = [NSTimeZone timeZoneForSecondsFromGMT:0];
    formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss'Z'";

    for (id iap in [[RMAppReceipt bundleReceipt] inAppPurchases]) {
      if ([iap isKindOfClass:[RMAppReceiptIAP class]]) {
        RMAppReceiptIAP *receiptIAP = (RMAppReceiptIAP *)iap;
        NSString *purchaseDateString = [formatter stringFromDate:receiptIAP.purchaseDate];
        NSString *subscriptionExpirationDateString = [formatter stringFromDate:receiptIAP.subscriptionExpirationDate];
        NSString *cancellationDateString = [formatter stringFromDate:receiptIAP.cancellationDate];
        NSString *originalPurchaseDateString = [formatter stringFromDate:receiptIAP.originalPurchaseDate];

        [inAppPurchases addObject:@{
          @"productId": NILABLE(receiptIAP.productIdentifier),
          @"purchaseDate": NILABLE(purchaseDateString),
          @"originalPurchaseDate": NILABLE(originalPurchaseDateString),
          @"subscriptionExpirationDate": NILABLE(subscriptionExpirationDateString),
          @"cancellationDate": NILABLE(cancellationDateString),
          @"transactionIdentifier": NILABLE(receiptIAP.transactionIdentifier),
          @"originalTransactionIdentifier": NILABLE(receiptIAP.originalTransactionIdentifier),
          @"quantity": NILABLE([NSNumber numberWithInteger:receiptIAP.quantity]),
          @"webOrderLineItemID": NILABLE([NSNumber numberWithInteger:receiptIAP.webOrderLineItemID])
        }];
      }
    }

    [result setObject:inAppPurchases forKey:@"inAppPurchases"];
    [result setValue:[[RMAppReceipt bundleReceipt] appVersion] forKey:@"appVersion"];
    [result setValue:[[RMAppReceipt bundleReceipt] originalAppVersion] forKey:@"originalAppVersion"];
    [result setValue:[[RMAppReceipt bundleReceipt] bundleIdentifier] forKey:@"bundleIdentifier"];

    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }

  @catch (NSException *exception) {
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_JSON_EXCEPTION
                                    messageAsString:[exception reason]];
    [pluginResult setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
  }
}

- (void)getReceipt:(CDVInvokedUrlCommand *)command {
  [[RMStore defaultStore] refreshReceiptOnSuccess:^{
    NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptURL];
    NSString *encReceipt = [receiptData base64EncodedStringWithOptions:0];
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:@{@"receipt": NILABLE(encReceipt) }];
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

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
  [[RMStore defaultStore] addStoreObserver:self];
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

      NSString *country = [product.priceLocale objectForKey:NSLocaleCountryCode];
      NSString *currencyCode = [product.priceLocale objectForKey:NSLocaleCurrencyCode];

      NSNumber *isIntroductoryPriceSupported = @0;
      NSDictionary *introductoryPriceInfo = nil;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 110200
      if (@available(iOS 11.2, *)) {
        isIntroductoryPriceSupported = @1;
        if (product.introductoryPrice) {
          SKProductDiscount *ip = product.introductoryPrice;
          NSLocale *ipPriceLocale = ip.priceLocale;
          if (!ipPriceLocale) {
            ipPriceLocale = product.priceLocale;
          }

          introductoryPriceInfo = @{
                                    @"price": NILABLE([RMStore localizedPriceStringWithPrice:ip.price priceLocale:ipPriceLocale]),
                                    @"priceRaw": NILABLE([ip.price stringValue]),
                                    @"country": NILABLE([ipPriceLocale objectForKey:NSLocaleCountryCode]),
                                    @"currency": NILABLE([ipPriceLocale objectForKey:NSLocaleCurrencyCode]),
                                    @"paymentMode": NILABLE([RMStore stringForPaymentMode:ip.paymentMode]),
                                    @"numberOfPeriods": [NSString stringWithFormat:@"%lu", ip.numberOfPeriods],
                                    @"subscriptionPeriod": @{
                                            @"unit": [RMStore stringForPeriodUnit:ip.subscriptionPeriod.unit],
                                            @"numberOfUnits": [NSString stringWithFormat:@"%lu", ip.subscriptionPeriod.numberOfUnits],
                                        }
                                    };
        }
      }
#endif

      [validProducts addObject:@{
                                 @"productId": NILABLE(product.productIdentifier),
                                 @"title": NILABLE(product.localizedTitle),
                                 @"description": NILABLE(product.localizedDescription),
                                 @"priceAsDecimal": NILABLE(product.price),
                                 @"priceRaw": NILABLE([product.price stringValue]),
                                 @"price": NILABLE([RMStore localizedPriceOfProduct:product]),
                                 @"country": NILABLE(country),
                                 @"currency": NILABLE(currencyCode),
                                 @"introductoryPrice": NILABLE(introductoryPriceInfo),
                                 @"introductoryPriceSupported": isIntroductoryPriceSupported
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


#pragma mark -
#pragma mark Store Observer

- (void)storePaymentTransactionFinished:(NSNotification*)notification
{
    NSDictionary *userInfo = notification.userInfo;
    SKPaymentTransaction *transaction = userInfo[@"transaction"];
    NSString *productId = userInfo[@"productIdentifier"];

    // NSLog(@"Transaction Finished : %@ (productId: %@)", transaction, productId);

    NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
    NSData *receiptData = [NSData dataWithContentsOfURL:receiptURL];
    NSString *encReceipt = [receiptData base64EncodedStringWithOptions:0];

    if (!encReceipt) {
        encReceipt = @"";
    }

    NSDictionary *event = @{@"productId": productId, @"transactionId": transaction.transactionIdentifier, @"receipt": encReceipt};
    NSError *error = nil;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:event options:0 error:&error];
    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];

    NSString *js = [NSString stringWithFormat:@"cordova.fireDocumentEvent('transactionfinished', %@);", jsonString];
    [self.commandDelegate evalJs:js];
}

@end

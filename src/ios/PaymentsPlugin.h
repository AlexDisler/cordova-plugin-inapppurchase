/*!
 *
 * Author: Alex Disler (alexdisler.com)
 * github.com/alexdisler/cordova-plugin-inapppurchase
 *
 * Licensed under the MIT license. Please see README for more information.
 *
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface PaymentsPlugin : CDVPlugin

- (void)getProducts:(CDVInvokedUrlCommand *)command;
- (void)buy:(CDVInvokedUrlCommand *)command;
- (void)restorePurchases:(CDVInvokedUrlCommand *)command;
- (void)getReceipt:(CDVInvokedUrlCommand *)command;

@end

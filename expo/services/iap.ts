import * as InAppPurchases from 'expo-in-app-purchases';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubscriptionProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  type: 'subscription';
  duration: 'monthly' | 'annual';
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
  receipt?: string;
}

export interface ReceiptValidationResult {
  valid: boolean;
  isSandbox: boolean;
  productId?: string;
  expiresDate?: Date;
  error?: string;
}

class IAPService {
  private isInitialized = false;
  private products: SubscriptionProduct[] = [];
  private purchaseUpdateListener: any = null;

  // Product IDs matching App Store Connect
  private readonly PRODUCT_IDS = {
    MONTHLY: 'com.rork.soluna.monthly.premium',
    ANNUAL: 'com.rork.soluna.premium.annual',
  };

  // App Store receipt validation URLs
  private readonly RECEIPT_VALIDATION_URLS = {
    PRODUCTION: 'https://buy.itunes.apple.com/verifyReceipt',
    SANDBOX: 'https://sandbox.itunes.apple.com/verifyReceipt',
  };

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (Platform.OS !== 'ios') {
        console.log('IAP only supported on iOS');
        return false;
      }

      // Initialize the IAP service
      await InAppPurchases.connectAsync();
      
      // Set up purchase update listener
      this.purchaseUpdateListener = InAppPurchases.setPurchaseListener(this.handlePurchaseUpdate.bind(this));
      
      // Get available products
      const products = await InAppPurchases.getProductsAsync([
        this.PRODUCT_IDS.MONTHLY,
        this.PRODUCT_IDS.ANNUAL,
      ]);

      this.products = products.map(product => ({
        productId: product.productId,
        price: product.price,
        currency: product.currencyCode || 'USD',
        title: product.title,
        description: product.description,
        type: 'subscription' as const,
        duration: product.productId === this.PRODUCT_IDS.MONTHLY ? 'monthly' : 'annual',
      }));

      this.isInitialized = true;
      console.log('IAP initialized successfully', this.products);
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      return false;
    }
  }

  private async handlePurchaseUpdate(purchase: any): Promise<void> {
    try {
      console.log('Purchase update received:', purchase);
      
      if (purchase.responseCode === InAppPurchases.IAPResponseCode.OK) {
        // Validate receipt
        const validation = await this.validateReceipt(purchase.receiptData);
        
        if (validation.valid) {
          // Store the purchase
          await this.storePurchase(purchase.productId, purchase.transactionId, purchase.receiptData);
          
          // Update user premium status
          await this.updateUserPremiumStatus(purchase.productId, validation.expiresDate);
        }
      }
    } catch (error) {
      console.error('Error handling purchase update:', error);
    }
  }

  async getProducts(): Promise<SubscriptionProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.products;
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'In-App Purchases only supported on iOS',
        };
      }

      // Purchase the product
      const result = await InAppPurchases.purchaseItemAsync(productId);
      
      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        // Validate receipt
        const validation = await this.validateReceipt(result.receiptData);
        
        if (validation.valid) {
          // Store purchase locally
          await this.storePurchase(productId, result.transactionId, result.receiptData);
          
          // Update user premium status
          await this.updateUserPremiumStatus(productId, validation.expiresDate);
          
          return {
            success: true,
            productId,
            transactionId: result.transactionId,
            receipt: result.receiptData,
          };
        } else {
          return {
            success: false,
            error: validation.error || 'Receipt validation failed',
          };
        }
      } else {
        // Handle specific error codes
        let errorMessage = `Purchase failed with code: ${result.responseCode}`;
        
        switch (result.responseCode) {
          case InAppPurchases.IAPResponseCode.USER_CANCELED:
            errorMessage = 'Purchase was cancelled';
            break;
          case InAppPurchases.IAPResponseCode.PAYMENT_INVALID:
            errorMessage = 'Payment method is invalid';
            break;
          case InAppPurchases.IAPResponseCode.PAYMENT_NOT_ALLOWED:
            errorMessage = 'Payment not allowed on this device';
            break;
          case InAppPurchases.IAPResponseCode.STORE_PRODUCT_NOT_AVAILABLE:
            errorMessage = 'Product not available for purchase';
            break;
          case InAppPurchases.IAPResponseCode.CLOUD_SERVICE_PERMISSION_DENIED:
            errorMessage = 'Cloud service permission denied';
            break;
          case InAppPurchases.IAPResponseCode.CLOUD_SERVICE_NETWORK_CONNECTION_FAILED:
            errorMessage = 'Network connection failed';
            break;
          case InAppPurchases.IAPResponseCode.CLOUD_SERVICE_REVOKED:
            errorMessage = 'Cloud service access revoked';
            break;
          default:
            errorMessage = `Purchase failed with code: ${result.responseCode}`;
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateReceipt(receiptData: string): Promise<ReceiptValidationResult> {
    try {
      // First try production validation
      let validation = await this.validateReceiptWithApple(receiptData, this.RECEIPT_VALIDATION_URLS.PRODUCTION);
      
      // If production validation fails with sandbox error, try sandbox
      if (!validation.valid && validation.error?.includes('sandbox')) {
        console.log('Production validation failed, trying sandbox...');
        validation = await this.validateReceiptWithApple(receiptData, this.RECEIPT_VALIDATION_URLS.SANDBOX);
        validation.isSandbox = true;
      }
      
      return validation;
    } catch (error) {
      console.error('Receipt validation error:', error);
      return {
        valid: false,
        isSandbox: false,
        error: error instanceof Error ? error.message : 'Receipt validation failed',
      };
    }
  }

  private async validateReceiptWithApple(receiptData: string, url: string): Promise<ReceiptValidationResult> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receipt-data': receiptData,
          'password': '', // No shared secret for auto-renewable subscriptions
          'exclude-old-transactions': true,
        }),
      });

      const result = await response.json();
      
      if (result.status === 0) {
        // Valid receipt
        const latestReceiptInfo = result.latest_receipt_info || result.receipt?.in_app || [];
        const latestTransaction = latestReceiptInfo[latestReceiptInfo.length - 1];
        
        if (latestTransaction) {
          const expiresDate = new Date(parseInt(latestTransaction.expires_date_ms));
          const now = new Date();
          
          return {
            valid: true,
            isSandbox: false,
            productId: latestTransaction.product_id,
            expiresDate: expiresDate > now ? expiresDate : undefined,
          };
        }
      } else if (result.status === 21007) {
        // Sandbox receipt used in production
        return {
          valid: false,
          isSandbox: true,
          error: 'Sandbox receipt used in production',
        };
      } else {
        return {
          valid: false,
          isSandbox: false,
          error: `Receipt validation failed with status: ${result.status}`,
        };
      }
      
      return {
        valid: false,
        isSandbox: false,
        error: 'Invalid receipt format',
      };
    } catch (error) {
      console.error('Apple receipt validation error:', error);
      return {
        valid: false,
        isSandbox: false,
        error: error instanceof Error ? error.message : 'Network error during validation',
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (Platform.OS !== 'ios') {
        return [];
      }

      const result = await InAppPurchases.getPurchaseHistoryAsync(true);
      const purchases: PurchaseResult[] = [];

      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        for (const purchase of result.results || []) {
          // Validate each receipt
          const validation = await this.validateReceipt(purchase.receiptData);
          
          if (validation.valid) {
            await this.storePurchase(purchase.productId, purchase.transactionId, purchase.receiptData);
            await this.updateUserPremiumStatus(purchase.productId, validation.expiresDate);
            
            purchases.push({
              success: true,
              productId: purchase.productId,
              transactionId: purchase.transactionId,
              receipt: purchase.receiptData,
            });
          }
        }
      } else {
        console.error('Failed to restore purchases:', result.responseCode);
      }

      return purchases;
    } catch (error) {
      console.error('Restore purchases error:', error);
      return [];
    }
  }

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const storedPurchases = await AsyncStorage.getItem('user_purchases');
      if (!storedPurchases) return false;

      const purchases = JSON.parse(storedPurchases);
      const now = new Date();

      // Check if any subscription is still valid
      for (const purchase of purchases) {
        if (purchase.expiresDate) {
          const expiryDate = new Date(purchase.expiresDate);
          if (now < expiryDate) return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  private async storePurchase(productId: string, transactionId: string, receiptData: string): Promise<void> {
    try {
      const storedPurchases = await AsyncStorage.getItem('user_purchases');
      const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
      
      // Remove any existing purchases for this product
      const filteredPurchases = purchases.filter((p: any) => p.productId !== productId);
      
      // Add new purchase
      filteredPurchases.push({
        productId,
        transactionId,
        receiptData,
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem('user_purchases', JSON.stringify(filteredPurchases));
    } catch (error) {
      console.error('Error storing purchase:', error);
    }
  }

  private async updateUserPremiumStatus(productId: string, expiresDate?: Date): Promise<void> {
    try {
      // Update user premium status in the app state
      const userData = await AsyncStorage.getItem('soluna_user_v4');
      if (userData) {
        const user = JSON.parse(userData);
        user.isPremium = true;
        user.subscriptionId = productId;
        user.premiumExpiresAt = expiresDate?.toISOString();
        
        await AsyncStorage.setItem('soluna_user_v4', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user premium status:', error);
    }
  }

  async showPurchaseAlert(product: SubscriptionProduct): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Upgrade to Premium',
        `Unlock all premium features with ${product.title} for ${product.price}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Purchase',
            onPress: async () => {
              const result = await this.purchaseProduct(product.productId);
              if (result.success) {
                Alert.alert('Success!', 'Welcome to Premium! Enjoy all the features.');
                resolve(true);
              } else {
                Alert.alert('Purchase Failed', result.error || 'Please try again.');
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  async disconnect(): Promise<void> {
    try {
      if (this.purchaseUpdateListener) {
        this.purchaseUpdateListener.remove();
        this.purchaseUpdateListener = null;
      }
      
      if (this.isInitialized) {
        await InAppPurchases.disconnectAsync();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error disconnecting IAP:', error);
    }
  }
}

export const iapService = new IAPService();
export default iapService;
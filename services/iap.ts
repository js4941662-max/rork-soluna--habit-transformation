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
}

class IAPService {
  private isInitialized = false;
  private products: SubscriptionProduct[] = [];

  // Product IDs matching App Store Connect
  private readonly PRODUCT_IDS = {
    MONTHLY: 'com.rork.soluna.monthly.premium',
    ANNUAL: 'com.rork.soluna.premium.annual',
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
        // Store purchase locally
        await this.storePurchase(productId, result.transactionId);
        
        return {
          success: true,
          productId,
          transactionId: result.transactionId,
        };
      } else {
        return {
          success: false,
          error: `Purchase failed with code: ${result.responseCode}`,
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

  async restorePurchases(): Promise<PurchaseResult[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (Platform.OS !== 'ios') {
        return [];
      }

      const result = await InAppPurchases.getPurchaseHistoryAsync();
      const purchases: PurchaseResult[] = [];

      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        for (const purchase of result.results || []) {
          await this.storePurchase(purchase.productId, purchase.transactionId);
          purchases.push({
            success: true,
            productId: purchase.productId,
            transactionId: purchase.transactionId,
          });
        }
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
      const now = Date.now();

      // Check if any subscription is still valid
      for (const purchase of purchases) {
        if (purchase.productId === this.PRODUCT_IDS.MONTHLY) {
          const expiryTime = purchase.timestamp + (30 * 24 * 60 * 60 * 1000); // 30 days
          if (now < expiryTime) return true;
        } else if (purchase.productId === this.PRODUCT_IDS.ANNUAL) {
          const expiryTime = purchase.timestamp + (365 * 24 * 60 * 60 * 1000); // 365 days
          if (now < expiryTime) return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  private async storePurchase(productId: string, transactionId: string): Promise<void> {
    try {
      const storedPurchases = await AsyncStorage.getItem('user_purchases');
      const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
      
      purchases.push({
        productId,
        transactionId,
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem('user_purchases', JSON.stringify(purchases));
    } catch (error) {
      console.error('Error storing purchase:', error);
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


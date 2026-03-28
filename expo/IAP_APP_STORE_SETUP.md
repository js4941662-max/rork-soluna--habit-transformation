# In-App Purchase Setup for App Store Connect

## Product Configuration

### Required Products in App Store Connect:

1. **Monthly Premium Subscription**
   - Product ID: `com.rork.soluna.monthly.premium`
   - Type: Auto-Renewable Subscription
   - Duration: 1 Month
   - Price: $2.99 USD
   - Reference Name: "Soluna Monthly Premium"

2. **Annual Premium Subscription**
   - Product ID: `com.rork.soluna.premium.annual`
   - Type: Auto-Renewable Subscription
   - Duration: 1 Year
   - Price: $19.99 USD
   - Reference Name: "Soluna Annual Premium"

### Subscription Group Setup:

1. Create a subscription group called "Soluna Premium"
2. Add both products to this group
3. Set the order (Annual first, then Monthly)
4. Configure upgrade/downgrade options

## App Store Connect Configuration Steps:

### 1. Create In-App Purchase Products:
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Click "+" to create new products
3. Select "Auto-Renewable Subscriptions"
4. Create both products with the exact Product IDs above

### 2. Configure Subscription Group:
1. Go to App Store Connect → Your App → Features → Subscriptions
2. Create a new subscription group: "Soluna Premium"
3. Add both products to this group
4. Set the display order (Annual first, then Monthly)

### 3. Add App Review Information:
1. For each product, add:
   - Display Name: "Soluna Monthly Premium" / "Soluna Annual Premium"
   - Description: "Unlock unlimited habits and AI insights"
   - App Review Screenshot: Screenshot of the premium screen
   - App Review Notes: "This is a habit tracking app with premium features"

### 4. Submit for Review:
1. Go to your app version in App Store Connect
2. In the "In-App Purchases" section, select both products
3. Submit the app version for review

## Testing in Sandbox:

### 1. Create Sandbox Testers:
1. Go to App Store Connect → Users and Access → Sandbox Testers
2. Create test accounts with different regions
3. Use these accounts on test devices

### 2. Test Purchase Flow:
1. Install the app on a test device
2. Sign out of App Store
3. Sign in with sandbox tester account
4. Test both subscription purchases
5. Test restore purchases functionality

## Important Notes:

- **iPhone Only**: App is configured for iPhone only (no iPad support)
- **Screenshots**: Only iPhone screenshots should be uploaded
- **Sandbox Testing**: The app properly handles sandbox environment
- **Error Handling**: Comprehensive error handling for all IAP scenarios
- **Receipt Validation**: Server-side validation recommended for production

## Troubleshooting:

### Common Issues:
1. **"Sandbox receipt used in production"**: Normal in testing, handled by the app
2. **Products not loading**: Check Product IDs match exactly
3. **Purchase fails**: Ensure sandbox tester account is used
4. **Restore fails**: Check internet connection and Apple ID

### Debug Information:
- All IAP operations are logged to console
- Error codes are properly handled and displayed to users
- Purchase history is stored locally for offline access

## Next Steps After Approval:

1. Monitor subscription metrics in App Store Connect
2. Set up server-side receipt validation
3. Implement subscription management features
4. Add analytics for conversion tracking

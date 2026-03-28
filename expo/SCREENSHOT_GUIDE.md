# 📸 **IPHONE SCREENSHOT GUIDE - APP STORE SUBMISSION**

## **CRITICAL: REMOVE ALL IPAD SCREENSHOTS**

Apple rejected your app because you uploaded iPad screenshots instead of iPhone screenshots. This is a common mistake that must be fixed immediately.

## **REQUIRED SCREENSHOT SIZES**

### **iPhone 15 Pro Max (6.7" Display)**
- **Resolution**: 1290 x 2796 pixels
- **Device**: iPhone 15 Pro Max, iPhone 14 Pro Max, iPhone 13 Pro Max

### **iPhone 14 Plus (6.5" Display)**  
- **Resolution**: 1284 x 2778 pixels
- **Device**: iPhone 14 Plus, iPhone 13 Pro Max, iPhone 12 Pro Max

### **iPhone 8 Plus (5.5" Display)**
- **Resolution**: 1242 x 2208 pixels
- **Device**: iPhone 8 Plus, iPhone 7 Plus, iPhone 6s Plus

## **SCREENSHOT CONTENT REQUIREMENTS**

### **Screenshot 1: Main Habit Tracking Screen**
- Show habit list with progress
- Display active streaks
- Include "Add Habit" button
- Show completion checkboxes

### **Screenshot 2: Premium Subscription Screen**
- Display pricing options
- Show monthly ($2.99) and annual ($19.99) plans
- Include "Upgrade Now" buttons
- Highlight premium features

### **Screenshot 3: Analytics Dashboard**
- Show progress charts
- Display streak statistics
- Include achievement badges
- Show success metrics

### **Screenshot 4: Habit Completion Flow**
- Show habit being completed
- Display streak counter
- Include celebration animation
- Show progress indicators

### **Screenshot 5: Settings/Profile Screen**
- Show user profile
- Display app settings
- Include premium status
- Show achievement count

## **HOW TO TAKE SCREENSHOTS**

### **Method 1: Using iPhone Simulator (Recommended)**
1. **Open Xcode**
2. **Go to**: Window → Devices and Simulators
3. **Select iPhone 15 Pro Max simulator**
4. **Run your app** in the simulator
5. **Take screenshots** using Cmd+S
6. **Repeat for all required sizes**

### **Method 2: Using Physical iPhone**
1. **Open Soluna app** on your iPhone
2. **Navigate to each screen**
3. **Take screenshots** using Volume Up + Power button
4. **Transfer to computer** via AirDrop or cable

## **SCREENSHOT EDITING REQUIREMENTS**

### **DO NOT INCLUDE**:
- ❌ Status bar (time, battery, signal)
- ❌ Home indicator
- ❌ Notch or Dynamic Island
- ❌ Marketing text overlays
- ❌ App Store badges
- ❌ Watermarks

### **DO INCLUDE**:
- ✅ Full app interface
- ✅ Real app functionality
- ✅ Actual user data (if any)
- ✅ All UI elements
- ✅ Proper aspect ratio

## **STEP-BY-STEP PROCESS**

### **Step 1: Remove iPad Screenshots**
1. **Login to App Store Connect**
2. **Go to**: My Apps → Soluna → App Store → iOS App
3. **Click**: "View All Sizes in Media Manager"
4. **Delete all iPad screenshots**
5. **Confirm deletion**

### **Step 2: Take iPhone Screenshots**
1. **Use iPhone Simulator** (easiest method)
2. **Set simulator to iPhone 15 Pro Max**
3. **Run Soluna app**
4. **Navigate through all screens**
5. **Take screenshots of each required screen**

### **Step 3: Edit Screenshots**
1. **Open screenshots in image editor**
2. **Crop to exact dimensions**:
   - 1290 x 2796 (6.7")
   - 1284 x 2778 (6.5")
   - 1242 x 2208 (5.5")
3. **Remove status bar and home indicator**
4. **Save as PNG files**

### **Step 4: Upload to App Store Connect**
1. **Go to**: App Store Connect → Soluna → App Store
2. **Click**: "Add Screenshot"
3. **Upload each screenshot** in correct size
4. **Verify all screenshots are iPhone-only**
5. **Save changes**

## **VERIFICATION CHECKLIST**

- [ ] All iPad screenshots removed
- [ ] iPhone 15 Pro Max screenshots (1290 x 2796)
- [ ] iPhone 14 Plus screenshots (1284 x 2778)
- [ ] iPhone 8 Plus screenshots (1242 x 2208)
- [ ] Screenshots show actual app functionality
- [ ] No marketing materials included
- [ ] Status bar and home indicator removed
- [ ] All screenshots uploaded successfully

## **COMMON MISTAKES TO AVOID**

1. **❌ Uploading iPad screenshots** (causes rejection)
2. **❌ Including status bar** (not allowed)
3. **❌ Using marketing images** (must show real app)
4. **❌ Wrong aspect ratio** (must match device exactly)
5. **❌ Missing required sizes** (need all 3 sizes)

## **QUICK FIX COMMANDS**

### **Using iPhone Simulator**:
```bash
# Open iPhone 15 Pro Max simulator
xcrun simctl boot "iPhone 15 Pro Max"

# Run your app
npx expo start --ios

# Take screenshots (Cmd+S in simulator)
```

### **Using Physical Device**:
```bash
# Build and install on device
npx eas build --platform ios --profile development
npx eas install --platform ios
```

## **EXPECTED RESULTS**

After uploading proper iPhone screenshots:
- ✅ **App Store approval** within 24-48 hours
- ✅ **No more screenshot rejections**
- ✅ **App appears correctly in App Store**
- ✅ **Users see proper iPhone interface**

---

**Priority**: 🚨 **CRITICAL - MUST FIX IMMEDIATELY**
**Timeline**: **2-4 hours to complete**
**Impact**: **App will be approved after fixes**

# Dat Expense

Dat Expense is an Android expense tracking app built with React Native and Expo.

The app is used to record and track expenses. Expenses can be added manually or detected from supported payment SMS messages received from sender `455`. Dat Expense reads the payment details from the SMS, extracts the transaction information and saves the expense in the application.

The application supports MVR, USD and EUR transactions. Foreign currency transactions are converted to MVR while the original amount, currency and exchange rate used for the transaction are also stored.

Users can categorise expenses, change the category of existing transactions and allow Dat Expense to remember categories for specific merchants.

## GitHub Repository

The complete Dat Expense source code is available on GitHub:

https://github.com/Yoosuf-Eenas-Jaufar/dat-expense

The project can be downloaded from GitHub as a ZIP file or cloned using Git.

### Clone the Repository

```bash
git clone https://github.com/Yoosuf-Eenas-Jaufar/dat-expense.git
cd dat-expense

## Features

- Manual expense entry
- Automatic payment SMS detection on Android
- Manual payment SMS scanning
- Support for MVR, USD and EUR transactions
- Foreign currency to MVR conversion
- Original foreign currency amount is preserved
- Exchange rate used for a transaction is stored with the expense
- Monthly spending overview
- Total spending by category
- The five most recent transactions are displayed on the Home screen
- Full transaction history
- Custom expense categories
- Create, rename and delete categories
- Protected Uncategorized category
- Change the category of an existing transaction
- Merchant category learning
- Already-scanned protection using payment reference numbers
- Persistent local storage
- Automatic SMS scanning when enabled and the app starts or becomes active again
- Custom Dat Expense loading screen
- Bottom-tab navigation

## How SMS Import Works

Dat Expense has a custom Android SMS reader that reads supported payment messages received from sender `455`.

A supported payment SMS contains information such as:

- Account suffix
- Transaction date
- Transaction time
- Currency
- Amount
- Merchant
- Reference number
- Approval code

This information is extracted by the SMS parser and converted into an expense that can be stored by the application.

The reference number is used to check whether the payment has already been scanned. If the same reference number already exists in Dat Expense, the payment is not imported again and is treated as Already scanned.

Automatic SMS detection can be enabled or disabled from the Settings screen.

The **Scan Payments Now** button can also be used to manually scan payment messages, even when automatic SMS detection is disabled.

## Manual Expense Entry

Users are not required to rely only on payment SMS messages. Expenses can also be entered manually.

The Add Expense screen includes:

- Amount
- Currency
- Exchange rate when required
- Merchant
- Transaction date
- Category
- Save Expense button

Supported currencies are:

- MVR
- USD
- EUR

MVR expenses use an exchange rate of `1`.

When USD or EUR is selected, a valid exchange rate is required so that Dat Expense can calculate the MVR value while preserving the original foreign currency and amount.

After the expense is saved, it appears in the transaction history and is included in the relevant spending totals.

## Merchant Category Learning

Dat Expense can remember how a user categorises a merchant.

When the category of an existing transaction is changed, Dat Expense asks whether the merchant should be remembered.

If the user selects **No**, only the selected transaction is changed.

If the user selects **Yes**:

1. The selected transaction is updated.
2. Existing transactions from the same normalised merchant are updated.
3. A merchant category rule is saved.
4. Future transactions from the same merchant automatically use the learned category.

The merchant rule is stored locally and remains available when the application is restarted.

## Currency Handling

The base currency used by Dat Expense is MVR.

Supported currencies are:

- MVR
- USD
- EUR

MVR expenses use an exchange rate of `1`.

USD and EUR transactions store:

- Original amount
- Original currency
- Exchange rate used for the transaction
- Calculated MVR amount

The exchange rate used for a transaction is stored with the expense. This means that previous spending totals do not change if exchange rates change later.

For automatically imported USD and EUR payments, Dat Expense attempts to retrieve a historical exchange rate for the transaction date.

If a rate for the exact transaction date is unavailable, the application can use an available rate from an earlier date.

The exchange rate that was used and the calculated MVR amount are then stored with the transaction.

## Categories

Dat Expense includes a number of default expense categories:

- Uncategorized
- Food
- Groceries
- Transport
- Shopping
- Bills
- Subscriptions
- Entertainment
- Health
- Education
- Other

Users can also create their own categories.

Custom categories can be:

- Created
- Renamed
- Deleted

The Uncategorized category is protected because it is used as the fallback category when an expense does not have another valid category.

If a custom category that is already being used is deleted, the affected expenses are moved to Uncategorized.

Merchant rules connected to the deleted category are also removed.

## Home Screen

The Home screen gives the user an overview of spending for the current month.

It displays:

- Total amount spent during the current month
- Number of transactions
- Spending totals by category
- Five most recent transactions
- Original foreign amount for USD and EUR transactions
- View all option for the full transaction history
- Add Expense button

## Transactions Screen

The Transactions screen displays the expense history.

Transaction information can include:

- Merchant
- Category
- MVR amount
- Original foreign amount when applicable
- Transaction date and time
- Payment reference number
- SMS or MANUAL source

Users can also change the category of an existing transaction from this screen.

When changing a category, the user can decide whether Dat Expense should remember that merchant for future transactions.

## Categories Screen

The Categories screen allows users to manage expense categories.

Users can:

- View available categories
- Create a new category
- Rename a category
- Delete custom categories
- View learned merchant category rules

The Uncategorized category cannot be deleted.

## Settings Screen

The Settings screen contains controls and information related to SMS detection and the application.

It includes:

- Automatic SMS detection toggle
- SMS permission and status information
- Scan Payments Now button
- Last successful SMS scan time
- Base currency information
- Manual payment message importer
- Already-scanned protection information
- Application information

Turning automatic SMS detection off does not remove the ability to scan manually.

## Data Persistence

Dat Expense uses MobX for application state management.

`mobx-persist-store` and AsyncStorage are used to store application data locally on the Android device.

The following information is persisted:

- Expenses
- Categories
- Merchant category rules
- Last successful SMS scan time

This allows the information to remain available after the application is completely closed and restarted.

Dat Expense does not require a user account or login.

## Technologies Used

Dat Expense was developed using:

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- React
- MobX
- MobX React Lite
- mobx-persist-store
- AsyncStorage
- Expo Vector Icons
- React Navigation
- React Native Safe Area Context
- React Native Gesture Handler
- Android native module written in Kotlin
- Android READ_SMS permission

## Project Structure

Important parts of the project include:

```text
dat-expense/
├── modules/
│   └── dat-sms-reader/
│       └── android/
│           └── src/main/java/
│               └── expo/modules/datsmsreader/
│                   └── DatSmsReaderModule.kt
│
├── screenshots/
│
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── index.tsx
│   │   │   ├── transactions.tsx
│   │   │   ├── categories.tsx
│   │   │   ├── settings.tsx
│   │   │   └── _layout.tsx
│   │   ├── add-expense.tsx
│   │   ├── +not-found.tsx
│   │   ├── _layout.tsx
│   │   └── providers/
│   │
│   ├── components/
│   │   └── app-loading-screen.tsx
│   │
│   ├── services/
│   │   ├── android-sms-reader.ts
│   │   ├── automatic-sms-settings.ts
│   │   ├── current-month-import.ts
│   │   ├── exchange-rate-service.ts
│   │   ├── payment-import.ts
│   │   └── transaction-parser.ts
│   │
│   ├── stores/
│   │   ├── _hydration.ts
│   │   ├── expense-store.ts
│   │   └── index.tsx
│   │
│   └── types/
│       └── expense.ts
│
├── app.config.js
├── package.json
├── README.md
└── TESTING.md
```

## Installation and Setup

### Requirements

The following software is required to develop and run the project:

- Node.js
- npm
- Android Studio
- Android SDK
- Java Development Kit 17
- Android emulator or compatible Android device

Dat Expense contains a custom native Android SMS module.

Because of this, the complete SMS-reading functionality cannot be run using Expo Go. An Android development build is required.

### Install Dependencies

After cloning or downloading the project, open a terminal inside the `dat-expense` folder and run:

```bash
npm install
```

### Build the Android Application

For the first native Android build, run:

```bash
npx expo run:android
```

This builds and installs the Android development version of Dat Expense on the connected emulator or Android device.

### Start the Development Server

After the development build has been installed, start Expo using:

```bash
npx expo start --dev-client
```

Then open the installed Dat Expense development application.

## Android SMS Permission

Automatic SMS detection requires access to Android SMS messages.

Dat Expense uses the permission:

```text
android.permission.READ_SMS
```

When automatic SMS detection is enabled, the application checks whether SMS permission has been granted.

If permission is required, Android asks the user whether Dat Expense should be allowed to access SMS messages.

If SMS permission is not granted, automatic payment SMS reading cannot operate.

Manual expense entry is still available.

## Screenshots

### Home

The Home screen displays the current month's spending total, spending by category and recent transactions.

![Dat Expense Home](screenshots/home.png)

### Transactions

The Transactions screen displays the expense history and information about each transaction.

![Dat Expense Transactions](screenshots/transactions.png)

### Change Transaction Category

Users can change the category of an existing transaction and choose whether Dat Expense should remember the merchant.

![Change Transaction Category](screenshots/change-category.png)

### Categories

The Categories screen allows users to create, rename and delete categories and view learned merchant rules.

![Dat Expense Categories](screenshots/categories.png)

### Settings

The Settings screen provides controls for SMS detection, manual scanning and other application information.

![Dat Expense Settings](screenshots/settings.png)

### Add Expense

The Add Expense screen allows expenses to be entered manually using the required transaction information.

![Dat Expense Add Expense](screenshots/add-expense.png)

### Foreign Currency Transaction

Foreign currency transactions display the converted MVR value while preserving the original foreign currency amount.

![Dat Expense Foreign Currency](screenshots/foreign-currency.png)

### SMS Payment Scan

Dat Expense can scan supported payment SMS messages from sender `455` and import recognised transactions.

![Dat Expense SMS Scan](screenshots/sms-scan.png)

## Testing

Testing information for Dat Expense is available in:

```text
TESTING.md
```

The application was tested manually during development on Android.

Testing includes:

- Application startup
- Navigation
- Add Expense
- Manual expense validation
- MVR expenses
- USD expenses
- EUR expenses
- Currency conversion
- Local data persistence
- Category creation
- Category renaming
- Category deletion
- Transaction category changes
- Merchant category learning
- SMS permission
- Automatic SMS scanning
- Manual SMS scanning
- SMS parsing
- Already-scanned protection
- Current-month importing
- Home screen totals
- Transaction source display
- Category persistence
- Merchant rule persistence
- Last SMS scan time

The project was also checked using:

```bash
npx tsc --noEmit
npx expo-doctor
```

These checks completed without errors before the final documentation stage.

## Known Limitations

### Android Only

Dat Expense currently requires Android for automatic SMS reading because this feature depends on Android SMS permissions and native APIs.

### Supported SMS Format

Automatic SMS importing is designed for supported payment messages received from sender `455`.

Messages received from other senders or using significantly different payment formats may not be recognised automatically.

### Internet Connection for Foreign Currency Conversion

Automatically importing USD and EUR transactions may require an internet connection so that Dat Expense can retrieve an exchange rate.

MVR transactions do not require an online exchange-rate request.

### Exchange Rate Availability

Dat Expense attempts to retrieve a historical exchange rate for the transaction date.

If a rate for the exact date is unavailable, the application can use an available rate from an earlier date.

### Local Storage

Expense information is stored locally on the device.

There is currently no user account, cloud backup or synchronisation between devices.

### SMS Permission

Automatic SMS scanning requires Android SMS permission.

If permission is not granted, Dat Expense cannot automatically read payment SMS messages. Manual expense entry can still be used.

## Future Improvements

Possible future improvements for Dat Expense include:

- Spending charts and more detailed statistics
- Monthly and yearly spending reports
- Budget limits
- Transaction searching and filtering
- Exporting expense data to CSV
- Backup and restore
- Cloud synchronisation
- Support for additional currencies
- Support for additional payment SMS formats
- Support for additional SMS senders
- Notifications when a new expense is detected
- Improved merchant recognition
- Editing more details of an existing transaction
- Optional biometric application protection

## Privacy

Dat Expense processes expense information locally on the user's device.

SMS access is used to identify supported payment transactions.

The application does not require a user account or login.

## Development Checks

Before final submission, the project can be checked using:

```bash
npx tsc --noEmit
npx expo-doctor
```

The project also includes linting and formatting commands:

```bash
npm run lint
npm run format
```

## Author
Yoosuf Eenas Jaufar 19039092


Developed as a Mobile Applications coursework project.

## License

This project was created for academic coursework.
# Dat Expense - Testing

## Testing Overview

Dat Expense was tested during the development process using manual functional testing on Android. After implementation, features were tested to ensure that navigation, data persistence, expense creation, SMS importing, currency conversion, category management and merchant learning worked as expected.

Before submitting the application, it was also checked using TypeScript and Expo Doctor.

## Development Checks

| Test | Expected Result | Result |
|---|---|---|
| TypeScript check | No errors found | Pass |
| Expo Doctor | The Expo project check passes | Pass |
| Android development build | Dat Expense launches without crashing | Pass |
| App loading screen | Custom Dat Expense loading animation is shown before the application | Pass |
| Bottom navigation | Home, Transactions, Categories and Settings tabs open properly | Pass |

## Functional Testing

| ID | Feature | Test | Expected Result | Result |
|---|---|---|---|---|
| T01 | App Startup | Open Dat Expense | Loading screen appears and Home screen loads | Pass |
| T02 | Navigation | Open each bottom tab | Correct screen opens without errors | Pass |
| T03 | Add Expense | Press the Add Expense button | Add Expense screen opens | Pending |
| T04 | Add Expense | View the Add Expense form | Amount, currency, merchant, transaction date, category and Save Expense controls are displayed | Pending |
| T05 | Add Expense | Select MVR as the currency | Expense can be entered using MVR without requiring a foreign exchange rate | Pending |
| T06 | Add Expense | Select USD as the currency | Exchange rate input is available for the USD expense | Pending |
| T07 | Add Expense | Select EUR as the currency | Exchange rate input is available for the EUR expense | Pending |
| T08 | Manual Expense | Add a valid MVR expense | Expense is saved and listed in Transactions | Pending |
| T09 | Manual Expense | Enter an amount of 0 | Expense is rejected | Pending |
| T10 | Manual Expense | Leave merchant empty | Expense is rejected | Pending |
| T11 | Manual Expense | Enter an invalid date | Expense is rejected | Pending |
| T12 | USD Expense | Add an expense in USD with an exchange rate | The MVR value is calculated and the original USD value is preserved | Pending |
| T13 | EUR Expense | Add an expense in EUR with an exchange rate | MVR value is calculated and original EUR value is preserved | Pending |
| T14 | Add Expense Category | Select a category when adding an expense | Saved expense uses the selected category | Pending |
| T15 | Add Expense Save | Press Save Expense after entering valid information | Expense is stored and the user can return to the application | Pending |
| T16 | Historical Currency | Restart the app after adding a foreign currency expense | Previously stored MVR value remains unchanged | Pass |
| T17 | Persistence | Add an expense and close the app | Expense is still there after restarting | Pass |
| T18 | Categories | Create a new category | New category is displayed in the category selection | Pass |
| T19 | Categories | Rename a category | Updated category name is displayed in the app | Pass |
| T20 | Categories | Delete a custom category | Category is deleted | Pass |
| T21 | Categories | Remove a category that is already being used by expenses | Existing expenses are moved to Uncategorized | Pass |
| T22 | Protected Category | Attempt to delete Uncategorized | Uncategorized is not deleted | Pass |
| T23 | Transaction Category | Update the category of one transaction | Selected transaction updates | Pass |
| T24 | Merchant Learning - No | When asked to remember the merchant, select No | Only the selected transaction changes | Pass |
| T25 | Merchant Learning - Yes | Change Category and select Yes when asked to remember the merchant | Existing transactions from the same merchant update | Pass |
| T26 | Merchant Learning | Import another payment from a remembered merchant | New transaction automatically gets the learned category | Pass |
| T27 | SMS Permission | Enable automatic SMS detection | Android SMS permission is requested if needed | Pass |
| T28 | Automatic SMS Scan | Enable automatic SMS detection | Payment SMS messages from sender 455 are scanned | Pass |
| T29 | Manual SMS Scan | Press Scan Payments Now | Payment SMS messages are scanned even when automatic scanning is disabled | Pass |
| T30 | SMS Parsing | Scan a valid MVR payment SMS | Amount, merchant, date, reference number and other payment information are imported | Pass |
| T31 | USD SMS | Scan a valid USD payment | Transaction is converted to MVR and the original USD amount is stored | Pass |
| T32 | EUR SMS | Scan a valid EUR payment | Transaction is converted to MVR and the original EUR amount is stored | Pass |
| T33 | Merchant Parsing | Import payment from `Driffle VI` | Full merchant name is still `Driffle VI` | Pass |
| T34 | Already Scanned | Scan an SMS that has already been imported | Transaction is not imported a second time and is treated as Already scanned | Pass |
| T35 | Reference Number | Import multiple different payments | Unique reference numbers allow different payments to be stored | Pass |
| T36 | Current Month | Scan messages for the current month | Current-month transactions are imported | Pass |
| T37 | Home Summary | Add/import expenses | Monthly total and category totals update correctly | Pass |
| T38 | Recent Transactions | Have more than five transactions | Home displays only the five most recent transactions | Pass |
| T39 | View All | Press the View all button | Transactions screen opens | Pass |
| T40 | SMS Source | View an imported payment | Transaction displays SMS source | Pass |
| T41 | Manual Source | View a manually created expense | Transaction displays MANUAL source | Pass |
| T42 | Foreign Display | View a USD/EUR transaction | MVR value and the original foreign amount are both shown | Pass |
| T43 | Automatic Setting | Disable automatic SMS detection | Automatic scanning is disabled, but manual scanning is still available | Pass |
| T44 | App Resume | Return to the app with automatic scanning enabled | Dat Expense checks for new payment messages | Pass |
| T45 | Category Persistence | Create or rename a category and restart the app | Category changes remain saved | Pass |
| T46 | Merchant Rule Persistence | Save a merchant category rule and restart the app | Merchant rule remains saved after restarting | Pass |
| T47 | Last SMS Scan | Complete a successful scan | Last successful scan time is stored and displayed | Pass |

## Add Expense Testing

The Add Expense feature allows the user to manually enter an expense instead of relying only on payment SMS messages.

The Add Expense form should include:

- Amount
- Currency
- Exchange rate when required
- Merchant
- Transaction date
- Category
- Save Expense button

The supported currencies are MVR, USD and EUR.

When MVR is selected, the expense uses MVR directly.

When USD or EUR is selected, a valid exchange rate is required so that the application can calculate and store the MVR value while also preserving the original foreign currency and amount.

After a valid expense is saved, it should appear in the Transactions screen and be included in the relevant Home screen totals.

The Add Expense feature should also prevent invalid information from being saved.

## SMS Format Testing

Various payment formats, including MVR, USD and EUR transactions, were tested with the SMS parser.

The payment messages tested contained merchants with varying amounts of spacing and merchant names containing additional text. The parser removes unnecessary spacing while keeping the complete merchant name.

The following information is taken from supported payment messages:

- Account suffix
- Transaction date
- Transaction time
- Original currency
- Original amount
- Merchant
- Reference number
- Approval code

The reference number is used to check whether a payment has already been scanned. This ensures that the same payment is not imported more than once.

## Persistence Testing

Dat Expense uses MobX for app state and mobx-persist-store with AsyncStorage for local persistence.

The following information is saved:

- Expenses
- Categories
- Merchant category rules
- Last successful SMS scan time

Persistence was tested by changing the data, completely closing the application and restarting it. The stored information was still available when the app was restarted.

## Currency Testing

MVR expenses use an exchange rate of 1.

USD and EUR expenses store:

- Original amount
- Original currency
- Exchange rate used for the transaction
- Calculated MVR value

The exchange rate used for the transaction is stored with the expense. This means that previous spending totals are not affected by exchange rate changes later on.

For automatic imports of USD or EUR payments, Dat Expense attempts to retrieve a historical exchange rate for the transaction date. If a rate for that exact date is unavailable, the system can use an available rate from an earlier date. The exchange rate used and the converted MVR amount are then stored with the transaction.

## Error and Validation Testing

Invalid manual expense information is not saved.

The checks include:

- Amount must be greater than zero
- Merchant cannot be empty
- Exchange rate must be greater than zero
- Foreign currency expenses require a valid exchange rate
- The transaction date must be valid

If an SMS message does not match the supported payment format, it is not saved as an expense.

## Testing Environment

Testing was done using an Android development build created with Expo and React Native.

The application requires Android to automatically read SMS messages because access to payment SMS messages depends on Android's native SMS permission and APIs.

A development build was used because the custom Android SMS reader cannot provide its full functionality through Expo Go.

## Final Result

The main functions of Dat Expense, such as tracking expenses, storing data, scanning payment SMS messages automatically and manually, handling multiple currencies, managing categories, learning merchant categories and viewing transaction history, were successfully tested.

The Add Expense feature still needs to be restored and tested before the application is considered fully complete. Once the Add Expense button, form and saving process have been confirmed to work, the related Pending test results should be changed to Pass.

The final TypeScript and Expo project checks should be run again after the Add Expense feature is completed and before submission.
# **App Name**: SwarnaBandhu

## Core Features:

- Login with Firebase Auth: Authenticate users using Firebase Authentication with email and password.
- Dashboard: Display key metrics (total loans, pending renewals, auction alerts) and a recent loans table.
- Create Loan: Capture customer details, gold items, and calculate loan eligibility based on weight, purity and gold rate. The system presents a preview of loan values, incorporating logic from shared modules to enhance the accuracy of loan appraisals. Save to Firestore.
- AI-Powered Loan Preview Generator Tool: Utilize generative AI to create a summary of a loan's financial implications, aiding in informed decision-making. This LLM tool will assess all relevant loan metrics and dynamically decide how to represent this in an easily-understandable format.
- Loan Renewal: Facilitate loan renewals, updating terms and Firestore data.
- Repayment Entry: Record repayment entries and update loan balances.
- Auction Management: Mark loans for auction and manage the auction process.
- Loan Closure: Finalize loan closure, updating Firestore and marking the loan as closed.
- Tamil Language Support: Display all the application labels and messages in Tamil Language by importing the Tamil strings from ta.ts

## Style Guidelines:

- Primary color: Deep gold (#D4AF37) to represent wealth and value.
- Background color: Off-white (#F8F8FF), offering a clean and professional backdrop, approximately of the same hue as the primary color but heavily desaturated.
- Accent color: Earthy brown (#A0522D) for providing a contrast to the primary color. Brown also stands for wealth and value.
- Headline font: 'Playfair' serif with an elegant and fashionable feel.
- Body font: 'PT Sans' sans-serif. A modern, readable font. For body.
- Note: currently only Google Fonts are supported.
- Use icons that represent finance, security, and gold, ensuring they are easily recognizable and match the app's aesthetic.
- Maintain a clear and consistent layout across web and mobile, focusing on usability and accessibility.
- Subtle animations, such as loading spinners and confirmation messages, can be used to improve the user experience without being distracting.
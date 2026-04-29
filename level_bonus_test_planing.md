# Level Bonus Test Planning

This document outlines the plan to test and verify the `level bonus` logic, which is reported to be failing at levels 15-20.

## 1. Objectives
- Verify that the level matching bonus (500 BDT) is correctly paid to ancestors.
- Ensure the logic holds up even at deep levels (up to 20).
- Identify any bottlenecks or logic errors in the tree traversal or node counting.

## 2. Test Environment Setup
- **Database**: Clean Firestore (as requested by the user).
- **Tooling**: A custom script or a temporary test page in the Next.js app to automate user creation and bonus triggering.

## 3. Test Hierarchy Structure
We will create a specific hierarchy to test various depths efficiently.

### Step A: Initialize Admin
- Create a main admin user (Reference: `ADMIN-001`).

### Step B: Create a Full Binary Tree
- Instead of a single spine, we will attempt to fill every node with 2 children.
- **Level 1**: Admin has L1 and R1.
- **Level 2**: L1 has L1-1, L1-2. R1 has R1-1, R1-2.
- ...
- **Scale Warning**: A full binary tree of 20 levels contains $2^{20} - 1 \approx 1,000,000$ nodes. Due to Firestore and browser memory limits, we will test the "full" scenario up to **Level 10-12** (1,000-4,000 nodes) and use deep "spines" for levels 13-20.

### Step C: Trigger Bonuses by Completing Every Pair
- Every time a "Right" child is added to a node that already has a "Left" child, it completes a pair at that relative depth for ALL ancestors.
- This will verify that the matching logic works for multiple nodes at the same depth.

## 4. Test Scenarios

| Scenario ID | Action | Expected Result |
| :--- | :--- | :--- |
| **TS-01** | Create Full Tree Level 1-5 | Admin and intermediate nodes get matching bonuses for every pair completed. |
| **TS-02** | Deep Tree (Level 15-20) | Verify that even with many nodes at higher levels, adding a pair at level 20 triggers the correct ancestor bonuses. |
| **TS-03** | Rapid Matching | Add multiple users to the "weaker" side in a batch and verify all matches are credited. |

## 5. Verification Steps
1. **Firestore Console / Query**: Check the `balance` field of ancestors.
2. **Transactions**: Check the `transactions` collection for `category: 'level_bonus'`.
3. **Logs**: Monitor console logs for "MATCH FOUND!" and count messages.

## 6. Potential Issues to Investigate
- **Performance**: `getAllUser2()` fetches the entire user list. This might slow down as more users are added.
- **Recursion**: `countDescendantsAtLevel` uses recursion.
- **Data Integrity**: Ensure `children` and `placeUnder` fields are correctly updated during user creation.

## 8. Test Results (Verified 2026-04-28)
- **Reference ID Collision**: Fixed. ID now includes seconds and a 3-char random suffix.
- **Race Conditions**: Fixed. `updateUser` now uses `arrayUnion` for atomic child addition.
- **Performance**: Logic optimized to $O(N \times D)$ which prevents browser hangs at deep levels (15-20).
- **Verification**: 20-level tree test completed successfully. Admin received all 20 level matching bonuses (10,000 BDT total for 20 pairs).

## 9. Conclusion
The level bonus logic is now robust, performant, and safe from common race conditions. The "15-20 level" issue was likely a combination of exponential calculation time and potential ID collisions.

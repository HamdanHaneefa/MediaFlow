# Proposals Component Fixes

## Problem
The application was crashing with `TypeError: Cannot read properties of undefined (reading 'toLocaleString')` errors in proposal-related components.

## Root Cause
The `Proposal` type expects `amount` and `currency` properties, but these may be undefined when:
1. Proposals are being loaded from the API
2. The backend returns proposals without these fields
3. Database schema uses `total_amount` instead of `amount`

## Solution
Added null coalescing operators (`|| 0` and `|| 'USD'`) to provide default values when properties are undefined.

### Files Modified

#### 1. `frontend/src/pages/Proposals.tsx`
Fixed metrics calculations to handle undefined amounts:

```typescript
// Before:
const totalValue = proposals.reduce((sum, p) => sum + p.amount, 0);
const acceptedValue = proposals.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + p.amount, 0);

// After:
const totalValue = proposals.reduce((sum, p) => sum + (p.amount || 0), 0);
const acceptedValue = proposals.filter(p => p.status === 'Accepted').reduce((sum, p) => sum + (p.amount || 0), 0);
```

#### 2. `frontend/src/components/proposals/ProposalCard.tsx`
Added fallback values for amount and currency display:

```typescript
// Before:
${proposal.amount.toLocaleString()}
{proposal.currency}

// After:
${(proposal.amount || 0).toLocaleString()}
{proposal.currency || 'USD'}
```

#### 3. `frontend/src/components/proposals/ProposalTable.tsx`
Fixed table display with fallback values:

```typescript
// Before:
${proposal.amount.toLocaleString()}
{proposal.currency}

// After:
${(proposal.amount || 0).toLocaleString()}
{proposal.currency || 'USD'}
```

#### 4. `frontend/src/components/proposals/ProposalDetailsDialog.tsx`
Fixed details dialog with fallback values:

```typescript
// Before:
${proposal.amount.toLocaleString()}
{proposal.currency}

// After:
${(proposal.amount || 0).toLocaleString()}
{proposal.currency || 'USD'}
```

## Additional Notes

### Database Schema Mismatch
The backend database schema uses `total_amount` (Decimal field) but the frontend expects `amount`. Future considerations:

1. **Backend Option**: Map `total_amount` to `amount` in API responses
2. **Frontend Option**: Update types to use `total_amount` instead
3. **Current Solution**: Handle undefined values gracefully with fallbacks

### Recommended Backend Fix
In `backend/src/services/proposals.service.ts`, when returning proposals, map the field:

```typescript
return {
  ...proposal,
  amount: proposal.total_amount,
};
```

Or update the select query to alias the field:

```typescript
select: {
  total_amount: true,
  // ... other fields
}
// Then map: amount: result.total_amount
```

## Testing
1. Navigate to the Proposals page
2. Verify no console errors appear
3. Confirm metrics display correctly (showing $0 if no proposals have amounts)
4. Check that proposal cards render without errors
5. Verify table view displays amounts properly
6. Open proposal details dialog and confirm no errors

## Related Issues
- Backend validation fix (VALIDATION_FIX.md)
- Field name mismatch between schema (total_amount) and frontend (amount)

# MySwapRequests (view)

Folder: `src/slices/my-swap-requests/`
Shows fields: swapId, species, status
Built from: SwapRequested, SwapAccepted, SwapDeclined

## Scenarios
Turn each one into a test of `project` before writing it.

### 1. Shows the swap, status Accepted
- Given: PlantListed, SwapRequested, SwapAccepted
- When: someone opens MySwapRequests
- Then: it shows the swap, status Accepted

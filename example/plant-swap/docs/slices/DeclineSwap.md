# DeclineSwap (command)

Folder: `src/slices/decline-swap/`
Command fields: swapId, ownerId, reason
Produces: SwapDeclined

## Scenarios
Turn each one into a test of `decide` before writing it. Happy case first.

### 1. Happy case
- Given: PlantListed, SwapRequested
- When: DeclineSwap
- Then: SwapDeclined

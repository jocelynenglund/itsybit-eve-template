# AcceptSwap (command)

Folder: `src/slices/accept-swap/`
Command fields: swapId, ownerId
Produces: SwapAccepted

## Scenarios
Turn each one into a test of `decide` before writing it. Happy case first.

### 1. Happy case
- Given: PlantListed, SwapRequested
- When: AcceptSwap
- Then: SwapAccepted

### 2. Refused: That swap was already declined
- Given: PlantListed, SwapRequested, SwapDeclined
- When: AcceptSwap
- Then: refused, "That swap was already declined"

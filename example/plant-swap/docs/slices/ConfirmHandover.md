# ConfirmHandover (command)

Folder: `src/slices/confirm-handover/`
Command fields: swapId
Produces: PlantsHandedOver

## Scenarios
Turn each one into a test of `decide` before writing it. Happy case first.

### 1. Happy case
- Given: PlantListed, SwapRequested, SwapAccepted
- When: ConfirmHandover
- Then: PlantsHandedOver

### 2. Refused: The swap hasn't been accepted yet
- Given: PlantListed, SwapRequested
- When: ConfirmHandover
- Then: refused, "The swap hasn't been accepted yet"

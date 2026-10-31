# RequestSwap (command)

Folder: `src/slices/request-swap/`
Command fields: plantId, requesterId, offeredPlantId
Produces: SwapRequested

## Scenarios
Turn each one into a test of `decide` before writing it. Happy case first.

### 1. Happy case
- Given: PlantListed
- When: RequestSwap
- Then: SwapRequested

### 2. Refused: That plant isn't listed
- Given: nothing
- When: RequestSwap
- Then: refused, "That plant isn't listed"

### 3. Refused: That plant has already been swapped
- Given: PlantListed, SwapRequested, SwapAccepted, PlantsHandedOver
- When: RequestSwap
- Then: refused, "That plant has already been swapped"

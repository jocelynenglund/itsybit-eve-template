# AvailablePlants (view)

Folder: `src/slices/available-plants/`
Shows fields: plantId, species, ownerId
Built from: PlantListed, PlantsHandedOver

## Scenarios
Turn each one into a test of `project` before writing it.

### 1. Shows the plant, with its species
- Given: PlantListed
- When: someone opens AvailablePlants
- Then: it shows the plant, with its species

### 2. Shows nothing: the plant has been swapped
- Given: PlantListed, SwapRequested, SwapAccepted, PlantsHandedOver
- When: someone opens AvailablePlants
- Then: it shows nothing: the plant has been swapped

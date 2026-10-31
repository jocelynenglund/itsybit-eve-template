# ListPlant (command)

Folder: `src/slices/list-plant/`
Command fields: ownerId, species, note
Produces: PlantListed

## Scenarios
Turn each one into a test of `decide` before writing it. Happy case first.

### 1. Happy case
- Given: nothing
- When: ListPlant
- Then: PlantListed

### 2. Refused: Species is required
- Given: nothing
- When: ListPlant
- Then: refused, "Species is required"

import { useState, useCallback, useEffect } from 'react';

export type TileType = 'blue' | 'purple' | 'green' | 'yellow' | 'pink' | 'red';
export type SpecialType = 'none' | 'row-bomb' | 'col-bomb' | 'rainbow';

export const TILE_TYPES: TileType[] = ['blue', 'purple', 'green', 'yellow', 'pink', 'red'];

export interface Tile {
  id: string;
  type: TileType;
  row: number;
  col: number;
  isMatching?: boolean;
  special: SpecialType;
}

interface MatchGroup {
  coords: { r: number, c: number }[];
  type: TileType;
  isHorizontal: boolean;
}

const GRID_SIZE = 8;

export function useMatch3() {
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [lastSwapCoords, setLastSwapCoords] = useState<{r: number, c: number} | null>(null);

  const getTargetScore = (level: number) => 500 + (level - 1) * 750;
  const getMaxMoves = (level: number) => 20 + Math.floor(level / 2);

  const targetScore = getTargetScore(currentLevel);

  const initGrid = useCallback((level?: number) => {
    const activeLevel = level || currentLevel;
    const newGrid: Tile[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let type: TileType;
        do {
          type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        } while (
          (r >= 2 && newGrid[r - 1][c].type === type && newGrid[r - 2][c].type === type) ||
          (c >= 2 && row[c - 1].type === type && row[c - 2].type === type)
        );
        
        row.push({
          id: `${r}-${c}-${Math.random()}`,
          type,
          row: r,
          col: c,
          special: 'none'
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setScore(0);
    setMoves(getMaxMoves(activeLevel));
    setIsProcessing(false);
    setIsLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    initGrid();
  }, []);

  const findMatchGroups = (currentGrid: Tile[][]) => {
    const groups: MatchGroup[] = [];
    
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentGrid[r][c].type;
        if (!type) continue;
        if (currentGrid[r][c + 1].type === type && currentGrid[r][c + 2].type === type) {
          const groupCoords = [{ r, c }, { r, c: c + 1 }, { r, c: c + 2 }];
          let nextC = c + 3;
          while (nextC < GRID_SIZE && currentGrid[r][nextC].type === type) {
            groupCoords.push({ r, c: nextC });
            nextC++;
          }
          groups.push({ coords: groupCoords, type, isHorizontal: true });
          c = nextC - 1;
        }
      }
    }
    
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentGrid[r][c].type;
        if (!type) continue;
        if (currentGrid[r + 1][c].type === type && currentGrid[r + 2][c].type === type) {
          const groupCoords = [{ r, c }, { r: r + 1, c }, { r: r + 2, c }];
          let nextR = r + 3;
          while (nextR < GRID_SIZE && currentGrid[nextR][c].type === type) {
            groupCoords.push({ r: nextR, c });
            nextR++;
          }
          groups.push({ coords: groupCoords, type, isHorizontal: false });
          r = nextR - 1;
        }
      }
    }
    
    return groups;
  };

  const processGrid = async (swapCoords?: {r: number, c: number}) => {
    setIsProcessing(true);
    let currentGrid = [...grid.map(row => [...row])];
    
    while (true) {
      const matchGroups = findMatchGroups(currentGrid);
      if (matchGroups.length === 0) break;
      
      const coordsToClear = new Set<string>();
      const specialToSpawn: { r: number, c: number, type: SpecialType, tileType: TileType }[] = [];

      matchGroups.forEach(group => {
        group.coords.forEach(coord => coordsToClear.add(`${coord.r}-${coord.c}`));
        
        // Power-up generation logic
        if (group.coords.length === 4) {
          const spawnPoint = swapCoords || group.coords[0];
          const isSpawnInGroup = group.coords.some(c => c.r === spawnPoint.r && c.c === spawnPoint.c);
          const finalSpawn = isSpawnInGroup ? spawnPoint : group.coords[Math.floor(group.coords.length / 2)];
          specialToSpawn.push({
            ...finalSpawn,
            type: group.isHorizontal ? 'row-bomb' : 'col-bomb',
            tileType: group.type
          });
        } else if (group.coords.length >= 5) {
          const spawnPoint = swapCoords || group.coords[0];
          const isSpawnInGroup = group.coords.some(c => c.r === spawnPoint.r && c.c === spawnPoint.c);
          const finalSpawn = isSpawnInGroup ? spawnPoint : group.coords[Math.floor(group.coords.length / 2)];
          specialToSpawn.push({
            ...finalSpawn,
            type: 'rainbow',
            tileType: group.type
          });
        }

        // Trigger special effects of matched tiles
        group.coords.forEach(coord => {
          const tile = currentGrid[coord.r][coord.c];
          if (tile.special === 'row-bomb') {
            for (let i = 0; i < GRID_SIZE; i++) coordsToClear.add(`${coord.r}-${i}`);
          } else if (tile.special === 'col-bomb') {
            for (let i = 0; i < GRID_SIZE; i++) coordsToClear.add(`${i}-${coord.c}`);
          } else if (tile.special === 'rainbow') {
            // Rainbow in match clears a large area or random color
            const randomType = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                if (currentGrid[r][c].type === randomType) coordsToClear.add(`${r}-${c}`);
              }
            }
          }
        });
      });

      // Mark for animation
      const markedGrid = currentGrid.map(row => [...row]);
      coordsToClear.forEach(coord => {
        const [r, c] = coord.split('-').map(Number);
        markedGrid[r][c].isMatching = true;
      });
      setGrid(markedGrid);
      await new Promise(r => setTimeout(r, 350));

      // Clear and Spawn Specials
      const droppedGrid: Tile[][] = markedGrid.map(row => row.map(t => t.isMatching ? { ...t, type: '' as any, isMatching: false, special: 'none' as SpecialType } : t));
      
      // Re-insert special tiles (they were marked as matching, so we put them back as special)
      specialToSpawn.forEach(s => {
        droppedGrid[s.r][s.c] = {
          id: `special-${s.r}-${s.c}-${Math.random()}`,
          type: s.tileType,
          row: s.r,
          col: s.c,
          special: s.type
        };
      });

      // Gravity logic
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptySpot = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (droppedGrid[r][c].type) {
            const temp = droppedGrid[r][c];
            droppedGrid[r][c] = droppedGrid[emptySpot][c];
            droppedGrid[emptySpot][c] = { ...temp, row: emptySpot };
            emptySpot--;
          }
        }
        for (let r = emptySpot; r >= 0; r--) {
          droppedGrid[r][c] = {
            id: `${r}-${c}-${Math.random()}`,
            type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
            row: r,
            col: c,
            special: 'none' as SpecialType
          };
        }
      }
      
      currentGrid = droppedGrid;
      setGrid(currentGrid);
      const addedScore = coordsToClear.size * 10;
      setScore(s => {
        const newScore = s + addedScore;
        if (newScore >= getTargetScore(currentLevel)) setIsLevelComplete(true);
        return newScore;
      });
      swapCoords = undefined; // Only use swapCoords for the first iteration
      await new Promise(r => setTimeout(r, 350));
    }
    
    setIsProcessing(false);
  };

  const swapTiles = async (r1: number, c1: number, r2: number, c2: number) => {
    if (isProcessing || moves <= 0 || isLevelComplete) return;
    
    const newGrid = [...grid.map(row => [...row])];
    const tile1 = newGrid[r1][c1];
    const tile2 = newGrid[r2][c2];

    // Handle Rainbow + Color swap
    if (tile1.special === 'rainbow' || tile2.special === 'rainbow') {
      const rainbowTile = tile1.special === 'rainbow' ? tile1 : tile2;
      const otherTile = tile1.special === 'rainbow' ? tile2 : tile1;
      
      setMoves(m => m - 1);
      setGrid(newGrid.map(row => row.map(t => {
        if (t.type === otherTile.type || (t.row === rainbowTile.row && t.col === rainbowTile.col)) {
          return { ...t, isMatching: true };
        }
        return t;
      })) as Tile[][]);
      
      await new Promise(r => setTimeout(r, 400));
      await processGrid();
      return;
    }

    newGrid[r1][c1] = { ...tile2, row: r1, col: c1 };
    newGrid[r2][c2] = { ...tile1, row: r2, col: c2 };
    
    const matchGroups = findMatchGroups(newGrid);
    if (matchGroups.length > 0) {
      setGrid(newGrid);
      setMoves(m => m - 1);
      // We pass the coordinates of one of the swapped tiles to know where to spawn power-ups
      await processGrid({ r: r1, c: c1 });
    } else {
      setGrid(newGrid);
      await new Promise(r => setTimeout(r, 200));
      const revertGrid = [...grid.map(row => [...row])];
      setGrid(revertGrid);
    }
  };

  const startNextLevel = () => {
    const nextLvl = currentLevel + 1;
    setCurrentLevel(nextLvl);
    initGrid(nextLvl);
  };

  return {
    grid,
    score,
    moves,
    isProcessing,
    currentLevel,
    targetScore,
    isLevelComplete,
    swapTiles,
    resetGame: () => initGrid(currentLevel),
    startNextLevel
  };
}

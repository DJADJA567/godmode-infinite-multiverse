import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { WorldState } from '../simulation/types';

interface PhaserGameProps {
  world: WorldState;
  onSelectPerson: (personId: string) => void;
}

export default function PhaserGame({ world, onSelectPerson }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 640,
      backgroundColor: '#0f172a',
      scene: {
        create() {
          const scene = this;
          const tileSize = 28;
          const colors: Record<string, number> = {
            grass: 0x3fbf7f,
            forest: 0x2f8f5a,
            water: 0x2a7ae6,
            mountain: 0x8d99ae,
            desert: 0xe6b866,
          };

          const worldWidth = world.width;
          const worldHeight = world.height;

          for (const tile of world.tiles) {
            const x = tile.x * tileSize + tileSize / 2;
            const y = tile.y * tileSize + tileSize / 2;
            const graphics = scene.add.graphics();
            graphics.fillStyle(colors[tile.type] ?? 0x3fbf7f, 1);
            graphics.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);

            if (tile.resource) {
              const resourceColor = tile.resource === 'food' ? 0xfacc15 : tile.resource === 'wood' ? 0x22c55e : tile.resource === 'stone' ? 0x94a3b8 : 0x67e8f9;
              const dot = scene.add.circle(x + tileSize * 0.2, y + tileSize * 0.2, 4, resourceColor);
              dot.setDepth(2);
            }
          }

          world.buildings.forEach((building) => {
            const rect = scene.add.rectangle(
              building.x * tileSize + tileSize / 2,
              building.y * tileSize + tileSize / 2,
              tileSize * 0.7,
              tileSize * 0.7,
              0xf8fafc,
            );
            rect.setStrokeStyle(2, 0x0ea5e9, 1);
            rect.setDepth(3);
          });

          world.people.forEach((person) => {
            const circle = scene.add.circle(
              person.x * tileSize + tileSize / 2,
              person.y * tileSize + tileSize / 2,
              6,
              person.job === 'warrior' ? 0xef4444 : person.job === 'builder' ? 0x38bdf8 : 0xfbbf24,
            );
            circle.setDepth(4);
            circle.setData('personId', person.id);
            circle.setInteractive();
            circle.on('pointerdown', () => {
              onSelectPerson(person.id);
            });
          });
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    return () => {
      game.destroy(true, false);
    };
  }, [world, onSelectPerson]);

  return <div ref={containerRef} className="phaser-canvas" />;
}

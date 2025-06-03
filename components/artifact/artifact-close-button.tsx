import { memo } from 'react';
import { CrossIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact((currentArtifact) => {
          return currentArtifact.status === 'streaming'
            ? {
              ...currentArtifact,
              isVisible: false,
            }
            : { ...initialArtifactData } // 重置为初始状态
        });
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);

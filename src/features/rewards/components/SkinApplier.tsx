import { useEffect } from 'react';
import { usePlayerStore } from '../playerStore';

/** Puts the chosen board skin on the page (`<html data-skin="night">`), which tokens.css reads. */
export function SkinApplier() {
  const skin = usePlayerStore((state) => state.skin);
  useEffect(() => {
    document.documentElement.dataset.skin = skin;
  }, [skin]);
  return null;
}

let simpleTextCounter = 0;

/**
 * Genera un ID único para nodos SimpleText.
 * Ejemplo: "SimpleText0000", "SimpleText0001", etc.
 */
export function generateSimpleTextId(): string {
  const id = `SimpleText${String(simpleTextCounter).padStart(4, "0")}`;
  simpleTextCounter++;
  return id;
}

/**
 * Permite resetear el contador manualmente (opcional)
 */
export function resetSimpleTextCounter() {
  simpleTextCounter = 0;
}

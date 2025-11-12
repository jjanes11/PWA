export type SetType = 'normal' | 'warmup' | 'failure' | 'drop';

export function getSetTypeDisplay(type?: SetType): string {
  if (!type || type === 'normal') return '';
  if (type === 'warmup') return 'W';
  if (type === 'failure') return 'F';
  if (type === 'drop') return 'D';
  return '';
}

export function getSetTypeClass(type?: SetType): string {
  if (!type || type === 'normal') return '';
  return `jacaona-set-type-${type}`;
}

import { SetType } from '../models/workout.models';

export function getSetTypeDisplay(type?: SetType): string {
  if (!type || type === SetType.Normal) return '';
  if (type === SetType.Warmup) return 'W';
  if (type === SetType.Failure) return 'F';
  if (type === SetType.Drop) return 'D';
  return '';
}

export function getSetTypeClass(type?: SetType): string {
  if (!type || type === SetType.Normal) return '';
  return `jacaona-set-type-${type}`;
}

/**
 * Utility functions for scroll management
 * Single responsibility: Scroll position calculations and manipulations
 */

export interface ScrollPosition {
  top: number;
  height: number;
}

/**
 * Scroll to an element by ID with optional smooth behavior
 */
export function scrollToElementById(
  elementId: string,
  behavior: ScrollBehavior = 'smooth'
): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
}

/**
 * Set scroll position directly without animation
 * @param offset - Optional offset to adjust scroll position (negative scrolls higher)
 */
export function setScrollPosition(
  container: HTMLElement,
  elementId: string,
  offset: number = 0
): boolean {
  const element = document.getElementById(elementId);
  if (!element) return false;

  // Temporarily disable smooth scrolling
  const originalBehavior = container.style.scrollBehavior;
  container.style.scrollBehavior = 'auto';

  // Set scroll position with optional offset
  container.scrollTop = element.offsetTop + offset;

  // Force reflow
  void container.offsetHeight;

  // Restore smooth scrolling
  container.style.scrollBehavior = originalBehavior;

  return true;
}

/**
 * Get current scroll position
 */
export function getScrollPosition(container: HTMLElement): ScrollPosition {
  return {
    top: container.scrollTop,
    height: container.scrollHeight
  };
}

/**
 * Check if scrolled near top of container
 */
export function isNearTop(container: HTMLElement, threshold: number): boolean {
  return container.scrollTop < threshold;
}

/**
 * Check if scrolled near bottom of container
 */
export function isNearBottom(container: HTMLElement, threshold: number): boolean {
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollHeight - scrollTop - clientHeight < threshold;
}

/**
 * Preserve scroll position after content height change
 * Returns the adjusted scroll position
 */
export function preserveScrollPosition(
  previousTop: number,
  previousHeight: number,
  newHeight: number
): number {
  const heightDifference = newHeight - previousHeight;
  return previousTop + heightDifference;
}

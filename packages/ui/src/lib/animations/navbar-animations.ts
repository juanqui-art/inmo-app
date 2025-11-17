/**
 * Navbar Animation Utilities
 *
 * Provides animation functions for navbar components
 */

/**
 * Animates the active link indicator to slide between links
 *
 * @param container - The navigation container element
 * @param indicator - The indicator element to animate
 * @param activeIndex - The index of the currently active link
 */
export function animateActiveIndicator(
  container: HTMLElement,
  indicator: HTMLElement,
  activeIndex: number,
) {
  const links = container.querySelectorAll("a");
  if (!links[activeIndex]) return;

  const activeLink = links[activeIndex] as HTMLElement;

  // Get the position and size of the active link
  const { left, width } = activeLink.getBoundingClientRect();
  const containerLeft = container.getBoundingClientRect().left;

  // Calculate the relative position within the container
  const relativeLeft = left - containerLeft;

  // Animate the indicator
  indicator.style.left = `${relativeLeft}px`;
  indicator.style.width = `${width}px`;
  indicator.style.opacity = "1";
  indicator.style.transition = "all 0.3s ease-in-out";
}

/**
 * Navbar Animation Utilities
 *
 * Animations for active link indicators in navigation
 */

/**
 * Animate the active indicator to slide between navigation links
 *
 * @param container - The container element (nav)
 * @param indicator - The indicator element (div that slides)
 * @param activeIndex - The index of the active link
 */
export function animateActiveIndicator(
  container: HTMLElement,
  indicator: HTMLElement,
  activeIndex: number,
): void {
  const links = container.querySelectorAll("a");

  if (activeIndex >= 0 && activeIndex < links.length) {
    const activeLink = links[activeIndex];

    if (activeLink) {
      // Get the position and width of the active link
      const { offsetLeft, offsetWidth } = activeLink;

      // Update indicator position and width with smooth animation
      indicator.style.transition = "all 0.3s ease-in-out";
      indicator.style.left = `${offsetLeft}px`;
      indicator.style.width = `${offsetWidth}px`;
      indicator.style.opacity = "1";
    }
  } else {
    // Hide indicator if no active link
    indicator.style.opacity = "0";
  }
}

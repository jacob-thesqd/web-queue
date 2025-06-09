/**
 * Utility functions for determining which department cards to show
 * based on the Department (Plain Text) field from Airtable
 */

export interface DepartmentCardVisibility {
  showWebCard: boolean;
  showBrandCard: boolean;
  showSMCard: boolean;
}

/**
 * Determines which cards should be visible based on department string
 * @param department The department string from Airtable
 * @returns Object indicating which cards should be shown
 */
export function getDepartmentCardVisibility(department: string | null): DepartmentCardVisibility {
  if (!department) {
    // If no department data, don't show any cards
    return {
      showWebCard: false,
      showBrandCard: false,
      showSMCard: false
    };
  }

  const deptLower = department.toLowerCase();

  // If contains "All-In" then show all 3 cards
  if (deptLower.includes('all-in')) {
    return {
      showWebCard: true,
      showBrandCard: true,
      showSMCard: true
    };
  }

  // Otherwise, check individual department conditions
  return {
    // If contains "Social" but not "Strategy" then show SMCard
    showSMCard: deptLower.includes('social') && !deptLower.includes('strategy'),
    
    // If contains "Brand" but not "All-In" then show BrandCard
    showBrandCard: deptLower.includes('brand') && !deptLower.includes('all-in'),
    
    // If contains "Web" but not "All-In" then show WebCard
    showWebCard: deptLower.includes('web') && !deptLower.includes('all-in')
  };
}

/**
 * Checks if any cards should be shown
 * @param visibility The visibility object
 * @returns true if at least one card should be shown
 */
export function hasVisibleCards(visibility: DepartmentCardVisibility): boolean {
  return visibility.showWebCard || visibility.showBrandCard || visibility.showSMCard;
}

/**
 * Counts the number of visible cards
 * @param visibility The visibility object
 * @returns The number of cards that should be shown
 */
export function countVisibleCards(visibility: DepartmentCardVisibility): number {
  let count = 0;
  if (visibility.showWebCard) count++;
  if (visibility.showBrandCard) count++;
  if (visibility.showSMCard) count++;
  return count;
} 
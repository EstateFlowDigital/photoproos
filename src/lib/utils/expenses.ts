import type { ExpenseCategory } from "@prisma/client";

/**
 * Get expense category labels and icons
 */
export function getExpenseCategoryInfo(category: ExpenseCategory) {
  const categories: Record<ExpenseCategory, { label: string; icon: string }> = {
    labor: { label: "Labor", icon: "users" },
    travel: { label: "Travel", icon: "car" },
    equipment: { label: "Equipment", icon: "camera" },
    software: { label: "Software", icon: "code" },
    materials: { label: "Materials", icon: "package" },
    marketing: { label: "Marketing", icon: "megaphone" },
    fees: { label: "Fees", icon: "receipt" },
    insurance: { label: "Insurance", icon: "shield" },
    other: { label: "Other", icon: "dots" },
  };

  return categories[category] || { label: category, icon: "dots" };
}

/**
 * Get all expense categories with labels and icons
 */
export function getExpenseCategories() {
  const categories: ExpenseCategory[] = [
    "labor",
    "travel",
    "equipment",
    "software",
    "materials",
    "marketing",
    "fees",
    "insurance",
    "other",
  ];

  return categories.map((cat) => ({
    value: cat,
    ...getExpenseCategoryInfo(cat),
  }));
}

export interface NavItem {
  label: string;
  href: string;
}

// The only place site navigation is defined.
export const nav: NavItem[] = [{ label: "Shipped", href: "#shipped" }];

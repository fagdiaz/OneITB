# UI Model: Adaptive Navigation and Brand Lockup

No backend or persistent model changes are required.

## Navigation Descriptor

```ts
type NavigationItem = {
  key: string;
  path: string;
  label: string;
  iconClass: string;
  priority: number;
  isAllowed: (role: string) => boolean;
  badge?: number;
};
```

Derived state:

- `availableWidth`
- `visibleItems`
- `overflowItems`
- `isOverflowOpen`

## Brand Lockup Props

```ts
type BrandLockupProps = {
  variant: 'symbol' | 'compact' | 'full';
  decorative?: boolean;
  className?: string;
};
```

The symbol and wordmark are children of the same non-wrapping container.


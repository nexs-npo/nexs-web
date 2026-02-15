import { UserButton as ClerkUserButton } from '@clerk/astro/react';
import { jaJP } from '@clerk/localizations';

export default function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: 'w-8 h-8',
          userButtonPopoverCard: 'shadow-xl border border-gray-100',
        },
      }}
      localization={jaJP}
    />
  );
}

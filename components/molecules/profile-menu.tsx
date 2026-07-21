"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logOut } from "@/app/(dashboard)/service";

interface ProfileMenuProps {
  name: string;
  email: string;
}

export default function ProfileMenu({ name, email }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-col items-end text-sm outline-none cursor-pointer">
        <span className="font-semibold leading-tight">{name}</span>
        <span className="text-xs text-muted-foreground leading-tight">
          {email}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span>{name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/terms-of-service" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/cookie-policy" target="_blank" rel="noopener noreferrer">
            Cookie Policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onClick={() => logOut()}>
          <button type="submit" className="w-full text-left">
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

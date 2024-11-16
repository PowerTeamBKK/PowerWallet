"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Bars3Icon, ChartBarSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const menuLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <ChartBarSquareIcon className="h-4 w-4" />,
    requiresConnection: true,
  },
];

const HeaderMenuLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const { address } = useAccount();

  return (
    <>
      {menuLinks
        .filter(link => !link.requiresConnection || (link.requiresConnection && address))
        .map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="list-none">
              <Link
                href={href}
                passHref
                onClick={onLinkClick}
                className={`${
                  isActive ? "bg-secondary shadow-md" : ""
                } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-2 px-4 text-base lg:text-sm rounded-full gap-3 grid grid-flow-col items-center`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
    </>
  );
};

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    menuRef,
    useCallback(() => {
      if (isDrawerOpen) setIsDrawerOpen(false);
    }, [isDrawerOpen]),
  );

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 h-screen w-64 bg-base-100 shadow-lg flex-col">
        <div className="flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2 p-4 border-b border-base-300">
            <div className="relative w-10 h-10">
              <Image alt="Logo" className="cursor-pointer" fill src="/logo.svg" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Power Wallet</span>
            </div>
          </Link>

          <nav className="flex-1 p-4">
            <ul className="flex flex-col gap-2">
              <HeaderMenuLinks />
            </ul>
          </nav>

          <div className="p-4 border-t border-base-300">
            <div className="relative">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-base-100 shadow-lg z-40">
        <div className="flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image alt="Logo" className="cursor-pointer" fill src="/logo.svg" />
            </div>
            <span className="font-bold text-lg">Power Wallet</span>
          </Link>

          <button
            className="btn btn-ghost p-0 flex items-center justify-center w-10 h-10"
            onClick={() => setIsDrawerOpen(prev => !prev)}
          >
            {isDrawerOpen ? (
              <XMarkIcon className="h-6 w-6 pointer-events-none" />
            ) : (
              <Bars3Icon className="h-6 w-6 pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 bg-base-100 z-50" ref={menuRef}>
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button className="btn btn-ghost p-0 flex items-center justify-center w-10 h-10" onClick={handleClose}>
                <XMarkIcon className="h-6 w-6 pointer-events-none" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center gap-6 pt-20">
              <HeaderMenuLinks onLinkClick={handleClose} />
              <div className="mt-8">
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const LandingNavBar = () => {
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
    <div className="fixed top-0 left-0 right-0 bg-base-100 shadow-lg z-50">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
            <Link href="#/">
          <Image src="/logo.svg" alt="Logo" className="relative w-44 h-12" width={100} height={40} />
          </Link>
          <div className="hidden lg:flex space-x-4">
            <Link href="#bitcoin-power-law" className="text-base font-medium hover:text-primary">
              Bitcoin Power Law
            </Link>
            <Link href="#our-strategies" className="text-base font-medium hover:text-primary">
              Our Strategies
            </Link>
            <Link href="#about-us" className="text-base font-medium hover:text-primary">
              About Us
            </Link>
          </div>
        </div>
        <RainbowKitCustomConnectButton />
        <button
          className="btn btn-ghost rounded-xl p-0 flex items-center justify-center w-10 h-10 lg:hidden"
          onClick={() => setIsDrawerOpen(prev => !prev)}
        >
          {isDrawerOpen ? (
            <XMarkIcon className="h-6 w-6 pointer-events-none" />
          ) : (
            <Bars3Icon className="h-6 w-6 pointer-events-none" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 bg-base-100 z-50" ref={menuRef}>
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button className="btn rounded-xl btn-ghost p-0 flex items-center justify-center w-10 h-10" onClick={handleClose}>
                <XMarkIcon className="h-6 w-6 pointer-events-none" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center gap-6 pt-20">
              <Link href="#bitcoin-power-law" className="text-base font-medium hover:text-primary" onClick={handleClose}>
                Bitcoin Power Law
              </Link>
              <Link href="#our-strategies" className="text-base font-medium hover:text-primary" onClick={handleClose}>
                Our Strategies
              </Link>
              <Link href="#about-us" className="text-base font-medium hover:text-primary" onClick={handleClose}>
                About Us
              </Link>
              <div className="mt-8">
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingNavBar;
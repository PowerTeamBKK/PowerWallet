import React from "react";
import { hardhat } from "viem/chains";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full lg:w-[calc(100%-16rem)] z-10 p-4 bottom-0 right-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {isLocalNetwork && (
              <>
                <Faucet />
              </>
            )}
          </div>
          <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        </div>
      </div>
      <div className="w-full lg:w-[calc(100%-16rem)] lg:ml-auto">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="text-center">
              <a href="https://twitter.com/PowerWallet" target="_blank" rel="noreferrer" className="link">
                Twitter
              </a>
            </div>
            <span>·</span>
            <div className="text-center">
              <a href="https://t.me/PowerWallet" target="_blank" rel="noreferrer" className="link">
                Telegram
              </a>
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 mt-2 text-sm w-full">
            <div className="text-center">
              <p className="m-0">© Power Wallet {currentYear}. All Rights Reserved.</p>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};

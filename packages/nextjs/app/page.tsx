"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Image from "next/image";
import LandingNavBar from "~~/components/LandingNavBar";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (connectedAddress) {
      router.push("/dashboard");
    }
  }, [connectedAddress, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = sectionsRef.current?.querySelectorAll("section");
    sections?.forEach((section) => observer.observe(section));

    return () => {
      sections?.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <>
      <LandingNavBar />
      <div className="relative flex items-center flex-col flex-grow pt-10 mt-16 lg:mr-64 lg:mt-0">
        <div className="absolute inset-0 flex justify-center items-center">
          <Image
            src="/JaguarSun.jpg"
            alt="Jaguar Sun"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
          />
        </div>
        <div className="relative px-5 z-10 flex justify-end w-full lg:w-2/3">
          <h1 className="text-right text-white">
            <span className="block text-6xl font-bold mt-10 mb-2">The Power Law at Your Service</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-4">
            <span className="block text-4xl font-bold text-center text-white">Connect your wallet to access Dashboard!</span>
          </div>
        </div>
      </div>
      <div className="py-20 transition-all duration-500 lg:mr-64 ease-in-out transform translate-y-10">
      <span className="block text-4xl">Power Wallet</span>
      <span className="block text-2xl">helps you invest with confidence, making Bitcoin simple and worry-free.</span>
      </div>
      <div ref={sectionsRef}>
        <section id="bitcoin-power-law" className="py-20 transition-all duration-500 lg:mr-64 ease-in-out transform translate-y-10 opacity-0">
          <h2 className="text-3xl font-bold text-center">Bitcoin Power Law</h2>
          <div className="flex justify-center mt-4">
            <Image
              src="/PowerWalletChart.jpg"
              alt="Bitcoin Power Law"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
          <div className="border border-black p-4 mt-4">
            <p className="mt-10 text-center">
              The Bitcoin Power Law is a pattern showing that, over time, Bitcoin’s value tends to grow steadily despite short-term ups and downs. 
              It highlights the long-term growth potential, suggesting that holding Bitcoin can be beneficial even with market fluctuations.
            </p>
            <p className="text-right mt-2">- Giovanni Santostasi</p>
          </div>
        </section>
        <section id="our-strategies" className="py-20 lg:mr-64 transition-all duration-500 ease-in-out transform translate-y-10 opacity-0">
          <h2 className="text-3xl mb-10 font-bold text-center">Our Strategies</h2>
          <div className="flex flex-col lg:flex-row justify-center items-center mt-4">
            <div className="flex flex-col space-y-4 lg:w-2/3">
              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="text-xl font-bold">1. Dollar Cost Average</h3>
                <p className="mt-2">Description of Dollar Cost Average strategy...</p>
              </div>
              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="text-xl font-bold">2. Power Law Easy</h3>
                <p className="mt-2">Description of Easy Power Law strategy...</p>
              </div>
              <div className="card bg-base-100 shadow-md p-4">
                <h3 className="text-xl font-bold">3. Power Law Bold</h3>
                <p className="mt-2">Description of Power Law Bold strategy...</p>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Image
                src="/Sun.jpg"
                alt="Sun"
                width={400}
                height={400}
                className="rounded-lg"
              />
            </div>
          </div>
        </section>
        <section 
  id="about-us" 
  className="py-20 lg:mr-64 transition-all duration-500 ease-in-out transform translate-y-10 opacity-0"
>
  <h2 className="text-3xl font-bold text-center mb-12">About Us</h2>
  
  <div className="flex flex-col lg:flex-row justify-center items-center mt-4 space-y-8 lg:space-y-0 lg:space-x-8">
    {/* Jerome */}
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden relative">
        <div className="w-full h-full relative">
          <Image 
            src="/Jerome.jpg" 
            alt="Jerome" 
            fill
            style={{ objectFit: 'cover' }}
            sizes="160px"
            className="absolute inset-0"
          />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-xl font-bold">User Interface Designer</h3>
        <p className="mt-2">Jerome</p>
      </div>
    </div>

    {/* Viktor */}
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden relative">
        <div className="w-full h-full relative">
          <Image 
            src="/Viktor.png" 
            alt="Viktor" 
            fill
            style={{ objectFit: 'cover' }}
            sizes="160px"
            className="absolute inset-0"
          />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-xl font-bold">Full Stack Developer</h3>
        <p className="mt-2">Viktor</p>
      </div>
    </div>

    {/* Carlo */}
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden relative">
        <div className="w-full h-full relative">
          <Image 
            src="/Carlo.jpg" 
            alt="Carlo" 
            fill
            style={{ objectFit: 'cover' }}
            sizes="160px"
            className="absolute inset-0"
          />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-xl font-bold">Back End Developer</h3>
        <p className="mt-2">Carlo</p>
      </div>
    </div>

    {/* Nick */}
    <div className="flex flex-col items-center">
      <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden relative">
        <div className="w-full h-full relative">
          <Image 
            src="/Nick.jpg" 
            alt="Nick" 
            fill
            style={{ objectFit: 'cover' }}
            sizes="160px"
            className="absolute inset-0"
          />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h3 className="text-xl font-bold">Back End Developer</h3>
        <p className="mt-2">Nicky</p>
      </div>
    </div>
  </div>
</section>
      </div>
    </>
  );
};

export default Home;
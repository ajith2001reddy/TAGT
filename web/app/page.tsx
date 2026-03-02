"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?location=${location}&type=${type}`);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Perfect PG
        </h1>

        <p className="text-white/60 mb-10">
          Search verified PG accommodations near you.
        </p>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4 bg-neutral-900 p-4 rounded-xl"
        >
          <input
            placeholder="Enter Location"
            className="px-4 py-3 rounded bg-neutral-800"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <select
            className="px-4 py-3 rounded bg-neutral-800"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="boys">Boys PG</option>
            <option value="girls">Girls PG</option>
            <option value="co-living">Co-Living</option>
          </select>

          <button className="bg-violet-600 px-6 py-3 rounded font-semibold">
            Search
          </button>
        </form>
      </section>

      {/* Side Content */}
      <section className="bg-neutral-900 py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">
          Why Choose TAGT?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-bold mb-2">Verified Listings</h3>
            <p className="text-white/60">
              Only trusted PG properties listed.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Transparent Pricing</h3>
            <p className="text-white/60">
              No hidden charges or surprises.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Secure Payments</h3>
            <p className="text-white/60">
              Integrated safe online payment system.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
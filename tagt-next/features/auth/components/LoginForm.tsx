"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_HOME_ROUTE } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      router.push(ROLE_HOME_ROUTE[user.role]);
    } catch {
      setError("Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14141c] p-8 shadow-xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorMessage message={error} />

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" loading={submitting} className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}

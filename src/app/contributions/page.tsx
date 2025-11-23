"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";

interface DebtItem {
  itemId: string;
  itemTitle: string;
}

interface Debt {
  fromUser: string;
  fromUserId: string;
  toUser: string;
  toUserId: string;
  amount: number;
  items: DebtItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ContributionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const sessionResponse = await fetch("/api/auth/get-session");
        if (!sessionResponse.ok) {
          router.push("/auth/login");
          return;
        }

        const sessionData = await sessionResponse.json();
        setUser(sessionData.user);

        // Fetch debts
        const debtsResponse = await fetch("/api/contributions/debts");
        if (debtsResponse.ok) {
          const debtsData = await debtsResponse.json();
          setDebts(debtsData.debts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-noel-cream flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noel-cream">
      <Header user={user || undefined} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="text-noel-red hover:underline text-sm mb-4 inline-block"
        >
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold text-noel-green mb-2">
          💳 Partage des cadeaux
        </h1>
        <p className="text-noel-text mb-8">
          Voir qui doit combien pour les cadeaux partagés
        </p>

        {debts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-noel-text text-lg mb-4">
              Aucun partage de cadeau pour le moment
            </p>
            <Link href="/dashboard" className="btn-primary inline-block">
              Voir mes listes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {debts.map((debt, idx) => (
              <div key={idx} className="card border-l-4 border-noel-red">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-noel-text">
                    {debt.fromUser} doit à {debt.toUser}
                  </span>
                  <span className="text-2xl font-bold text-noel-red">
                    {debt.amount.toFixed(2)}€
                  </span>
                </div>

                {debt.items.length > 0 && (
                  <div className="text-sm text-noel-text">
                    <p className="font-medium mb-1">Cadeaux concernés :</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {debt.items.map((item, i) => (
                        <li key={i}>{item.itemTitle}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 card bg-noel-green/5 border border-noel-green">
          <h3 className="font-bold text-noel-green mb-2">ℹ️ Comment ça fonctionne</h3>
          <p className="text-noel-text text-sm">
            Quand plusieurs personnes participent au même cadeau, l'application calcule qui doit
            combien à qui. Les débts sont simplifiés pour éviter les remboursements circulaires.
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { getDebts, getUserContributions, upsertContribution, deleteContribution } from "@/actions";
import toast from "@/lib/utils/toaster";

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

interface Contribution {
  id: string;
  itemId: string;
  amount: number;
  totalPrice: number | null;
  note: string | null;
  item: {
    id: string;
    title: string;
    list: {
      id: string;
      title: string;
      userId: string;
    };
  };
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
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContribution, setEditingContribution] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editTotalPrice, setEditTotalPrice] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Fetch debts and contributions
      const [debtsResult, contributionsResult] = await Promise.all([
        getDebts(),
        getUserContributions(),
      ]);

      if (debtsResult.success) {
        setDebts(debtsResult.data.debts);
      }

      if (contributionsResult.success) {
        setContributions(contributionsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const startEditContribution = (contrib: Contribution) => {
    setEditingContribution(contrib.itemId);
    setEditAmount(contrib.amount.toString());
    setEditTotalPrice(contrib.totalPrice?.toString() || "");
    setEditNote(contrib.note || "");
  };

  const handleEditContribution = async (itemId: string) => {
    if (!editAmount) {
      toast.error("Veuillez entrer un montant");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await upsertContribution({
        itemId,
        amount: parseFloat(editAmount),
        totalPrice: editTotalPrice ? parseFloat(editTotalPrice) : undefined,
        note: editNote || undefined,
      });

      if (result.success) {
        toast.success("Contribution modifiée !");
        setEditingContribution(null);
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating contribution:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContribution = async (itemId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette contribution ?")) return;

    setIsSubmitting(true);
    try {
      const result = await deleteContribution(itemId);

      if (result.success) {
        toast.success("Contribution supprimée !");
        await fetchData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting contribution:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          💳 Mes Contributions
        </h1>
        <p className="text-noel-text mb-8">
          Gérez vos contributions et consultez les partages de cadeaux
        </p>

        {/* Section: Mes contributions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-noel-red mb-4">
            Mes contributions
          </h2>

          {contributions.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-noel-text">
                Vous n'avez pas encore participé à un cadeau
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contributions.map((contrib) => (
                <div key={contrib.id} className="card">
                  {editingContribution === contrib.itemId ? (
                    // Mode édition
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-noel-text mb-2">
                        {contrib.item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Liste: {contrib.item.list.title}
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-noel-text mb-1">
                          Prix total du produit (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editTotalPrice}
                          onChange={(e) => setEditTotalPrice(e.target.value)}
                          className="input-field"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-noel-text mb-1">
                          Ma participation (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="input-field"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-noel-text mb-1">
                          Note (optionnelle)
                        </label>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="input-field"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditContribution(contrib.itemId)}
                          className="btn-primary flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Modification..." : "Enregistrer"}
                        </button>
                        <button
                          onClick={() => setEditingContribution(null)}
                          className="btn-outline flex-1"
                          disabled={isSubmitting}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-noel-text">
                            {contrib.item.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Liste: {contrib.item.list.title}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditContribution(contrib)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            disabled={isSubmitting}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteContribution(contrib.itemId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={isSubmitting}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-noel-text">
                        <div>
                          <span className="font-medium">Ma participation:</span>{" "}
                          <span className="text-noel-green font-bold">
                            {contrib.amount.toFixed(2)}€
                          </span>
                        </div>
                        {contrib.totalPrice && (
                          <div>
                            <span className="font-medium">Prix total:</span>{" "}
                            {contrib.totalPrice.toFixed(2)}€
                          </div>
                        )}
                      </div>

                      {contrib.note && (
                        <p className="text-sm text-gray-600 italic mt-2">
                          Note: {contrib.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Partage des cadeaux */}
        <div>
          <h2 className="text-2xl font-bold text-noel-red mb-4">
            Partage des cadeaux
          </h2>

          {debts.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-noel-text">
                Aucun partage de cadeau pour le moment
              </p>
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
        </div>

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

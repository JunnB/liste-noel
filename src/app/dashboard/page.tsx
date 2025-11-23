"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRecentActivity, getStats } from "@/actions/activity";
import toast from "@/lib/utils/toaster";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import StatsCards from "@/components/dashboard/StatsCards";
import type { Activity } from "@/lib/use-cases/activity";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ eventsCount: 0, contributionsCount: 0, itemsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/get-session");
        if (!sessionResponse.ok) {
          router.push("/auth/login");
          return;
        }

        const sessionData = await sessionResponse.json();
        
        if (!sessionData || !sessionData.user) {
          router.push("/auth/login");
          return;
        }

        setUser(sessionData.user);

        // Récupérer l'activité récente
        const activityResult = await getRecentActivity();
        if (activityResult.success) {
          setActivities(activityResult.data);
        } else {
          toast.error(activityResult.error);
        }

        // Récupérer les statistiques
        const statsResult = await getStats();
        if (statsResult.success) {
          setStats(statsResult.data);
        } else {
          toast.error(statsResult.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-noel-text">Chargement...</div>
      </div>
    );
  }

  const hasNoActivity = stats.eventsCount === 0 && stats.contributionsCount === 0 && stats.itemsCount === 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Section 1: Bienvenue */}
      <div className="bg-gradient-to-r from-noel-red/10 via-noel-gold/10 to-noel-green/10 p-6 rounded-xl border border-noel-red/20">
        <h1 className="text-3xl font-bold text-noel-text mb-2">
          Bonjour {user?.name} 👋
        </h1>
        <p className="text-gray-600">
          {stats.eventsCount} {stats.eventsCount > 1 ? "événements" : "événement"} • {stats.contributionsCount} {stats.contributionsCount > 1 ? "contributions" : "contribution"}
        </p>
      </div>

      {/* Message si aucune activité */}
      {hasNoActivity && (
        <div className="bg-white p-8 rounded-xl border-2 border-dashed border-noel-red/20 text-center">
          <div className="text-6xl mb-4">🎄</div>
          <h3 className="text-xl font-bold text-noel-text mb-2">
            Bienvenue sur votre espace de Noël !
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer un groupe ou rejoindre celui de vos proches.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/events" 
              className="bg-noel-red text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-noel-red/20"
            >
              <span>+</span> Créer un groupe
            </Link>
            <Link 
              href="/events/join" 
              className="bg-white border-2 border-noel-green text-noel-green px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Rejoindre un groupe
            </Link>
          </div>
        </div>
      )}

      {/* Section 2: Stats Cards (si activité) */}
      {!hasNoActivity && (
        <StatsCards 
          eventsCount={stats.eventsCount}
          contributionsCount={stats.contributionsCount}
          itemsCount={stats.itemsCount}
        />
      )}

      {/* Section 3: Activité Récente */}
      {!hasNoActivity && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-noel-text">📅 Activité Récente</h2>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      )}

      {/* Section 4: Raccourcis Rapides */}
      {!hasNoActivity && (
        <div>
          <h2 className="text-2xl font-bold text-noel-text mb-4">🎯 Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/events"
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-noel-red hover:shadow-md transition-all text-center"
            >
              <div className="text-4xl mb-3">🎁</div>
              <div className="font-bold text-noel-text">Mes Événements</div>
              <div className="text-sm text-gray-500 mt-1">Gérer mes événements</div>
            </Link>
            <Link
              href="/contributions"
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-noel-gold hover:shadow-md transition-all text-center"
            >
              <div className="text-4xl mb-3">💰</div>
              <div className="font-bold text-noel-text">Contributions</div>
              <div className="text-sm text-gray-500 mt-1">Voir mes participations</div>
            </Link>
            <Link
              href="/events"
              className="bg-gradient-to-br from-noel-green/10 to-emerald-50 p-6 rounded-xl border border-noel-green/20 hover:shadow-md transition-all text-center"
            >
              <div className="text-4xl mb-3">➕</div>
              <div className="font-bold text-noel-text">Créer un Groupe</div>
              <div className="text-sm text-gray-500 mt-1">Nouveau groupe de cadeaux</div>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

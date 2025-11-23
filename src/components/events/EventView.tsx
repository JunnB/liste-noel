"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MyListTab from "./MyListTab";
import ParticipantsTab from "./ParticipantsTab";
import toast from "@/lib/utils/toaster";

// Types (simplifiés ou importés)
interface User {
  id: string;
  name: string;
  email: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  invitationCode: string;
  participants: Array<{
    id: string;
    user: User;
  }>;
  lists: any[]; // On laissera ParticipantsTab gérer le typage précis
}

interface EventViewProps {
  event: Event;
  myList: any; // MyListTab gérera le typage
  user: User;
  onRefresh: () => void;
}

export default function EventView({ event, myList, user, onRefresh }: EventViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my-list" | "participants">("my-list");

  const handleCopyCode = () => {
    const url = `${window.location.origin}/events/join?code=${event.invitationCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié ! Partagez-le à vos proches.");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header simple */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-noel-red mb-1">{event.title}</h1>
            {event.description && (
              <p className="text-gray-600 text-sm">{event.description}</p>
            )}
          </div>
          <button
            onClick={handleCopyCode}
            className="bg-noel-gold/10 text-noel-olive px-4 py-2 rounded-lg text-sm font-bold hover:bg-noel-gold/20 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span>🔗</span> Inviter
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("my-list")}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === "my-list"
              ? "bg-white text-noel-red shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Ma Liste 📝
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === "participants"
              ? "bg-white text-noel-green shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Participants 🎁
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === "my-list" ? (
          <MyListTab 
            eventId={event.id} 
            list={myList} 
            onRefresh={onRefresh} 
          />
        ) : (
          <ParticipantsTab 
            participants={event.participants} 
            lists={event.lists} 
            currentUser={user}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
}


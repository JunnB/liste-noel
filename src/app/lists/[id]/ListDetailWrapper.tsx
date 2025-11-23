"use client";

import Header from "@/components/Header";
import ListDetailClient from "./ListDetailClient";

interface Item {
  id: string;
  title: string;
  description: string | null;
  amazonUrl: string | null;
  desiredAmount: number | null;
}

interface ListData {
  id: string;
  title: string;
  description: string | null;
  eventId: string;
  items: Item[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ListDetailWrapperProps {
  list: ListData;
  user: User;
}

export default function ListDetailWrapper({
  list,
  user,
}: ListDetailWrapperProps) {
  return (
    <div className="min-h-screen bg-noel-cream">
      <Header user={user} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ListDetailClient list={list} />
      </main>
    </div>
  );
}



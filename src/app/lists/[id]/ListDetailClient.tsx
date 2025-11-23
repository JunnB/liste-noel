"use client";

import { useState } from "react";
import Link from "next/link";
import { createListItem } from "@/actions/lists";
import { updateItem, deleteItem } from "@/actions/items";
import toast from "@/lib/utils/toaster";

interface Item {
  id: string;
  title: string;
  description: string | null;
  amazonUrl: string | null;
}

interface ListData {
  id: string;
  title: string;
  description: string | null;
  eventId: string;
  items: Item[];
}

interface ListDetailClientProps {
  list: ListData;
}

export default function ListDetailClient({ list }: ListDetailClientProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    amazonUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState({
    title: "",
    description: "",
    amazonUrl: "",
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await createListItem({
        listId: list.id,
        title: newItem.title,
        description: newItem.description || undefined,
        amazonUrl: newItem.amazonUrl || undefined,
      });

      if (result.success) {
        toast.success("Article ajouté avec succès");
        setNewItem({
          title: "",
          description: "",
          amazonUrl: "",
        });
        setShowAddItem(false);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Erreur lors de l'ajout de l'article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editItem.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await updateItem(itemId, {
        title: editItem.title,
        description: editItem.description || undefined,
        amazonUrl: editItem.amazonUrl || undefined,
      });

      if (result.success) {
        toast.success("Article modifié avec succès");
        setEditingItemId(null);
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Erreur lors de la modification de l'article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    setIsSubmitting(true);

    try {
      const result = await deleteItem(itemId);

      if (result.success) {
        toast.success("Article supprimé avec succès");
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Erreur lors de la suppression de l'article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditItem = (item: Item) => {
    setEditingItemId(item.id);
    setEditItem({
      title: item.title,
      description: item.description || "",
      amazonUrl: item.amazonUrl || "",
    });
  };

  return (
    <>
      {/* List Header */}
      <div className="mb-8">
        <Link
          href={`/events/${list.eventId}`}
          className="text-noel-red hover:underline text-sm mb-4 inline-block"
        >
          ← Retour à l'événement
        </Link>
        <h1 className="text-4xl font-bold text-noel-red mb-2">{list.title}</h1>
        {list.description && (
          <p className="text-noel-text text-lg mb-4">{list.description}</p>
        )}

        <div className="bg-noel-gold/20 border border-noel-gold rounded-lg p-4 mb-6">
          <p className="text-sm text-noel-text">
            💡 Ceci est votre liste personnelle. Les autres participants de l'événement peuvent voir vos articles et contribuer aux cadeaux.
          </p>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddItem && (
        <div className="card mb-8">
          <h3 className="text-lg font-bold text-noel-text mb-4">
            Ajouter un article
          </h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-noel-text mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) =>
                  setNewItem({ ...newItem, title: e.target.value })
                }
                className="input-field"
                placeholder="Ex: PlayStation 5"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noel-text mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="input-field min-h-20"
                placeholder="Détails, couleur, taille, etc..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-noel-text mb-1">
                Lien Amazon (optionnel)
              </label>
              <input
                type="url"
                value={newItem.amazonUrl}
                onChange={(e) =>
                  setNewItem({ ...newItem, amazonUrl: e.target.value })
                }
                className="input-field"
                placeholder="https://amazon.fr/..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter l'article"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="btn-outline flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAddItem && (
        <button
          onClick={() => setShowAddItem(true)}
          className="btn-primary mb-8 w-full sm:w-auto"
        >
          + Ajouter un article
        </button>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {list.items.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-noel-text text-lg mb-4">
              Aucun article pour le moment
            </p>
            <button onClick={() => setShowAddItem(true)} className="btn-secondary">
              Ajouter un article
            </button>
          </div>
        ) : (
          list.items.map((item) => (
            <div key={item.id} className="card">
              {editingItemId === item.id ? (
                // Mode édition
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-noel-text mb-1">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      value={editItem.title}
                      onChange={(e) =>
                        setEditItem({ ...editItem, title: e.target.value })
                      }
                      className="input-field"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-noel-text mb-1">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={editItem.description}
                      onChange={(e) =>
                        setEditItem({ ...editItem, description: e.target.value })
                      }
                      className="input-field min-h-20"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-noel-text mb-1">
                      Lien Amazon (optionnel)
                    </label>
                    <input
                      type="url"
                      value={editItem.amazonUrl}
                      onChange={(e) =>
                        setEditItem({ ...editItem, amazonUrl: e.target.value })
                      }
                      className="input-field"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditItem(item.id)}
                      className="btn-primary flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Modification..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => setEditingItemId(null)}
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
                    <h3 className="text-lg font-bold text-noel-red">{item.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditItem(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        disabled={isSubmitting}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={isSubmitting}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-noel-text text-sm mb-2">{item.description}</p>
                  )}

                  {item.amazonUrl && (
                    <a
                      href={item.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-noel-red hover:underline text-sm inline-block mb-2"
                    >
                      🔗 Voir sur Amazon
                    </a>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}



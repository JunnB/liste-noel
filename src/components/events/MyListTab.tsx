"use client";

import { useState } from "react";
import { createListItem, createList } from "@/actions/lists";
import { updateItem, deleteItem } from "@/actions/items";
import toast from "@/lib/utils/toaster";
import Modal from "@/components/ui/Modal";

interface Item {
  id: string;
  title: string;
  description: string | null;
  amazonUrl: string | null;
}

interface MyList {
  id: string;
  title: string;
  description: string | null;
  items: Item[];
}

interface MyListTabProps {
  eventId: string;
  list: MyList | null;
  onRefresh: () => void;
}

export default function MyListTab({ eventId, list, onRefresh }: MyListTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amazonUrl: "",
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: "", description: "", amazonUrl: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      amazonUrl: item.amazonUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleCreateList = async () => {
    setIsSubmitting(true);
    try {
      const res = await createList({
        eventId,
        title: "Ma Liste de Noël",
      });
      if (res.success) {
        toast.success("Liste créée !");
        onRefresh();
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur création liste");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      let result;
      
      if (editingItem) {
        result = await updateItem(editingItem.id, {
          title: formData.title,
          description: formData.description || undefined,
          amazonUrl: formData.amazonUrl || undefined,
        });
      } else {
        if (!list) {
           // Should not happen as button is hidden if no list, but safety check
           toast.error("Erreur: Liste introuvable");
           return;
        }
        result = await createListItem({
          listId: list.id,
          title: formData.title,
          description: formData.description || undefined,
          amazonUrl: formData.amazonUrl || undefined,
        });
      }

      if (result.success) {
        toast.success(editingItem ? "Article modifié" : "Article ajouté");
        setIsModalOpen(false);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    
    try {
      const res = await deleteItem(itemId);
      if (res.success) {
        toast.success("Article supprimé");
        onRefresh();
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur suppression");
    }
  };

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-noel-red/10 rounded-full flex items-center justify-center text-3xl mb-4">
          📝
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Vous n'avez pas encore de liste
        </h3>
        <p className="text-gray-500 mb-6 max-w-xs">
          Créez votre liste pour permettre aux autres participants de voir ce que vous souhaitez.
        </p>
        <button 
          onClick={handleCreateList}
          disabled={isSubmitting}
          className="bg-noel-red text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-noel-red/20 hover:bg-red-700 transition-all active:scale-95"
        >
          {isSubmitting ? "Création..." : "Créer ma liste"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-noel-text">
          Ma Liste ({list.items.length})
        </h3>
      </div>

      {/* Add Button - Big and clear */}
      <button
        onClick={openAddModal}
        className="w-full py-4 border-2 border-dashed border-noel-red/30 rounded-xl flex items-center justify-center gap-2 text-noel-red font-medium hover:bg-noel-red/5 transition-colors"
      >
        <span className="text-xl font-bold">+</span> Ajouter un souhait
      </button>

      {/* Items Grid */}
      <div className="space-y-3">
        {list.items.length === 0 ? (
          <p className="text-center text-gray-400 italic py-4">
            Votre liste est vide pour le moment.
          </p>
        ) : (
          list.items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 mb-1 truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                )}
                {item.amazonUrl && (
                  <a 
                    href={item.amazonUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    🔗 Lien web
                  </a>
                )}
              </div>
              <div className="flex gap-1 ml-3">
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Modifier"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Modifier le souhait" : "Ajouter un souhait"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du cadeau *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-red focus:border-transparent outline-none"
              placeholder="Ex: Une paire de chaussettes"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (taille, couleur...)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-red focus:border-transparent outline-none min-h-[100px]"
              placeholder="Détails supplémentaires pour ne pas se tromper"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien (Amazon, Fnac...)
            </label>
            <input
              type="url"
              value={formData.amazonUrl}
              onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-red focus:border-transparent outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-noel-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


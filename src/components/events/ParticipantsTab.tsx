"use client";

import { useState } from "react";
import { upsertContribution, deleteContribution, createBonusItem } from "@/actions";
import { updateItem, deleteItem } from "@/actions";
import toast from "@/lib/utils/toaster";
import { formatAmountValue } from "@/lib/utils/format";
import ContributionModal from "@/components/events/ContributionModal";
import ContributionStatusBadge from "@/components/events/ContributionStatusBadge";
import Modal from "@/components/ui/Modal";

// Types adaptées pour l'affichage
interface User {
  id: string;
  name: string;
  email: string;
}

interface Contribution {
  id: string;
  userId: string;
  amount: number;
  totalPrice?: number | null;
  contributionType?: string;
  note?: string;
  user: User;
}

interface Item {
  id: string;
  title: string;
  description?: string;
  amazonUrl?: string;
  isBonus?: boolean;
  addedByUserId?: string | null;
  contributions: Contribution[];
}

interface List {
  id: string;
  user: User;
  items: Item[];
}

interface Participant {
  id: string; // Participant ID (not user ID)
  user: User;
}

interface ParticipantsTabProps {
  participants: Participant[];
  lists: List[];
  currentUser: User | null;
  onRefresh: () => void;
}

export default function ParticipantsTab({ participants, lists, currentUser, onRefresh }: ParticipantsTabProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  // Contribution State
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);

  // Bonus Item State
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [editingBonusItem, setEditingBonusItem] = useState<Item | null>(null);
  const [bonusFormData, setBonusFormData] = useState({
    title: "",
    description: "",
    amazonUrl: "",
  });

  const selectedList = lists.find(l => l.id === selectedListId);
  
  // Filtrer les participants pour ne pas montrer soi-même
  const otherParticipants = participants.filter(p => p.user.id !== currentUser?.id);

  const getListForUser = (userId: string) => lists.find(l => l.user.id === userId);

  const handleOpenContribution = (item: Item, contribution?: Contribution) => {
    setSelectedItem(item);
    setEditingContribution(contribution || null);
    setContributionModalOpen(true);
  };

  const handleContribute = async (data: {
    contributionType: "FULL" | "PARTIAL";
    amount?: number;
    totalPrice?: number;
    note?: string;
  }) => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const result = await upsertContribution({
        itemId: selectedItem.id,
        ...data,
      });

      if (result.success) {
        toast.success("Contribution enregistrée !");
        setContributionModalOpen(false);
        setSelectedItem(null);
        setEditingContribution(null);
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContribution = async (itemId: string) => {
    if (!confirm("Supprimer votre participation ?")) return;
    try {
      const result = await deleteContribution(itemId);
      if (result.success) {
        toast.success("Participation supprimée");
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur");
    }
  };

  const handleOpenBonusModal = () => {
    setEditingBonusItem(null);
    setBonusFormData({ title: "", description: "", amazonUrl: "" });
    setBonusModalOpen(true);
  };

  const handleEditBonusItem = (item: Item) => {
    setEditingBonusItem(item);
    setBonusFormData({
      title: item.title,
      description: item.description || "",
      amazonUrl: item.amazonUrl || "",
    });
    setBonusModalOpen(true);
  };

  const handleSubmitBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusFormData.title.trim()) return;

    setIsSubmitting(true);
    try {
      let result;
      
      if (editingBonusItem) {
        // Modifier un cadeau bonus existant
        result = await updateItem(editingBonusItem.id, {
          title: bonusFormData.title,
          description: bonusFormData.description || undefined,
          amazonUrl: bonusFormData.amazonUrl || undefined,
        });
      } else {
        // Créer un nouveau cadeau bonus
        if (!selectedListId) return;
        result = await createBonusItem({
          listId: selectedListId,
          title: bonusFormData.title,
          description: bonusFormData.description || undefined,
          amazonUrl: bonusFormData.amazonUrl || undefined,
        });
      }

      if (result.success) {
        toast.success(editingBonusItem ? "Cadeau bonus modifié ! ✏️" : "Cadeau bonus ajouté ! 🎁");
        setBonusModalOpen(false);
        setEditingBonusItem(null);
        setBonusFormData({ title: "", description: "", amazonUrl: "" });
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

  const handleDeleteBonusItem = async (itemId: string) => {
    if (!confirm("Supprimer ce cadeau bonus ?")) return;
    
    try {
      const result = await deleteItem(itemId);
      if (result.success) {
        toast.success("Cadeau bonus supprimé");
        onRefresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur suppression");
    }
  };

  // Calculs pour la barre de progression
  const getProgress = (item: Item) => {
    const price = item.contributions.find(c => c.totalPrice)?.totalPrice || 0;
    // Arrondir à 2 décimales pour éviter les erreurs de précision
    const contributed = Math.round(item.contributions.reduce((sum, c) => sum + c.amount, 0) * 100) / 100;
    const roundedPrice = Math.round(price * 100) / 100;
    return {
      price: roundedPrice,
      contributed,
      percent: roundedPrice > 0 ? Math.min((contributed / roundedPrice) * 100, 100) : 0
    };
  };

  // Calculer les stats pour un participant
  const getParticipantStats = (list: List | undefined) => {
    if (!list) return { total: 0, completed: 0, inProgress: 0 };
    
    const total = list.items.length;
    let completed = 0;
    let inProgress = 0;

    list.items.forEach(item => {
      const { price, contributed } = getProgress(item);
      // Tolérance de 0.01€ pour les erreurs d'arrondi
      if (price > 0 && contributed >= price - 0.01) {
        completed++;
      } else if (item.contributions.length > 0) {
        inProgress++;
      }
    });

    return { total, completed, inProgress };
  };

  // VUE 1: Grille des participants
  if (!selectedListId) {
    return (
      <div className="pb-20">
        <h3 className="text-lg font-bold text-noel-text mb-4">
          Famille & Amis ({otherParticipants.length})
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {otherParticipants.map((p) => {
            const list = getListForUser(p.user.id);
            const stats = getParticipantStats(list);

            return (
              <button
                key={p.id}
                onClick={() => {
                  if (list) setSelectedListId(list.id);
                  else toast.info(`${p.user.name} n'a pas encore créé de liste`);
                }}
                className={`p-4 rounded-xl border transition-all text-left
                  ${list 
                    ? "bg-white border-gray-200 hover:border-noel-red hover:shadow-lg cursor-pointer" 
                    : "bg-gray-50 border-dashed border-gray-200 opacity-70 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-noel-green/20 to-emerald-100 flex items-center justify-center text-lg font-bold text-noel-green shadow-inner flex-shrink-0">
                    {p.user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-base mb-0.5 truncate">
                      {p.user.name}
                    </div>
                    {list ? (
                      <div className="text-xs text-gray-500">
                        {stats.total} cadeau{stats.total > 1 ? "x" : ""}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Pas de liste
                      </div>
                    )}
                  </div>
                </div>

                {list && stats.total > 0 && (
                  <div className="flex gap-2 text-xs">
                    {stats.completed > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                        <span>✓</span>
                        <span>{stats.completed} terminé{stats.completed > 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {stats.inProgress > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                        <span>⏳</span>
                        <span>{stats.inProgress} en cours</span>
                      </div>
                    )}
                    {stats.total - stats.completed - stats.inProgress > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full font-medium">
                        <span>○</span>
                        <span>{stats.total - stats.completed - stats.inProgress} restant{stats.total - stats.completed - stats.inProgress > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {otherParticipants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Personne d'autre n'a rejoint l'événement pour le moment.
            <div className="mt-2 text-sm text-noel-red">Invitez vos proches !</div>
          </div>
        )}
      </div>
    );
  }

  // VUE 2: Détail de la liste d'un participant
  if (!selectedList) return null;

  // Trier les items : non terminés en premier
  const sortedItems = [...selectedList.items].sort((a, b) => {
    const aProgress = getProgress(a);
    const bProgress = getProgress(b);
    
    // Tolérance de 0.01€ pour les erreurs d'arrondi
    const aCompleted = aProgress.price > 0 && aProgress.contributed >= aProgress.price - 0.01;
    const bCompleted = bProgress.price > 0 && bProgress.contributed >= bProgress.price - 0.01;
    
    // Non terminés d'abord
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    return 0;
  });

  const stats = getParticipantStats(selectedList);

  return (
    <div className="pb-20 space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => setSelectedListId(null)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-noel-text">
            Liste de {selectedList.user.name}
          </h3>
          <div className="flex gap-2 mt-1">
            {stats.completed > 0 && (
              <span className="text-xs text-green-600 font-medium">
                ✓ {stats.completed} terminé{stats.completed > 1 ? "s" : ""}
              </span>
            )}
            {stats.inProgress > 0 && (
              <span className="text-xs text-orange-600 font-medium">
                ⏳ {stats.inProgress} en cours
              </span>
            )}
            {stats.total - stats.completed - stats.inProgress > 0 && (
              <span className="text-xs text-gray-500 font-medium">
                ○ {stats.total - stats.completed - stats.inProgress} restant{stats.total - stats.completed - stats.inProgress > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Ajouter Cadeau Bonus */}
      <button
        onClick={handleOpenBonusModal}
        className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center gap-2 text-purple-600 font-medium hover:bg-purple-50 transition-colors"
      >
        <span className="text-xl">🎁</span>
        <span>Ajouter un cadeau bonus surprise</span>
      </button>

      {/* Items List */}
      <div className="space-y-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">Cette liste est vide pour le moment.</p>
          </div>
        ) : (
          sortedItems.map((item) => {
            const { price, contributed, percent } = getProgress(item);
            const myContribution = item.contributions.find(c => c.userId === currentUser?.id);
            // Tolérance de 0.01€ pour les erreurs d'arrondi
            const isFullyFunded = price > 0 && contributed >= price - 0.01;
            
            // Détecter si quelqu'un a pris en entier
            const isTakenFull = item.contributions.some(c => c.contributionType === 'FULL');
            const takenByUser = isTakenFull ? item.contributions.find(c => c.contributionType === 'FULL')?.user.name : null;

            // Vérifier si l'utilisateur est l'ajouteur du cadeau bonus
            const isBonusAdder = item.isBonus && item.addedByUserId === currentUser?.id;

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                    {item.isBonus && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                        🎁 Bonus
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.amazonUrl && (
                      <a href={item.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                        Lien
                      </a>
                    )}
                    {/* Boutons d'édition/suppression pour l'ajouteur du cadeau bonus */}
                    {isBonusAdder && (
                      <div className="flex gap-1 ml-2">
                        <button 
                          onClick={() => handleEditBonusItem(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          aria-label="Modifier"
                          title="Modifier ce cadeau bonus"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteBonusItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Supprimer"
                          title="Supprimer ce cadeau bonus"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                )}

                {/* Status Badge et Progress Bar */}
                <div className="mb-4">
                  <ContributionStatusBadge
                    totalPrice={price}
                    contributed={contributed}
                    contributorsCount={item.contributions.length}
                  />
                </div>

                {/* Qui participe - Liste des noms */}
                {item.contributions.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Qui participe :</div>
                    <div className="flex flex-wrap gap-2">
                      {item.contributions.map((c) => (
                        <div 
                          key={c.id} 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full text-xs"
                        >
                          <span className="font-medium text-gray-700">{c.user.name}</span>
                          <span className="text-gray-500">•</span>
                          <span className="font-bold text-noel-green">{formatAmountValue(c.amount)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                  {myContribution ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenContribution(item, myContribution)}
                        className="text-sm text-blue-600 font-medium px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Modifier ma part ({formatAmountValue(myContribution.amount)}€)
                      </button>
                      <button
                        onClick={() => handleDeleteContribution(item.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : isTakenFull ? (
                    <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-lg">
                      Pris en entier par {takenByUser}
                    </div>
                  ) : isFullyFunded ? (
                    <div className="text-sm text-green-600 px-3 py-2 bg-green-50 rounded-lg font-medium">
                      ✓ Cadeau financé !
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenContribution(item)}
                      className="text-sm font-bold px-4 py-2 rounded-lg bg-noel-green text-white hover:bg-green-700 shadow-lg shadow-noel-green/20"
                    >
                      Je participe 🎁
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Contribution */}
      {selectedItem && (
        <ContributionModal
          isOpen={contributionModalOpen}
          onClose={() => {
            setContributionModalOpen(false);
            setSelectedItem(null);
            setEditingContribution(null);
          }}
          itemTitle={selectedItem.title}
          existingContribution={editingContribution || undefined}
          existingTotalPrice={
            selectedItem.contributions.find((c) => c.totalPrice)?.totalPrice || undefined
          }
          alreadyContributed={
            selectedItem.contributions
              .filter(c => c.userId !== currentUser?.id)
              .reduce((sum, c) => sum + c.amount, 0)
          }
          onSubmit={handleContribute}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal Cadeau Bonus */}
      <Modal
        isOpen={bonusModalOpen}
        onClose={() => {
          setBonusModalOpen(false);
          setEditingBonusItem(null);
        }}
        title={editingBonusItem ? "✏️ Modifier le cadeau bonus" : "🎁 Ajouter un cadeau bonus surprise"}
      >
        {!editingBonusItem && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>💡 Astuce :</strong> Ce cadeau sera visible par tous les participants 
              <strong> sauf {selectedList.user.name}</strong>. C'est une surprise ! 🤫
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitBonus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du cadeau *
            </label>
            <input
              type="text"
              value={bonusFormData.title}
              onChange={(e) => setBonusFormData({ ...bonusFormData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="Ex: Un livre surprise"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (taille, couleur...)
            </label>
            <textarea
              value={bonusFormData.description}
              onChange={(e) => setBonusFormData({ ...bonusFormData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[100px]"
              placeholder="Détails supplémentaires pour coordonner avec les autres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lien (Amazon, Fnac...)
            </label>
            <input
              type="url"
              value={bonusFormData.amazonUrl}
              onChange={(e) => setBonusFormData({ ...bonusFormData, amazonUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting 
                ? (editingBonusItem ? "Modification..." : "Ajout en cours...") 
                : (editingBonusItem ? "Modifier le cadeau 🎁" : "Ajouter la surprise 🎁")
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

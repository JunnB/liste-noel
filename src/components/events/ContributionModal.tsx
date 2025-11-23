"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

type ContributionType = "FULL" | "PARTIAL";

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  existingContribution?: {
    amount: number;
    totalPrice?: number | null;
    contributionType?: string;
    note?: string;
    hasAdvanced?: boolean;
  };
  existingTotalPrice?: number;
  alreadyContributed?: number; // Montant déjà contribué par d'autres
  onSubmit: (data: {
    contributionType: ContributionType;
    amount?: number;
    totalPrice?: number;
    note?: string;
    hasAdvanced?: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function ContributionModal({
  isOpen,
  onClose,
  itemTitle,
  existingContribution,
  existingTotalPrice,
  alreadyContributed = 0,
  onSubmit,
  isSubmitting,
}: ContributionModalProps) {
  // Détection automatique du mode
  const isJoiningExisting = !!existingTotalPrice && !existingContribution;
  const isFirstContribution = !existingTotalPrice && !existingContribution;
  
  const [contributionType, setContributionType] = useState<ContributionType>(
    existingContribution?.contributionType === "PARTIAL" ? "PARTIAL" : "FULL"
  );
  const [totalPrice, setTotalPrice] = useState(
    existingContribution?.totalPrice?.toString() || existingTotalPrice?.toString() || ""
  );
  const [amount, setAmount] = useState(
    existingContribution?.amount?.toString() || ""
  );
  const [note, setNote] = useState(existingContribution?.note || "");
  const [hasAdvanced, setHasAdvanced] = useState(existingContribution?.hasAdvanced || false);

  // Calculer le reste à payer
  const remaining = existingTotalPrice ? existingTotalPrice - alreadyContributed : 0;

  const handleTakeRemaining = () => {
    if (remaining > 0) {
      setAmount(remaining.toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: {
      contributionType: ContributionType;
      amount?: number;
      totalPrice?: number;
      note?: string;
      hasAdvanced?: boolean;
    } = {
      contributionType,
      hasAdvanced: contributionType === "PARTIAL" ? hasAdvanced : false,
    };

    // Validation et construction des données
    if (contributionType === "FULL") {
      if (!totalPrice) {
        alert("Veuillez indiquer le prix total");
        return;
      }
      data.totalPrice = parseFloat(totalPrice);
      // Pour FULL, on n'envoie pas de note
    } else {
      // PARTIAL
      if (!amount) {
        alert("Veuillez indiquer votre participation");
        return;
      }
      data.amount = parseFloat(amount);
      
      // Prix total si on lance un partage (première contribution)
      if (isFirstContribution && totalPrice) {
        data.totalPrice = parseFloat(totalPrice);
        // Note uniquement pour lancer un partage
        if (note.trim()) {
          data.note = note.trim();
        }
      }
    }

    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingContribution ? "Modifier ma participation" : "Participer au cadeau"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom du cadeau */}
        <div className="bg-gradient-to-r from-noel-green/10 to-emerald-50 p-4 rounded-lg border border-noel-green/20">
          <p className="text-sm font-medium text-gray-900">{itemTitle}</p>
        </div>

        {/* CAS 1: Rejoindre un partage existant */}
        {isJoiningExisting && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Prix total:</span> {existingTotalPrice}€
              </p>
              {remaining > 0 && (
                <p className="text-sm text-blue-900 mt-1">
                  <span className="font-medium">Reste à financer:</span> {remaining.toFixed(2)}€
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre participation (€) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                  placeholder="Ex: 15.00"
                  required
                />
                {remaining > 0 && (
                  <button
                    type="button"
                    onClick={handleTakeRemaining}
                    className="px-4 py-3 bg-noel-green/10 text-noel-green rounded-lg font-medium hover:bg-noel-green/20 transition-colors whitespace-nowrap"
                  >
                    Prendre le reste ({remaining.toFixed(2)}€)
                  </button>
                )}
              </div>
            </div>
            
            {/* Checkbox "J'ai avancé l'argent" */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-300 shadow-sm">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasAdvanced}
                  onChange={(e) => setHasAdvanced(e.target.checked)}
                  className="mt-1 w-5 h-5 text-amber-600 border-amber-400 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="font-bold text-amber-900 text-base flex items-center gap-2">
                    💳 J'ai avancé l'argent pour ce cadeau
                  </div>
                  <div className="text-sm text-amber-800 mt-1.5 font-medium">
                    Les autres participants devront vous rembourser leur part
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* CAS 2: Première contribution - Choix entre FULL et PARTIAL */}
        {isFirstContribution && (
          <div className="space-y-4">
            {/* Choix du type */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                Comment souhaitez-vous contribuer ?
              </label>

              {/* Option 1: Je prends en entier */}
              <button
                type="button"
                onClick={() => setContributionType("FULL")}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  contributionType === "FULL"
                    ? "border-noel-green bg-noel-green/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      contributionType === "FULL"
                        ? "border-noel-green bg-noel-green"
                        : "border-gray-300"
                    }`}
                  >
                    {contributionType === "FULL" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">
                      🎁 Je prends en entier
                    </div>
                    <div className="text-sm text-gray-600">
                      J'offre ce cadeau seul(e)
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2: Je lance un partage */}
              <button
                type="button"
                onClick={() => setContributionType("PARTIAL")}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  contributionType === "PARTIAL"
                    ? "border-noel-green bg-noel-green/5 shadow-md"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      contributionType === "PARTIAL"
                        ? "border-noel-green bg-noel-green"
                        : "border-gray-300"
                    }`}
                  >
                    {contributionType === "PARTIAL" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">
                      🤝 Je lance un partage
                    </div>
                    <div className="text-sm text-gray-600">
                      Je participe et d'autres peuvent rejoindre
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Champs selon le type choisi */}
            {contributionType === "FULL" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix total du cadeau (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                  placeholder="Ex: 49.99"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix total à partager (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                    placeholder="Ex: 49.99"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre participation (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                    placeholder="Ex: 20.00"
                    required
                  />
                </div>
                
                {/* Checkbox "J'ai avancé l'argent" */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-300 shadow-sm">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasAdvanced}
                      onChange={(e) => setHasAdvanced(e.target.checked)}
                      className="mt-1 w-5 h-5 text-amber-600 border-amber-400 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-amber-900 text-base flex items-center gap-2">
                        💳 J'ai avancé l'argent pour ce cadeau
                      </div>
                      <div className="text-sm text-amber-800 mt-1.5 font-medium">
                        Les autres participants devront vous rembourser leur part
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Note uniquement pour lancer un partage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Un petit mot ? (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                    placeholder="Ex: On partage ce cadeau !"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* CAS 3: Modification d'une contribution existante */}
        {existingContribution && (
          <div className="space-y-4">
            {existingContribution.totalPrice && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Prix total:</span> {existingContribution.totalPrice}€
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {contributionType === "FULL" ? "Prix total (€) *" : "Votre participation (€) *"}
              </label>
              <input
                type="number"
                step="0.01"
                value={contributionType === "FULL" ? totalPrice : amount}
                onChange={(e) => {
                  if (contributionType === "FULL") {
                    setTotalPrice(e.target.value);
                  } else {
                    setAmount(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-noel-green focus:border-transparent"
                placeholder={contributionType === "FULL" ? "Ex: 49.99" : "Ex: 20.00"}
                required
              />
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-noel-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg shadow-noel-green/20"
          >
            {isSubmitting ? "Traitement..." : "Valider"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

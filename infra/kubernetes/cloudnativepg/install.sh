#!/usr/bin/env bash
set -euo pipefail

# ─── CloudNativePG auf RKE2 installieren ───────────────────────────────────

CNPG_VERSION="1.23.1"

echo "1. CloudNativePG Operator installieren..."
kubectl apply --server-side -f \
  "https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-${CNPG_VERSION}/releases/cnpg-${CNPG_VERSION}.yaml"

echo "Warte bis Operator bereit ist..."
kubectl rollout status deployment/cnpg-controller-manager \
  -n cnpg-system --timeout=120s

echo ""
echo "2. Namespace erstellen..."
kubectl apply -f namespace.yaml

echo ""
echo "3. Secrets anlegen..."
echo "ACHTUNG: Passe zuerst die Passwörter in secret.yaml an!"
read -p "Passwörter angepasst? (j/n): " confirm
if [[ "$confirm" != "j" ]]; then
  echo "Bitte secret.yaml anpassen und danach erneut ausführen."
  exit 1
fi
kubectl apply -f secret.yaml

echo ""
echo "4. PostgreSQL Cluster starten..."
kubectl apply -f cluster.yaml

echo ""
echo "Warte bis DB-Cluster bereit ist (kann 1-2 Minuten dauern)..."
kubectl wait cluster/coalita-db \
  -n coalita \
  --for=condition=Ready \
  --timeout=180s

echo ""
echo "✓ PostgreSQL Cluster ist bereit!"
echo ""
echo "Verbindungsdetails (intern im Cluster):"
echo "  Host:     coalita-db-rw.coalita.svc.cluster.local"
echo "  Port:     5432"
echo "  Database: coalita"
echo "  User:     coalita"
echo ""
echo "Nächster Schritt: Schema einrichten"
echo "  kubectl exec -it -n coalita \$(kubectl get pod -n coalita -l cnpg.io/cluster=coalita-db,role=primary -o name) -- psql -U coalita -d coalita -f /dev/stdin < ../../packages/db/schema.sql"

# PostgreSQL auf RKE2 mit CloudNativePG

## Voraussetzungen
- `kubectl` konfiguriert und mit dem RKE2-Cluster verbunden
- `local-path` StorageClass verfügbar (Standard bei RKE2)

## Installation

```bash
cd infra/kubernetes/cloudnativepg

# 1. Passwörter in secret.yaml setzen (NICHT committen!)
# Superuser (postgres): starkes Passwort
# App-User (coalita): starkes Passwort

# 2. Installationsscript ausführen
chmod +x install.sh
./install.sh
```

## Schema einrichten

Nach erfolgreicher Installation das DB-Schema als ConfigMap deployen und Job starten:

```bash
# Schema als ConfigMap erstellen
kubectl create configmap coalita-db-schema \
  -n coalita \
  --from-file=schema.sql=../../../packages/db/schema.sql

# Schema-Init-Job starten
kubectl apply -f schema-job.yaml

# Job-Logs verfolgen
kubectl logs -n coalita -l job-name=coalita-db-schema-init -f
```

## Verbindungsdetails (intern im Cluster)

| Parameter | Wert |
|---|---|
| Host (Read/Write) | `coalita-db-rw.coalita.svc.cluster.local` |
| Host (Read-Only)  | `coalita-db-ro.coalita.svc.cluster.local` |
| Port | `5432` |
| Datenbank | `coalita` |
| Benutzer | `coalita` |
| Passwort | aus Secret `coalita-db-app` |

## Nützliche Befehle

```bash
# Cluster-Status prüfen
kubectl get cluster -n coalita

# Direkt in die DB verbinden
kubectl exec -it -n coalita \
  $(kubectl get pod -n coalita -l cnpg.io/cluster=coalita-db,role=primary -o name) \
  -- psql -U coalita -d coalita

# Logs des Primary-Pods
kubectl logs -n coalita \
  $(kubectl get pod -n coalita -l cnpg.io/cluster=coalita-db,role=primary -o name)
```

## Für Produktion

- `instances: 1` → `instances: 3` in `cluster.yaml` für HA (Primary + 2 Replicas)
- StorageClass auf Longhorn umstellen für bessere HA-Unterstützung
- Backup-Konfiguration (MinIO/S3) ergänzen

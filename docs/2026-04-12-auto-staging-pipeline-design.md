# Auto-Staging Pipeline — Design

**Data:** 2026-04-12  
**Stato:** approvato

---

## Obiettivo

Eliminare il promote manuale come step obbligatorio nel flusso di deploy. Ogni merge su `main` deploya automaticamente su staging e lancia gli smoke test E2E. L'unica azione umana richiesta è il merge della chore PR (dopo aver visto il check verde) e l'approvazione del deploy production.

Il flusso rimane fedele al principio **build once, deploy many**: la stessa immagine Docker testata su staging va in production senza rebuild.

---

## Flusso completo

```
push su main
  → build-and-deploy-staging.yml
      [job: build]   → trigger CodeBuild → attende completamento → immagine sha-abc in ECR
      [job: deploy]  → ECS staging aggiornato → dispatch staging-deployed → e2e-playwright

  → e2e-staging.yml (repo e2e-playwright)
      → smoke @chromium su staging
      → [pass] scrive SSM token + posta check success su chore PR
      → [fail] posta check failure su chore PR (SSM non scritto)

chore PR (release-please)
  → team vede check E2E verde → mergia
  → release-please pubblica tag v1.x.x + GitHub Release

release: published
  → deploy-production.yml
      → attende approvazione GitHub Environment reviewer
      → legge SSM: token presente + immagine ECR esistente
      → re-tag immagine ECR (sha-abc → v1.x.x + latest)
      → registra nuova task definition ECS production
      → update-service + wait stability
      → aggiorna GitHub Environment production
```

### Escape hatch (recovery da smoke flaky)

Se gli smoke falliscono per motivi infrastrutturali dopo che la chore PR è già stata mergiata:

1. Triggera `promote.yml` manualmente → ri-deploya staging → ri-lancia smoke → SSM aggiornato
2. "Re-run failed jobs" su `deploy-production.yml` in GitHub Actions
3. Reviewer approva → production deploya

Tutto tracciabile in GitHub Actions, nessun intervento su AWS Console.

---

## Gate di approvazione

Due layer indipendenti e sovrapposti.

### Layer 1 — Automatico (SSM Parameter Store)

`e2e-staging.yml` scrive il token **solo se gli smoke passano**:

```json
{
  "sha": "a1b2c3d",
  "approved_at": "2026-04-12T15:30:00Z",
  "smoke_run_url": "https://github.com/mistre83/e2e-playwright/actions/runs/..."
}
```

`deploy-production.yml` valida due condizioni prima di procedere:

1. **Token presente** — il parametro SSM esiste e ha il campo `sha` valorizzato
2. **Immagine ECR esiste** — `sha-{sha}` è ancora presente in ECR

Nessun check temporale: un'approvazione è valida a prescindere da quando è stata scritta. Se il codice è stato testato e approvato, rimane approvato.

### Layer 2 — Umano (GitHub Environment)

GitHub Environment `production` configurato con required reviewer. Il job `deploy-production.yml` si mette in attesa prima di eseguire qualsiasi step. Il reviewer vede il check `E2E / Staging Smoke` sulla chore PR e approva consapevolmente.

---

## Mappa dei file

### Frontend repo (`mistre83/poc-playwright-fe`)

| File | Azione | Note |
|---|---|---|
| `.github/workflows/build.yml` | Sostituito | Rimpiazzato da `build-and-deploy-staging.yml` |
| `.github/workflows/build-and-deploy-staging.yml` | Nuovo | Due job: `build` (CodeBuild) + `deploy` (ECS staging + dispatch) |
| `.github/workflows/promote.yml` | Rimane | Escape hatch manuale per recovery |
| `.github/workflows/deploy-production.yml` | Modifica | Aggiunto trigger `workflow_dispatch` + rimosso check 7 giorni su SSM |

### E2E repo (`mistre83/e2e-playwright`)

Nessuna modifica. `e2e-staging.yml` è già corretto.

### Terraform

Nessuna modifica. IAM role e2e ha già `ssm:PutParameter`.

### GitHub (configurazione manuale)

GitHub Environment `production` → aggiungere required reviewer.

---

## Scalabilità multi-servizio

Il pattern è progettato per replicarsi su ogni microservizio:

- Ogni repo applicativo ha il proprio `build-and-deploy-staging.yml` che dispatcha `staging-deployed` all'E2E repo centralizzato
- Il repo E2E centralizzato gestisce tutti i test — un solo punto di manutenzione per il QA engineer
- Ogni servizio ha il proprio SSM parameter (`/poc-playwright/production/pending-approval`, `/service-b/production/pending-approval`, ...)
- Il GitHub Environment `production` con required reviewer si replica su ogni repo applicativo

---

## Cosa NON cambia

- ECS Fargate staging e production (Terraform invariato)
- ECR e naming convention immagini (`sha-{7char}`)
- release-please e chore PR flow
- `e2e-staging.yml` e logica di commit status
- `deploy-production.yml` core (re-tag ECR, ECS update, GitHub Environment)

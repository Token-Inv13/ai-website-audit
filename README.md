# AI Website Audit

MVP Next.js qui analyse un site web depuis son URL et génère un audit SEO, conversion et UX via l'API OpenAI.

Version commerciale MVP incluse : aperçu gratuit + déblocage du rapport complet via Stripe Checkout ($9).

Le stockage est persistant via Prisma + Supabase Postgres (plus de source de vérité en mémoire `Map`).

## Prérequis

- Node.js 20+
- npm
- Une clé OpenAI valide (uniquement si `MOCK_AI=false`)
- Un compte Stripe avec un `Price` configuré

## Installation et démarrage

1. Installer les dépendances :

```bash
npm install
```

2. Créer `.env.local` :

```bash
cp .env.local.example .env.local
```

3. Générer le client Prisma :

```bash
npx prisma generate
```

4. Synchroniser le schéma Prisma sur Postgres :

```bash
npx prisma db push
```

5. Lancer le projet :

```bash
npm run dev
```

Application disponible sur `http://localhost:3000` en local.

## Variables d'environnement

```env
DATABASE_URL="postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=public"
MOCK_AI=true
OPENAI_API_KEY=
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=https://ai-website-audit-beta.vercel.app
```

## Mode mock local (sans coût OpenAI)

- Activer `MOCK_AI=true` pour éviter tout appel réel à l'API OpenAI.
- En mode mock, l'audit retourne un rapport cohérent fixe (scores, problèmes, améliorations, quick wins, copy suggestions et recommandations détaillées).
- Ce mode permet de tester localement tout le flow produit sans clé OpenAI ni coût API.
- Pour repasser en mode réel, mettre `MOCK_AI=false` et renseigner `OPENAI_API_KEY`.

## Configuration Stripe

1. Créer un produit Stripe "Full Audit Report".
2. Créer un prix one-time à `$9`.
3. Copier l'identifiant du prix (`price_xxx`) dans `STRIPE_PRICE_ID`.
4. Renseigner votre clé secrète Stripe dans `STRIPE_SECRET_KEY`.

## Flux produit

1. L'utilisateur lance un audit gratuit.
2. Le résultat est enregistré en base Postgres avec un ID unique (`unlocked=false`).
3. La page `/result/{id}` affiche les scores + quick wins + copy suggestions + un aperçu limité (2 problèmes, 2 améliorations).
4. L'utilisateur peut télécharger un PDF depuis `/api/report/{id}` (preview ou full selon `unlocked`).
5. L'utilisateur clique sur "Unlock Full Report — $9".
6. Stripe Checkout s'ouvre.
7. Après paiement, retour sur `/result/{id}?unlocked=1`.
8. L'audit est marqué `unlocked=true` en base et reste persistant après redémarrage serveur (les recommandations détaillées deviennent visibles).

## Structure

- `prisma/schema.prisma` : schéma Prisma (model `Audit`)
- `lib/prisma.ts` : singleton Prisma Client
- `lib/auditStore.ts` : wrapper d'accès DB pour les audits (Prisma)
- `app/api/audit/route.ts` : génération audit + persistance
- `app/api/audit/[id]/route.ts` : lecture audit (preview/full)
- `app/api/audits/route.ts` : liste des audits récents (dashboard)
- `app/api/report/[id]/route.ts` : export PDF du rapport (preview/full)
- `app/api/checkout/route.ts` : création session Stripe Checkout
- `app/api/checkout/success/route.ts` : callback succès + déverrouillage persistant
- `app/result/[id]/page.tsx` : rapport (preview + unlock)

## Dashboard interne

- Le dashboard (`/dashboard` et `/api/audits`) existe pour usage interne et n'est pas exposé dans la navigation publique.

## Notes MVP

- Supabase Postgres est requis pour la persistance en production (Vercel).
- Vérifier que `DATABASE_URL` côté Vercel pointe bien sur le pooler Supabase (recommandé pour serverless), par exemple :
  - `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public`
- Optionnel mais recommandé : conserver `DIRECT_URL` vers la connexion directe Supabase (`db.<project-ref>.supabase.co:5432`) pour les opérations Prisma hors runtime serverless.
- `MOCK_AI=true` reste compatible pour tester le flow complet sans coût OpenAI.
- L'export PDF utilise `@react-pdf/renderer`.

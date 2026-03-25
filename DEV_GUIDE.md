# SEOAuditAI - Developer Guide

Cette fiche sert de repere rapide pour comprendre le projet, retrouver les fichiers utiles, et intervenir sans perdre de temps.

## 1. Stack

- Framework: Next.js App Router
- Langage: TypeScript
- DB: Prisma + Supabase Postgres
- AI: OpenAI API
- Paiement: Stripe Checkout + webhook Stripe
- Hosting: Vercel

## 2. Objectif produit

Le produit analyse un site web a partir d'une URL et genere un rapport SEO, UX et conversion.

Le flow business principal est:

1. un utilisateur lance un audit gratuit
2. le rapport est enregistre en base avec `unlocked=false`
3. la page resultat affiche un apercu
4. l'utilisateur renseigne son email
5. l'utilisateur paie via Stripe Checkout
6. Stripe envoie `checkout.session.completed` au webhook
7. le webhook debloque le rapport en base
8. la page resultat recharge l'etat jusqu'a affichage du rapport complet

## 3. Variables d'environnement importantes

Variables serveur / prod:

- `DATABASE_URL`
- `DIRECT_URL`
- `OPENAI_API_KEY`
- `MOCK_AI`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Variable publique:

- `NEXT_PUBLIC_APP_URL`

Notes:

- `MOCK_AI=true` court-circuite OpenAI et renvoie un audit fixe.
- En production, `MOCK_AI` doit etre `false`.
- `NEXT_PUBLIC_APP_URL` est la source principale pour construire les URLs publiques.
- Si `NEXT_PUBLIC_APP_URL` manque, le helper `lib/publicAppUrl.ts` essaie `VERCEL_PROJECT_PRODUCTION_URL`, puis `VERCEL_URL`, puis retombe sur `http://localhost:3000`.

## 4. Fichiers a connaitre en premier

### Coeur metier

- `app/api/audit/route.ts`
  Cree un audit, scrape le site, appelle l'analyse AI, puis persiste en base.

- `lib/analyze.ts`
  Contient la logique OpenAI et le mode mock.

- `lib/scrape.ts`
  Scraping du site distant.

- `lib/auditStore.ts`
  Couche d'acces Prisma pour les audits. C'est ici qu'on retrouve `createAudit`, `getAudit`, `saveAuditEmail`, `unlockAudit`, `updateAuditVisibility`.

- `prisma/schema.prisma`
  Schema de la table `Audit`.

### Flow resultat / unlock

- `app/result/[id]/page.tsx`
  Page client principale du rapport. Gere:
  - chargement du rapport
  - capture email
  - ouverture du checkout
  - partage
  - polling leger apres retour de paiement

- `components/AuditReport.tsx`
  Affichage du rapport preview/full.

- `lib/auditVisibility.ts`
  Filtre ce qui est visible quand `unlocked=false`.

### Stripe

- `app/api/checkout/route.ts`
  Cree la session Stripe Checkout.

- `app/api/checkout/success/route.ts`
  Route de retour UX apres paiement. Ne sert plus de source principale de verite pour le paiement.

- `app/api/stripe/webhook/route.ts`
  Webhook Stripe serveur. C'est la source de verite pour debloquer le rapport.

- `lib/stripe.ts`
  Helper Stripe partage:
  - client Stripe
  - lecture du secret webhook
  - extraction de `metadata.auditId`
  - debloquage depuis une session Checkout

### URLs publiques / SEO

- `lib/publicAppUrl.ts`
  Centralise la base URL publique.

- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `components/ProgrammaticLandingPage.tsx`
- `app/report/[domain]/page.tsx`

Ces fichiers utilisent la base URL publique pour metadata, canonical, sitemap et structured data.

## 5. Source de verite paiement

Important: le projet ne doit pas faire confiance a la redirection client comme source de verite paiement.

La source de verite actuelle est:

- webhook Stripe `POST /api/stripe/webhook`
- evenement traite: `checkout.session.completed`
- verification de signature avec `STRIPE_WEBHOOK_SECRET`

La success page:

- sert a l'UX
- recupere la session Stripe pour retrouver `auditId`
- redirige vers `/result/[id]?payment=success`
- n'est plus responsable du debloquage principal

## 6. Idempotence

Le debloquage passe par `unlockAudit()` dans `lib/auditStore.ts`.

Comportement actuel:

- si l'audit n'existe pas: retour `false`
- si l'audit est deja debloque: retour `true`
- si `stripeSessionId` manque encore, il peut etre renseigne lors d'un retry
- si Stripe rejoue le meme evenement, on ne casse pas le state

## 7. Schema de donnees utile

Model principal: `Audit`

Champs a connaitre:

- `id`
- `url`
- `domainNormalized`
- `email`
- `emailCapturedAt`
- `unlocked`
- `stripeSessionId`
- `isPublic`
- `publicSlug`
- `result` via les champs de score + JSON

## 8. Routes API importantes

- `POST /api/audit`
- `GET /api/audit/[id]`
- `PATCH /api/audit/[id]/email`
- `PATCH /api/audit/[id]/visibility`
- `POST /api/checkout`
- `GET /api/checkout/success`
- `POST /api/stripe/webhook`
- `GET /api/report/[id]`
- `GET /api/audits`
- `POST /api/quick-scan`

## 9. Flow Stripe detaille

### Creation Checkout

Dans `app/api/checkout/route.ts`:

- verification de l'existence de l'audit
- verification qu'un email a ete capture
- creation d'une session Stripe avec:
  - `price`
  - `success_url`
  - `cancel_url`
  - `customer_email`
  - `metadata.auditId`

### Webhook

Dans `app/api/stripe/webhook/route.ts`:

- lecture du body brut
- lecture du header `stripe-signature`
- `stripe.webhooks.constructEvent(...)`
- traitement de `checkout.session.completed`
- appel de `unlockAuditFromCheckoutSession(...)`

### Retour utilisateur

Dans `app/api/checkout/success/route.ts`:

- recupere `session_id`
- relit la session Stripe
- retrouve `auditId`
- redirige vers la page resultat avec `payment=success`

Dans `app/result/[id]/page.tsx`:

- si `payment=success` et `unlocked=false`, la page relance un fetch jusqu'a ce que l'audit soit debloque

## 10. OpenAI

Dans `lib/analyze.ts`:

- si `MOCK_AI=true`, retour d'un audit fixe
- sinon usage de `OPENAI_API_KEY`
- modele actuel: `gpt-4.1-mini`

Important:

- aucune cle OpenAI ne doit etre hardcodee dans le repo
- les appels OpenAI restent cote serveur

## 11. Public reports / SEO

Le projet expose aussi des rapports publics et des pages SEO.

Fichiers a connaitre:

- `app/report/[domain]/page.tsx`
- `lib/programmaticSeo.ts`
- `components/ProgrammaticLandingPage.tsx`
- `app/audit/[type]/page.tsx`
- `app/tools/[slug]/page.tsx`
- `app/solutions/[slug]/page.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

Le dashboard interne existe aussi:

- `app/dashboard/page.tsx`
- `app/api/audits/route.ts`

## 12. Commandes utiles

Setup local:

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Verification:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Notes:

- dans cet environnement sandbox, `npm run build` a deja echoue sur un probleme Turbopack lie a la creation de process/port, pas sur une erreur metier du projet
- a confirmer dans Vercel ou sur une machine locale normale si besoin

## 13. Points d'attention prod

- Le webhook Stripe doit pointer exactement vers:
  - `/api/stripe/webhook`
- `STRIPE_WEBHOOK_SECRET` doit correspondre a l'endpoint configure dans Stripe
- `NEXT_PUBLIC_APP_URL` doit correspondre au vrai domaine public
- le projet ne doit pas conserver d'ancienne URL beta hardcodee
- `MOCK_AI` doit etre `false` pour les vrais tests prod
- les fichiers `.env*` sont ignores par Git, donc les secrets doivent vivre dans Vercel ou en local uniquement

## 14. Quand on debug un probleme

Si un paiement ne debloque pas le rapport:

1. verifier Stripe Events
2. verifier la reponse du webhook
3. verifier les logs Vercel sur `/api/stripe/webhook`
4. verifier que `metadata.auditId` est present dans la session
5. verifier en base que `unlocked` passe a `true`
6. verifier ensuite la page resultat et son polling post-paiement

Si la page revient payee mais reste floutee:

- verifier que le webhook a bien ecrit en base
- verifier que la page est revenue avec `?payment=success`
- verifier le refetch de `GET /api/audit/[id]`

Si OpenAI ne repond pas:

1. verifier `MOCK_AI`
2. verifier `OPENAI_API_KEY`
3. verifier les logs `POST /api/audit`

## 15. Resume ultra court

Si tu dois reprendre le projet vite:

- entree principale produit: `app/page.tsx`
- creation audit: `app/api/audit/route.ts`
- stockage: `lib/auditStore.ts`
- AI: `lib/analyze.ts`
- checkout: `app/api/checkout/route.ts`
- webhook source de verite: `app/api/stripe/webhook/route.ts`
- page resultat: `app/result/[id]/page.tsx`
- URL publique: `lib/publicAppUrl.ts`
- schema DB: `prisma/schema.prisma`

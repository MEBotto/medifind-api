# MediFind RBAC and audit rollout (draft)

## Roles
- `ADMIN`: platform administrator; created initially via `bootstrap:admin`.
- `PHARMACIST`: assigned to one pharmacy via `users.idPharmacy`.
- `CUSTOMER`: public registration only.

Roles and permissions use stable uppercase `code` values; `name` is display text in Spanish. The server now reads the current user/role from the database on each authenticated request; it does not trust a role claim in the JWT.

## Before deploying to an existing database
1. **Back up PostgreSQL and test a restore.**
2. Review all existing `roles.name` values. The migration recognizes Admin/Administrador, Pharmacist/Farmacéutico/Farmaceutico, Customer/Cliente. Unknown and duplicate roles require manual reconciliation; migration intentionally fails rather than guessing.
3. Review duplicate `permissions.code` values; they block the new unique index.
4. The current application historically used TypeORM `synchronize: true`. This branch disables automatic synchronization outside isolated `NODE_ENV=test` databases. The repository still needs a complete baseline migration for fresh non-test deployments.
5. Apply the migration against a **copy** of the existing schema first: `npm run migration:run`. Check the result and confirm the audit table and role codes.
6. Run `npm run seed:roles`. The seed is idempotent and does not generate administrator credentials.
7. To create the **first** administrator only, set `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_USERNAME`, and `BOOTSTRAP_ADMIN_PASSWORD` (at least 12 characters) in a secure environment and run `npm run bootstrap:admin`. Do not commit credentials. The command refuses to run if any administrator exists.
8. Start the API. Never run a production DB with `NODE_ENV=test`.

## Security limitations requiring follow-up before merge
- Pharmacy and product mutations are currently **ADMIN-only** until complete pharmacist ownership checks are implemented. This intentionally avoids cross-pharmacy access.
- The HTTP mutation audit records outcomes asynchronously and may fail independently of the operation; critical mutations need same-transaction audit records.
- Existing CRUD endpoints outside users/roles/pharmacies/products still need permission review.
- Admin-only user update/delete need transactional audit and a policy for changing role/pharmacy.
- Existing database compatibility, CI build, Newman and integration tests must pass before merge.

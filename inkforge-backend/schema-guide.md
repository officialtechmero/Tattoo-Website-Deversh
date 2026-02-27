# InkForge Frontend -> Backend Data Schema (DATA-README)

This file maps the current frontend UI to backend tables you should create.
It is based on all screens in `src/views` and shared components.

## 1) Core tables (create these first)

### `users`
Source screens: Login, Signup, Settings (Account), Dashboard.

- `id` UUID PK
- `email` VARCHAR(320) UNIQUE NOT NULL
- `password_hash` TEXT NULL (NULL if social auth only)
- `status` ENUM(`active`,`suspended`,`deleted`) DEFAULT `active`
- `email_verified_at` TIMESTAMP NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

Indexes:
- unique index on `email`

### `user_profiles`
Source screens: Settings (name, country, city, best describes, experience).

- `user_id` UUID PK FK -> `users.id`
- `full_name` VARCHAR(120) NULL
- `country` VARCHAR(100) NULL
- `city` VARCHAR(100) NULL
- `persona` ENUM(`tattoo_enthusiast`,`tattoo_artist`,`collector`,`exploring`) NULL
- `experience_level` ENUM(`beginner`,`intermediate`,`experienced`,`professional_artist`) NULL
- `avatar_url` TEXT NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

### `plans`
Source screens: Pricing, Dashboard pricing/billing cards.

- `id` UUID PK
- `code` VARCHAR(40) UNIQUE NOT NULL (`free`,`pro`,`artist`)
- `name` VARCHAR(60) NOT NULL
- `monthly_price_cents` INT NOT NULL
- `yearly_price_cents` INT NULL
- `currency` CHAR(3) NOT NULL DEFAULT `USD`
- `monthly_credits` INT NOT NULL
- `is_highlighted` BOOLEAN DEFAULT FALSE
- `is_active` BOOLEAN DEFAULT TRUE
- `features_json` JSONB NOT NULL
- `unavailable_json` JSONB NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

### `subscriptions`
Source screens: Billing tab (current plan, renewal date, cancel plan).

- `id` UUID PK
- `user_id` UUID NOT NULL FK -> `users.id`
- `plan_id` UUID NOT NULL FK -> `plans.id`
- `status` ENUM(`trialing`,`active`,`past_due`,`canceled`,`expired`) NOT NULL
- `billing_interval` ENUM(`monthly`,`yearly`) NOT NULL
- `current_period_start` TIMESTAMP NOT NULL
- `current_period_end` TIMESTAMP NOT NULL
- `cancel_at_period_end` BOOLEAN DEFAULT FALSE
- `canceled_at` TIMESTAMP NULL
- `provider` ENUM(`stripe`,`razorpay`,`manual`) NULL
- `provider_subscription_id` VARCHAR(120) NULL
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

Indexes:
- index on (`user_id`,`status`)

### `credit_wallets`
Source screens: Generate + Dashboard credit meters.

- `id` UUID PK
- `user_id` UUID UNIQUE NOT NULL FK -> `users.id`
- `balance` INT NOT NULL DEFAULT 0
- `cycle_total` INT NOT NULL DEFAULT 0
- `cycle_used` INT NOT NULL DEFAULT 0
- `cycle_resets_at` TIMESTAMP NULL
- `updated_at` TIMESTAMP NOT NULL

### `credit_ledger`
Needed for audit + billing-safe credit accounting.

- `id` UUID PK
- `user_id` UUID NOT NULL FK -> `users.id`
- `source_type` ENUM(`generation`,`subscription_reset`,`purchase`,`refund`,`admin_adjustment`,`variation`) NOT NULL
- `source_id` UUID NULL
- `delta` INT NOT NULL (negative for usage)
- `balance_after` INT NOT NULL
- `note` TEXT NULL
- `created_at` TIMESTAMP NOT NULL

Indexes:
- index on (`user_id`,`created_at`)

### `designs`
Source screens: Explore, Design details, My Designs, Favorites.

- `id` UUID PK
- `owner_user_id` UUID NULL FK -> `users.id` (NULL for public seed/gallery items)
- `image_url` TEXT NOT NULL
- `thumb_url` TEXT NULL
- `style` VARCHAR(60) NOT NULL
- `placement` VARCHAR(60) NULL
- `category` VARCHAR(60) NULL
- `design_type` VARCHAR(60) NULL
- `city` VARCHAR(100) NULL
- `artist_name` VARCHAR(120) NULL
- `display_name` VARCHAR(160) NULL
- `gender_tag` VARCHAR(30) NULL
- `body_part_tag` VARCHAR(50) NULL
- `theme_tag` VARCHAR(50) NULL
- `symbol_tag` VARCHAR(50) NULL
- `floral_tag` VARCHAR(50) NULL
- `animal_tag` VARCHAR(50) NULL
- `celestial_tag` VARCHAR(50) NULL
- `unique_tag` VARCHAR(50) NULL
- `session_cost_cents` INT NULL
- `sessions_estimate` INT NULL
- `tip_cents` INT NULL
- `visibility` ENUM(`public`,`private`,`unlisted`) DEFAULT `public`
- `like_count` INT NOT NULL DEFAULT 0
- `download_count` INT NOT NULL DEFAULT 0
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

Indexes:
- index on (`style`,`created_at`)
- index on `like_count`
- index on `created_at`
- index on filter tags: `body_part_tag`,`theme_tag`,`symbol_tag`,`floral_tag`,`animal_tag`,`celestial_tag`,`unique_tag`

### `design_favorites`
Source screens: Explore like button, Favorites tab, Design details favorite.

- `user_id` UUID NOT NULL FK -> `users.id`
- `design_id` UUID NOT NULL FK -> `designs.id`
- `created_at` TIMESTAMP NOT NULL
- PK (`user_id`,`design_id`)

### `generation_jobs`
Source screens: Generate page options + variation + recent generations.

- `id` UUID PK
- `user_id` UUID NOT NULL FK -> `users.id`
- `prompt` TEXT NOT NULL
- `style` VARCHAR(60) NOT NULL
- `placement` VARCHAR(60) NULL
- `complexity` SMALLINT NOT NULL CHECK (`complexity` BETWEEN 1 AND 5)
- `color_mode` ENUM(`bw`,`color`) NOT NULL
- `line_weight` ENUM(`Fine`,`Medium`,`Bold`) NOT NULL
- `status` ENUM(`queued`,`running`,`succeeded`,`failed`) NOT NULL
- `result_design_id` UUID NULL FK -> `designs.id`
- `error_message` TEXT NULL
- `credits_spent` INT NOT NULL DEFAULT 1
- `is_variation` BOOLEAN DEFAULT FALSE
- `parent_job_id` UUID NULL FK -> `generation_jobs.id`
- `created_at` TIMESTAMP NOT NULL
- `completed_at` TIMESTAMP NULL

Indexes:
- index on (`user_id`,`created_at` DESC)
- index on `status`

### `payment_orders`
Source screens: Billing purchase history.

- `id` UUID PK
- `user_id` UUID NOT NULL FK -> `users.id`
- `subscription_id` UUID NULL FK -> `subscriptions.id`
- `provider` ENUM(`stripe`,`razorpay`,`manual`) NOT NULL
- `provider_order_id` VARCHAR(120) NULL
- `provider_payment_id` VARCHAR(120) NULL
- `amount_cents` INT NOT NULL
- `currency` CHAR(3) NOT NULL DEFAULT `USD`
- `status` ENUM(`pending`,`paid`,`failed`,`refunded`) NOT NULL
- `description` VARCHAR(255) NULL
- `paid_at` TIMESTAMP NULL
- `created_at` TIMESTAMP NOT NULL

Indexes:
- index on (`user_id`,`created_at` DESC)

## 2) Optional but recommended tables

### `design_downloads`
For analytics/rate-limits/licensing.

- `id` UUID PK
- `user_id` UUID NOT NULL
- `design_id` UUID NOT NULL
- `quality` ENUM(`standard`,`hd`,`stencil`) NOT NULL
- `created_at` TIMESTAMP NOT NULL

### `stencil_jobs`
Source screen: Stencil page (upload -> processed output).

- `id` UUID PK
- `user_id` UUID NOT NULL
- `source_image_url` TEXT NOT NULL
- `result_image_url` TEXT NULL
- `status` ENUM(`queued`,`running`,`succeeded`,`failed`) NOT NULL
- `error_message` TEXT NULL
- `created_at` TIMESTAMP NOT NULL
- `completed_at` TIMESTAMP NULL

## 3) Storage buckets / file objects

Create object storage buckets (or S3 prefixes):
- `design-originals/`
- `design-thumbs/`
- `stencil-inputs/`
- `stencil-outputs/`
- `avatars/`

Store signed/private URLs for private assets; public URLs only for public gallery items.

## 4) Enum/value constraints from frontend

Styles currently used:
- `Traditional`, `Minimalist`, `Tribal`, `Geometric`, `Watercolor`, `Japanese`, `Neo-Traditional`, `Blackwork`

Generation controls:
- `complexity`: 1..5
- `color_mode`: `bw | color`
- `line_weight`: `Fine | Medium | Bold`

Filter groups used in Explore:
- Gender, Body Part, Themes, Symbol, Floral, Animals, Celestial, Unique

You can keep these as free text now, or normalize later via taxonomy tables.

## 5) API endpoints implied by frontend

- `POST /auth/signup`
- `POST /auth/login`
- `GET /me`
- `PATCH /me/profile`
- `PATCH /me/password`
- `GET /plans`
- `GET /billing/subscription`
- `GET /billing/orders`
- `POST /billing/checkout`
- `POST /billing/cancel`
- `GET /credits`
- `GET /designs` (search/filter/sort/pagination)
- `GET /designs/:id`
- `GET /designs/mine`
- `POST /designs/:id/favorite`
- `DELETE /designs/:id/favorite`
- `GET /designs/favorites`
- `POST /generate`
- `GET /generate/history`
- `POST /generate/:id/variation`
- `POST /stencil` (optional)

## 6) Implementation notes

- Use transactional credit deduction: create `generation_jobs` + `credit_ledger` row atomically.
- Maintain `designs.like_count` as denormalized counter from `design_favorites`.
- Keep plan/price source of truth in backend, not frontend constants.
- Soft-delete users with `status='deleted'` and hide private assets.

## 7) Minimum viable launch subset

If you want to ship fastest, start with:
- `users`, `user_profiles`
- `plans`, `subscriptions`
- `credit_wallets`, `credit_ledger`
- `designs`, `design_favorites`
- `generation_jobs`
- `payment_orders`

Then add `stencil_jobs` and `design_downloads` later.
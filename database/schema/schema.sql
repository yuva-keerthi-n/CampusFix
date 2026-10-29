-- CampusFix database schema (reference copy — Prisma migrations are the source of truth).
-- Run this manually only if you choose NOT to use `npx prisma migrate dev`.

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(10) NOT NULL CHECK (role IN ('student','staff','admin')),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE locations (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE complaints (
    id             SERIAL PRIMARY KEY,
    complaint_code VARCHAR(20) UNIQUE NOT NULL,
    title          VARCHAR(150) NOT NULL,
    description    TEXT NOT NULL,
    category_id    INT NOT NULL REFERENCES categories(id),
    location_id    INT NOT NULL REFERENCES locations(id),
    priority       VARCHAR(10) NOT NULL CHECK (priority IN ('Low','Medium','High','Critical')),
    status         VARCHAR(20) NOT NULL DEFAULT 'Reported'
                   CHECK (status IN ('Reported','Under Review','Assigned','In Progress','Resolved','Rejected')),
    reported_by    INT NOT NULL REFERENCES users(id),
    assigned_to    INT REFERENCES users(id),
    image_url      TEXT,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW(),
    resolved_at    TIMESTAMP
);

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_reported_by ON complaints(reported_by);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX idx_complaints_category ON complaints(category_id);
CREATE INDEX idx_complaints_location ON complaints(location_id);

CREATE TABLE complaint_history (
    id           SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status       VARCHAR(20) NOT NULL,
    changed_by   INT NOT NULL REFERENCES users(id),
    note         TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    message      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resolution (
    id           SERIAL PRIMARY KEY,
    complaint_id INT UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    resolved_by  INT NOT NULL REFERENCES users(id),
    notes        TEXT,
    image_url    TEXT,
    resolved_at  TIMESTAMP DEFAULT NOW()
);

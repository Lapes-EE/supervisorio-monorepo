-- Custom SQL migration file, put your code below! --
INSERT INTO "user" (username, password)
SELECT 'lapes', '$argon2id$v=19$m=65536,t=3,p=4$z8unb+xYW3K2ZVN2/s2BXA$lAgU3h0OcLkbGRuMgeSPi5wWE2WnDznF3GmH2oegBMA'
WHERE NOT EXISTS (SELECT 1 FROM "user");

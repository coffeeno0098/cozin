import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const username = process.argv[2]?.trim().toLowerCase();

if (!username) {
  console.error("Usage: npm run admin:promote -- <username>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
});

try {
  const [user] = await sql`
    update users
    set role = 'admin',
        updated_at = now()
    where username = ${username}
    returning username, role
  `;

  if (!user) {
    console.error(`User not found: ${username}`);
    process.exit(1);
  }

  console.log(`Promoted ${user.username} to ${user.role}.`);
} finally {
  await sql.end({ timeout: 5 });
}

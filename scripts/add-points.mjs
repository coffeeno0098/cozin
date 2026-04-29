import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const username = process.argv[2]?.trim().toLowerCase();
const points = Number.parseInt(process.argv[3] ?? "", 10);

if (!username || !Number.isInteger(points) || points <= 0) {
  console.error("Usage: npm run user:add-points -- <username> <points>");
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
  const result = await sql.begin(async (tx) => {
    const [user] = await tx`
      update users
      set points = points + ${points},
          updated_at = now()
      where username = ${username}
      returning id, username, points
    `;

    if (!user) {
      return null;
    }

    await tx`
      insert into point_transactions (user_id, type, points, balance_after, note)
      values (${user.id}, 'adjustment', ${points}, ${user.points}, 'Manual test point adjustment')
    `;

    return user;
  });

  if (!result) {
    console.error(`User not found: ${username}`);
    process.exit(1);
  }

  console.log(`Added ${points} Point to ${result.username}. New balance: ${result.points}.`);
} finally {
  await sql.end({ timeout: 5 });
}

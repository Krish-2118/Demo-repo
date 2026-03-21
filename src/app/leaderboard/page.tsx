import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export const revalidate = 0; // Don't cache this page

export default function LeaderboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl py-2 sm:py-4 stagger-in">
      <LeaderboardTable />
    </div>
  );
}

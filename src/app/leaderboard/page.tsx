import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export const revalidate = 0; // Don't cache this page

export default function LeaderboardPage() {
    return (
        <div className="container mx-auto py-4">
            <LeaderboardTable />
        </div>
    );
}

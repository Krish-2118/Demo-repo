import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export default function LeaderboardPage() {
    return (
        <div className="container mx-auto py-4">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Performance Leaderboard</h1>
            <LeaderboardTable />
        </div>
    );
}

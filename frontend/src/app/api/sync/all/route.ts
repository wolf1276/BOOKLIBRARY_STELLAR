// frontend/src/app/api/sync/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBookCount, getBook } from "@/lib/stellar";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.log("[Sync] Starting deep sync with Stellar testnet...");
    
    // 1. Get total count from contract
    const count = await getBookCount();

    // 2. Fetch all books from database
    const dbBooks = await prisma.book.findMany();

    // 3. Process books in parallel to save time and avoid timeouts
    const onChainIds = Array.from({ length: count }, (_, i) => i + 1);
    
    const results = await Promise.all(onChainIds.map(async (i) => {
        try {
            const onChainBook = await getBook(i);
            if (!onChainBook) return null;

            const { title, author } = onChainBook;
            
            // 4. Find matching book in DB (normalized)
            const match = dbBooks.find(dbb => 
                dbb.title.toLowerCase().trim() === title.toLowerCase().trim() &&
                dbb.author.toLowerCase().trim() === author.toLowerCase().trim()
            );

            if (match) {
                // Update match if not verified or missing ID
                if (!match.verified || match.contract_book_id !== i) {
                    await prisma.book.update({
                        where: { id: match.id },
                        data: {
                            verified: true,
                            contract_book_id: i
                        }
                    });
                    return { type: "new_match" };
                }
                return { type: "synced" };
            }
            return null;
        } catch (e) {
            console.error(`[Sync] Failed to fetch on-chain book #${i}:`, e);
            return null;
        }
    }));

    const syncedCount = results.filter(r => r !== null).length;
    const newMatches = results.filter(r => r?.type === "new_match").length;

    return NextResponse.json({
        success: true,
        message: `Sync complete. Processed ${count} on-chain records.`,
        details: {
            total_on_chain: count,
            matches_found: syncedCount,
            newly_verified: newMatches
        }
    });

  } catch (err: any) {
    console.error("[Sync] Critical error:", err);
    return NextResponse.json({ error: "Sync failed", details: err.message }, { status: 500 });
  }
}

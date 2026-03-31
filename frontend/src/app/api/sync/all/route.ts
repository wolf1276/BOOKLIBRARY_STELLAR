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
    console.log(`[Sync] Found ${count} books on-chain.`);

    let syncedCount = 0;
    let newMatches = 0;

    // 2. Fetch all books from database
    const dbBooks = await prisma.book.findMany();

    // 3. Loop through on-chain books (IDs are 1-based)
    for (let i = 1; i <= count; i++) {
        try {
            const onChainBook = await getBook(i);
            if (!onChainBook) continue;

            const { title, author } = onChainBook;
            
            // 4. Find matching book in DB
            // We match by Title (normalized) or Author
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
                    newMatches++;
                }
                syncedCount++;
            }
        } catch (e) {
            console.error(`[Sync] Failed to fetch on-chain book #${i}:`, e);
        }
    }

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

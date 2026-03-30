import { rpc } from '@stellar/stellar-sdk';

/**
 * Advanced Event Streaming for BookLibrary
 * This uses the Soroban RPC getEvents method to pull events in real-time.
 */
async function streamEvents() {
    const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');
    const contractId = process.env.CONTRACT_ID || '';

    if (!contractId) {
        console.error('CONTRACT_ID not set!');
        process.exit(1);
    }

    console.log(`📡 Listening for events on contract: ${contractId}...`);

    let startLedger = await rpcServer.getLatestLedger().then((l: { sequence: number }) => l.sequence);

    while (true) {
        try {
            const events = await rpcServer.getEvents({
                startLedger,
                filters: [
                    {
                        type: 'contract',
                        contractIds: [contractId],
                    },
                ],
            });

            for (const event of events.events) {
                const topic = event.topic[0];
                const data = event.value;

                console.log(`✨ New Event detected! Topic: ${topic}`);
                console.dir(data, { depth: null });

                // Logic for real-time UI notifications or database sync
                // if (topic === 'book_brw') { ... }
            }

            if (events.events.length > 0) {
                // Update marker to newest event
                startLedger = Math.max(...events.events.map((e: { ledger: number }) => e.ledger)) + 1;
            }

            // Polling interval
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('❌ Error streaming events:', error);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

// Execute
streamEvents().catch(console.error);

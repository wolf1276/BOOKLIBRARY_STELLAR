# 📚 BookLibrary Smart Contract

Soroban smart contract for the BookLibrary Stellar dApp. Manages on-chain book registration, borrowing mechanics, and deposit system.

## ✨ Features

- **📖 Book Management** — Register, store, and query books on blockchain
- **🔄 Borrowing System** — Borrow and return books with deposit requirements
- **💰 Deposit Handling** — Collateral system to ensure book returns
- **🔐 Access Control** — Admin-based authorization for sensitive operations
- **📝 Event Logging** — Emit events for all state changes
- **🧪 Comprehensive Tests** — Full unit test coverage

## 🛠️ Tech Stack

- **Language:** Rust
- **Framework:** Soroban SDK 25
- **Network:** Stellar Testnet
- **Build Target:** WASM

## 📁 Project Structure

```
contracts/book-library/
├── src/
│   ├── lib.rs         # Main contract logic
│   └── test.rs        # Unit tests
├── Cargo.toml         # Dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Rust 1.70+
- Soroban CLI
- Stellar account (funded testnet account)

### Installation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Soroban CLI
cargo install --locked soroban-cli

# Install WASM target
rustup target add wasm32-unknown-unknown
```

### Build

```bash
cd contracts/book-library

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Output: target/wasm32-unknown-unknown/release/book_library.wasm
```

### Testing

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_book_flow

# Run with output
cargo test -- --nocapture
```

## 📋 Data Structures

### Book Struct

```rust
pub struct Book {
    pub id: u32,
    pub title: String,
    pub author: String,
    pub owner: Address,        // Book owner (Stellar address)
    pub borrower: Option<Address>,  // Currently borrowing user
    pub borrowed_at: Option<u64>,   // Timestamp of borrow
}
```

## 🔗 Contract Functions

### Admin Functions

#### `initialize(admin: Address, token_id: String, deposit_amount: u128)`

Initialize contract with admin, token, and deposit requirements.

```rust
// Called once at deployment
initialize(admin, "GBUQWP3BOUZX34AUC6JSX2Q7CJF...CDH5WSTJNGHZTXYY7UJYZ", 1000000);
```

### Core Functions

#### `add_book(title: String, author: String) -> u32`

Register a new book on-chain. Returns the book ID.

**Parameters:**
- `title` — Book title (max 255 chars)
- `author` — Author name (max 255 chars)

**Returns:** Book ID (u32)

**Events:** `book_add` emitted

```rust
let book_id = contract.add_book("The Great Gatsby", "F. Scott Fitzgerald");
```

#### `get_books() -> Vec<Book>`

Retrieve all registered books.

**Returns:** Vector of Book structs

```rust
let books = contract.get_books();
for book in books {
    println!("{}: {} by {}", book.id, book.title, book.author);
}
```

#### `get_book(id: u32) -> Book`

Get a specific book by ID.

**Parameters:**
- `id` — Book ID

**Returns:** Book struct

**Errors:** `BookNotFound`

```rust
let book = contract.get_book(1);
```

#### `borrow_book(book_id: u32) -> bool`

Borrow a book. Caller is charged deposit amount. Book becomes unavailable for others.

**Parameters:**
- `book_id` — Book ID to borrow

**Returns:** true if successful

**Errors:**
- `BookNotFound` — Book doesn't exist
- `AlreadyBorrowed` — Someone else already borrowed it
- `InsufficientBalance` — Caller lacks deposit funds

**Events:** `book_brw` emitted

```rust
let success = contract.borrow_book(1);
```

#### `return_book(book_id: u32) -> bool`

Return a borrowed book. Deposit is refunded.

**Parameters:**
- `book_id` — Book ID to return

**Returns:** true if successful

**Errors:**
- `BookNotFound` — Book doesn't exist
- `NotBorrowed` — Book isn't currently borrowed
- `NotBorrower` — Caller isn't the borrower

**Events:** `book_ret` emitted

```rust
let success = contract.return_book(1);
```

#### `get_book_status(id: u32) -> (Address, Option<Address>, Option<u64>)`

Get current ownership/borrowing status of a book.

**Parameters:**
- `id` — Book ID

**Returns:** Tuple of (owner, borrower, borrowed_at_timestamp)

```rust
let (owner, borrower, borrowed_timestamp) = contract.get_book_status(1);
```

## 📊 Storage

Books are stored on-chain using Stellar's instance storage:

- **BOOK_COUNT** — Total number of books registered
- **BOOKS** — Map of book IDs to Book objects
- **ADMIN** — Admin address (for authorization)
- **TOKEN** — Token address for deposits
- **DEPOSIT** — Deposit amount required per borrow

## 🎯 Events

Contract emits the following events:

| Event | Data | When |
|-------|------|------|
| `init` | admin, token_id, deposit | Contract initialized |
| `book_add` | book_id, title, author | New book registered |
| `book_brw` | book_id, borrower | Book borrowed |
| `book_ret` | book_id, borrower | Book returned |

## 📝 Error Codes

```rust
pub enum Error {
    AlreadyInitialized = 1,  // Contract already initialized
    NotInitialized = 2,       // Contract not initialized yet
    Unauthorized = 3,         // Only admin can call
    BookNotFound = 4,         // Book ID doesn't exist
    AlreadyBorrowed = 5,      // Book already borrowed
    NotBorrowed = 6,          // Book isn't borrowed
    NotBorrower = 7,          // Caller isn't borrower
    InsufficientBalance = 8,  // Insufficient funds for deposit
}
```

## 🚀 Deployment

### Build Release WASM

```bash
cargo build --target wasm32-unknown-unknown --release --package book-library
```

### Deploy to Testnet

```bash
# Set Stellar credentials
export SOROBAN_ACCOUNT="your-account-address"

# Deploy contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/book_library.wasm \
  --source your-account \
  --network testnet

# Contract address will be printed
# Save this for API configuration
```

### Initialize Contract

```bash
soroban contract invoke \
  --id CXXXXXX... \
  --source-account your-account \
  --source your-account \
  --network testnet \
  -- initialize \
  --admin "GXXXXX..." \
  --token "GXXXXX..." \
  --deposit_amount 1000000
```

## 🧪 Testing Examples

### Test Book Registration

```bash
cargo test test_add_book -- --nocapture
```

### Test Borrowing Flow

```bash
cargo test test_book_flow -- --nocapture
```

Output:
```
1. Register book: "The Great Gatsby"
2. User A borrows book (deposit: 1000000, balance after: 9000000)
3. Check book status: owner=admin, borrower=UserA
4. User A returns book (deposit refunded: 1000000, balance after: 10000000)
5. Check book status: owner=admin, borrower=None
```

## 🔒 Security Considerations

- **Admin-Only Operations:** Critical functions restricted to admin
- **Deposit Mechanism:** Prevents malicious book hoarding
- **Immutable Records:** All transactions on testnet are permanent
- **Access Control:** Borrower verification prevents return by non-borrower
- **Type Safety:** Rust ownership system prevents memory errors

## 📚 Stellar Soroban Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Stellar Testnet](https://testnet.stellar.org/)
- [Soroban CLI Guide](https://soroban.stellar.org/docs/build/setup)

## 📝 Development Workflow

```bash
# 1. Make changes to src/lib.rs
# 2. Build to check for compilation errors
cargo build --target wasm32-unknown-unknown

# 3. Run tests to verify logic
cargo test

# 4. Build release version
cargo build --target wasm32-unknown-unknown --release

# 5. Deploy to testnet when ready
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/book_library.wasm
```

## 🐛 Common Issues

**WASM build target not found:**
```bash
rustup target add wasm32-unknown-unknown
```

**Soroban CLI not found:**
```bash
cargo install --locked soroban-cli
```

**Contract deployment fails:**
```bash
# Ensure account has XLM balance
# Check contract ID format
# Verify RPC endpoint is accessible
```

**Tests failing:**
```bash
# Update Soroban SDK version
cargo update

# Check test data setup in test.rs
```

## 📄 License

MIT License - See LICENSE file in root directory

## 🤝 Contributing

Contributions welcome! When submitting code:
- Follow Rust style guidelines (`cargo fmt`)
- Run `cargo clippy` for lint checks
- Add tests for new functionality
- Update this README with new features
- Test thoroughly on testnet before mainnet

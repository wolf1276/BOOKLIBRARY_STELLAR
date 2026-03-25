#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, String,
    Symbol,
};

// ─── Data Types ────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Book {
    pub id: u32,
    pub title: String,
    pub author: String,
    pub owner: Address,
    pub borrower: Option<Address>,
    pub borrowed_at: Option<u64>,
}

// ─── Errors ─────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    BookNotFound = 4,
    AlreadyBorrowed = 5,
    NotBorrowed = 6,
    NotBorrower = 7,
    InsufficientBalance = 8,
}

// ─── Storage Keys ──────────────────────────────────────────

const BOOK_COUNT: Symbol = symbol_short!("BK_COUNT");
const BOOKS: Symbol = symbol_short!("BOOKS");
const ADMIN: Symbol = symbol_short!("ADMIN");
const TOKEN: Symbol = symbol_short!("TOKEN");
const DEPOSIT: Symbol = symbol_short!("DEPOSIT");

// ─── Event Topics ──────────────────────────────────────────

const EVT_INIT: Symbol = symbol_short!("init");
const EVT_BOOK_ADD: Symbol = symbol_short!("book_add");
const EVT_BOOK_BRW: Symbol = symbol_short!("book_brw");
const EVT_BOOK_RET: Symbol = symbol_short!("book_ret");

// ─── Contract ──────────────────────────────────────────────

#[contract]
pub struct BookLibrary;

#[contractimpl]
impl BookLibrary {
    /// Initialize the contract with an admin address, token, and deposit amount.
    /// Must be called once before use. Admin can add books.
    pub fn initialize(
        env: Env,
        admin: Address,
        token: Address,
        deposit_amount: i128,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&BOOK_COUNT, &0u32);
        env.storage().instance().set(&TOKEN, &token);
        env.storage().instance().set(&DEPOSIT, &deposit_amount);

        // Emit init event: ("init") -> (admin, token, deposit, timestamp)
        env.events()
            .publish((EVT_INIT,), (admin, token, deposit_amount, env.ledger().timestamp()));

        Ok(())
    }

    /// Add a new book. Caller must be the admin.
    pub fn add_book(env: Env, caller: Address, title: String, author: String) -> Result<u32, Error> {
        caller.require_auth();

        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::NotInitialized)?;

        if caller != admin {
            return Err(Error::Unauthorized);
        }

        let mut count: u32 = env.storage().instance().get(&BOOK_COUNT).unwrap_or(0);
        count += 1;

        let book = Book {
            id: count,
            title: title.clone(),
            author: author.clone(),
            owner: caller.clone(),
            borrower: None,
            borrowed_at: None,
        };

        env.storage().persistent().set(&(BOOKS, count), &book);
        env.storage().instance().set(&BOOK_COUNT, &count);

        // Emit structured event: ("book_add", admin) -> (id, title, author, timestamp)
        env.events()
            .publish((EVT_BOOK_ADD, caller), (count, title, author, env.ledger().timestamp()));

        Ok(count)
    }

    /// Get details of a book by ID. Read-only.
    pub fn get_book(env: Env, id: u32) -> Option<Book> {
        env.storage().persistent().get(&(BOOKS, id))
    }

    /// Get total book count. Read-only.
    pub fn get_book_count(env: Env) -> u32 {
        env.storage().instance().get(&BOOK_COUNT).unwrap_or(0)
    }

    /// Borrow a book. Caller must sign; book must not be already borrowed.
    /// A token deposit is transferred from borrower to this contract.
    pub fn borrow_book(env: Env, borrower: Address, id: u32) -> Result<(), Error> {
        borrower.require_auth();

        let key = (BOOKS, id);
        let mut book: Book = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::BookNotFound)?;

        if book.borrower.is_some() {
            return Err(Error::AlreadyBorrowed);
        }

        // Transfer deposit from borrower to contract
        let token_addr: Address = env.storage().instance().get(&TOKEN)
            .ok_or(Error::NotInitialized)?;
        let deposit: i128 = env.storage().instance().get(&DEPOSIT)
            .ok_or(Error::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_addr);

        // Check borrower balance before transfer
        let borrower_balance = token_client.balance(&borrower);
        if borrower_balance < deposit {
            return Err(Error::InsufficientBalance);
        }

        token_client.transfer(&borrower, &env.current_contract_address(), &deposit);

        book.borrower = Some(borrower.clone());
        book.borrowed_at = Some(env.ledger().timestamp());
        env.storage().persistent().set(&key, &book);

        // Emit structured event: ("book_brw", borrower) -> (id, title, deposit, timestamp)
        let title = book.title.clone();
        env.events()
            .publish((EVT_BOOK_BRW, borrower), (id, title, deposit, env.ledger().timestamp()));
        Ok(())
    }

    /// Return a book. Only the current borrower may return it.
    /// The deposit is refunded from this contract to the borrower.
    pub fn return_book(env: Env, caller: Address, id: u32) -> Result<(), Error> {
        caller.require_auth();

        let key = (BOOKS, id);
        let mut book: Book = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::BookNotFound)?;

        match &book.borrower {
            None => return Err(Error::NotBorrowed),
            Some(current_borrower) => {
                if *current_borrower != caller {
                    return Err(Error::NotBorrower);
                }
            }
        }

        // Refund deposit from contract to borrower
        let token_addr: Address = env.storage().instance().get(&TOKEN)
            .ok_or(Error::NotInitialized)?;
        let deposit: i128 = env.storage().instance().get(&DEPOSIT)
            .ok_or(Error::NotInitialized)?;
        let token_client = token::Client::new(&env, &token_addr);

        // Check contract balance before transfer
        let contract_balance = token_client.balance(&env.current_contract_address());
        if contract_balance < deposit {
            return Err(Error::InsufficientBalance);
        }

        token_client.transfer(&env.current_contract_address(), &caller, &deposit);

        book.borrower = None;
        book.borrowed_at = None;
        env.storage().persistent().set(&key, &book);

        // Emit structured event: ("book_ret", caller) -> (id, title, deposit, timestamp)
        let title = book.title.clone();
        env.events()
            .publish((EVT_BOOK_RET, caller), (id, title, deposit, env.ledger().timestamp()));
        Ok(())
    }

    /// Get the admin address.
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::NotInitialized)
    }

    /// Update deposit amount. Admin only.
    pub fn set_deposit(env: Env, caller: Address, amount: i128) -> Result<(), Error> {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&ADMIN)
            .ok_or(Error::NotInitialized)?;
        if caller != admin {
            return Err(Error::Unauthorized);
        }
        env.storage().instance().set(&DEPOSIT, &amount);
        Ok(())
    }

    /// Get current deposit amount.
    pub fn get_deposit(env: Env) -> Result<i128, Error> {
        env.storage()
            .instance()
            .get(&DEPOSIT)
            .ok_or(Error::NotInitialized)
    }

    /// Get token contract address.
    pub fn get_token(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&TOKEN)
            .ok_or(Error::NotInitialized)
    }
}

mod test;

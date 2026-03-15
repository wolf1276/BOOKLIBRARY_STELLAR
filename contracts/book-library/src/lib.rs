#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Book {
    pub id: u32,
    pub title: String,
    pub author: String,
    pub borrower: Option<Symbol>,
}

#[contract]
pub struct BookLibrary;

const BOOK_COUNT: Symbol = symbol_short!("BK_COUNT");
const BOOKS: Symbol = symbol_short!("BOOKS");

#[contractimpl]
impl BookLibrary {
    /// Add a new book to the library
    pub fn add_book(env: Env, title: String, author: String) -> u32 {
        let mut count: u32 = env.storage().instance().get(&BOOK_COUNT).unwrap_or(0);
        count += 1;

        let book = Book {
            id: count,
            title,
            author,
            borrower: None,
        };

        env.storage().instance().set(&(BOOKS, count), &book);
        env.storage().instance().set(&BOOK_COUNT, &count);

        count
    }

    /// Get details of a book by ID
    pub fn get_book(env: Env, id: u32) -> Option<Book> {
        env.storage().instance().get(&(BOOKS, id))
    }

    /// Borrow a book
    pub fn borrow_book(env: Env, borrower: Symbol, id: u32) {
        let key = (BOOKS, id);
        let mut book: Book = env.storage().instance().get(&key).expect("Book not found");
        
        if book.borrower.is_some() {
            panic!("Book is already borrowed");
        }

        book.borrower = Some(borrower);
        env.storage().instance().set(&key, &book);
    }

    /// Return a book
    pub fn return_book(env: Env, id: u32) {
        let key = (BOOKS, id);
        let mut book: Book = env.storage().instance().get(&key).expect("Book not found");
        
        if book.borrower.is_none() {
            panic!("Book is not currently borrowed");
        }

        book.borrower = None;
        env.storage().instance().set(&key, &book);
    }
}

mod test;

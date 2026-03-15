#![cfg(test)]
use super::*;
use soroban_sdk::{Env, String, symbol_short};

#[test]
fn test_book_flow() {
    let env = Env::default();
    let contract_id = env.register(BookLibrary, ());
    let client = BookLibraryClient::new(&env, &contract_id);

    let title = String::from_str(&env, "The Great Gatsby");
    let author = String::from_str(&env, "F. Scott Fitzgerald");

    // Add book
    let id = client.add_book(&title, &author);
    assert_eq!(id, 1);

    // Get book
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.title, title);
    assert_eq!(book.author, author);
    assert_eq!(book.borrower, None);

    // Borrow book
    let borrower = symbol_short!("alice");
    client.borrow_book(&borrower, &id);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, Some(borrower));

    // Return book
    client.return_book(&id);
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, None);
}

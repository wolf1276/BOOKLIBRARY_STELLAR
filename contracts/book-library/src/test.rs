#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_env() -> (Env, BookLibraryClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(BookLibrary, ());
    let client = BookLibraryClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

// ─── Initialization ────────────────────────────────────────

#[test]
fn test_initialize() {
    let (env, client, admin) = setup_env();
    assert_eq!(client.get_admin(), admin);
    assert_eq!(client.get_book_count(), 0);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize_panics() {
    let (env, client, admin) = setup_env();
    let admin2 = Address::generate(&env);
    client.initialize(&admin2);
}

// ─── Add Book ──────────────────────────────────────────────

#[test]
fn test_add_book() {
    let (env, client, admin) = setup_env();

    let title = String::from_str(&env, "The Great Gatsby");
    let author = String::from_str(&env, "F. Scott Fitzgerald");

    let id = client.add_book(&admin, &title, &author);
    assert_eq!(id, 1);
    assert_eq!(client.get_book_count(), 1);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.title, title);
    assert_eq!(book.author, author);
    assert_eq!(book.owner, admin);
    assert_eq!(book.borrower, None);
}

#[test]
fn test_add_multiple_books() {
    let (env, client, admin) = setup_env();

    let id1 = client.add_book(
        &admin,
        &String::from_str(&env, "Book One"),
        &String::from_str(&env, "Author One"),
    );
    let id2 = client.add_book(
        &admin,
        &String::from_str(&env, "Book Two"),
        &String::from_str(&env, "Author Two"),
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(client.get_book_count(), 2);
}

#[test]
#[should_panic(expected = "Only admin can add books")]
fn test_non_admin_cannot_add_book() {
    let (env, client, _admin) = setup_env();
    let stranger = Address::generate(&env);

    client.add_book(
        &stranger,
        &String::from_str(&env, "Rogue Book"),
        &String::from_str(&env, "Nobody"),
    );
}

// ─── Get Book ──────────────────────────────────────────────

#[test]
fn test_get_nonexistent_book() {
    let (_env, client, _admin) = setup_env();
    assert_eq!(client.get_book(&999), None);
}

// ─── Borrow Book ───────────────────────────────────────────

#[test]
fn test_borrow_book() {
    let (env, client, admin) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "1984"),
        &String::from_str(&env, "George Orwell"),
    );

    let borrower = Address::generate(&env);
    client.borrow_book(&borrower, &id);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, Some(borrower));
}

#[test]
#[should_panic(expected = "Book is already borrowed")]
fn test_double_borrow_panics() {
    let (env, client, admin) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Dune"),
        &String::from_str(&env, "Frank Herbert"),
    );

    let borrower1 = Address::generate(&env);
    let borrower2 = Address::generate(&env);

    client.borrow_book(&borrower1, &id);
    client.borrow_book(&borrower2, &id); // should panic
}

#[test]
#[should_panic(expected = "Book not found")]
fn test_borrow_nonexistent_book() {
    let (env, client, _admin) = setup_env();
    let borrower = Address::generate(&env);
    client.borrow_book(&borrower, &999);
}

// ─── Return Book ───────────────────────────────────────────

#[test]
fn test_return_book() {
    let (env, client, admin) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Sapiens"),
        &String::from_str(&env, "Yuval Noah Harari"),
    );

    let borrower = Address::generate(&env);
    client.borrow_book(&borrower, &id);
    client.return_book(&borrower, &id);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, None);
}

#[test]
#[should_panic(expected = "Book is not currently borrowed")]
fn test_return_unborrowed_book_panics() {
    let (env, client, admin) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Clean Code"),
        &String::from_str(&env, "Robert Martin"),
    );

    let caller = Address::generate(&env);
    client.return_book(&caller, &id);
}

#[test]
#[should_panic(expected = "Only the current borrower can return this book")]
fn test_wrong_borrower_cannot_return() {
    let (env, client, admin) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "LOTR"),
        &String::from_str(&env, "Tolkien"),
    );

    let real_borrower = Address::generate(&env);
    let impostor = Address::generate(&env);

    client.borrow_book(&real_borrower, &id);
    client.return_book(&impostor, &id); // should panic
}

// ─── Full Flow ─────────────────────────────────────────────

#[test]
fn test_full_lifecycle() {
    let (env, client, admin) = setup_env();

    // Add
    let id = client.add_book(
        &admin,
        &String::from_str(&env, "The Pragmatic Programmer"),
        &String::from_str(&env, "Andy Hunt"),
    );
    assert_eq!(id, 1);

    // Verify initial state
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, None);

    // Borrow
    let borrower = Address::generate(&env);
    client.borrow_book(&borrower, &id);
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, Some(borrower.clone()));

    // Return
    client.return_book(&borrower, &id);
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, None);

    // Re-borrow by different user
    let borrower2 = Address::generate(&env);
    client.borrow_book(&borrower2, &id);
    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, Some(borrower2));
}

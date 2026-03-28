#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_env() -> (Env, BookLibraryClient<'static>, Address, token::Client<'static>) {
    let env = Env::default();
    env.mock_all_auths();

    // Setup contract
    let contract_id = env.register(BookLibrary, ());
    let client = BookLibraryClient::new(&env, &contract_id);

    // Setup token
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::Client::new(&env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_id);

    // Initialize BookLibrary
    let deposit = 100_000_000i128; // Default mock deposit
    client.initialize(&admin, &token_id, &deposit);

    (env, client, admin, token_client)
}

fn mint_to(env: &Env, token_id: &Address, to: &Address, amount: i128) {
    let admin = Address::generate(env); // This works because mock_all_auths is on
    let token_admin_client = token::StellarAssetClient::new(env, token_id);
    token_admin_client.mint(to, &amount);
}

// ─── Initialization ────────────────────────────────────────

#[test]
fn test_initialize() {
    let (_env, client, admin, _token) = setup_env();
    assert_eq!(client.get_admin(), admin);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialize_panics() {
    let (env, client, _admin, _token) = setup_env();
    let admin2 = Address::generate(&env);
    let token2 = Address::generate(&env);
    client.initialize(&admin2, &token2, &100i128);
}

// ─── Add Book ──────────────────────────────────────────────

#[test]
fn test_add_book() {
    let (env, client, admin, _token) = setup_env();

    let title = String::from_str(&env, "The Great Gatsby");
    let author = String::from_str(&env, "F. Scott Fitzgerald");

    let id = client.add_book(&admin, &title, &author);
    assert_eq!(id, 1);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.title, title);
    assert_eq!(book.author, author);
}

#[test]
fn test_add_multiple_books() {
    let (env, client, admin, _token) = setup_env();

    client.add_book(
        &admin,
        &String::from_str(&env, "Book One"),
        &String::from_str(&env, "Author One"),
    );
    client.add_book(
        &admin,
        &String::from_str(&env, "Book Two"),
        &String::from_str(&env, "Author Two"),
    );

    assert_eq!(client.get_book_count(), 2);
}

#[test]
#[should_panic(expected = "Unauthorized")]
fn test_non_admin_cannot_add_book() {
    let (env, client, _admin, _token) = setup_env();
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
    let (_env, client, _admin, _token) = setup_env();
    assert_eq!(client.get_book(&999), None);
}

// ─── Borrow Book ───────────────────────────────────────────

#[test]
fn test_borrow_book() {
    let (env, client, admin, token) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "1984"),
        &String::from_str(&env, "George Orwell"),
    );

    let borrower = Address::generate(&env);
    mint_to(&env, &token.address, &borrower, 200_000_000i128);
    client.borrow_book(&borrower, &id);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, Some(borrower));
}

#[test]
#[should_panic(expected = "AlreadyBorrowed")]
fn test_double_borrow_panics() {
    let (env, client, admin, token) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Dune"),
        &String::from_str(&env, "Frank Herbert"),
    );

    let borrower1 = Address::generate(&env);
    let borrower2 = Address::generate(&env);

    mint_to(&env, &token.address, &borrower1, 200_000_000i128);
    mint_to(&env, &token.address, &borrower2, 200_000_000i128);

    client.borrow_book(&borrower1, &id);
    client.borrow_book(&borrower2, &id); // should panic
}

#[test]
#[should_panic(expected = "BookNotFound")]
fn test_borrow_nonexistent_book() {
    let (env, client, _admin, token) = setup_env();
    let borrower = Address::generate(&env);
    mint_to(&env, &token.address, &borrower, 200_000_000i128);
    client.borrow_book(&borrower, &999);
}

// ─── Return Book ───────────────────────────────────────────

#[test]
fn test_return_book() {
    let (env, client, admin, token) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Sapiens"),
        &String::from_str(&env, "Yuval Noah Harari"),
    );

    let borrower = Address::generate(&env);
    mint_to(&env, &token.address, &borrower, 200_000_000i128);

    client.borrow_book(&borrower, &id);
    client.return_book(&borrower, &id);

    let book = client.get_book(&id).unwrap();
    assert_eq!(book.borrower, None);
}

#[test]
#[should_panic(expected = "NotBorrowed")]
fn test_return_unborrowed_book_panics() {
    let (env, client, admin, _token) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "Clean Code"),
        &String::from_str(&env, "Robert Martin"),
    );

    let caller = Address::generate(&env);
    client.return_book(&caller, &id);
}

#[test]
#[should_panic(expected = "NotBorrower")]
fn test_wrong_borrower_cannot_return() {
    let (env, client, admin, token) = setup_env();

    let id = client.add_book(
        &admin,
        &String::from_str(&env, "LOTR"),
        &String::from_str(&env, "Tolkien"),
    );

    let real_borrower = Address::generate(&env);
    let impostor = Address::generate(&env);

    mint_to(&env, &token.address, &real_borrower, 200_000_000i128);

    client.borrow_book(&real_borrower, &id);
    client.return_book(&impostor, &id); // should panic
}

// ─── Full Flow ─────────────────────────────────────────────

#[test]
fn test_full_lifecycle() {
    let (env, client, admin, token) = setup_env();

    // Add
    let id1 = client.add_book(
        &admin,
        &String::from_str(&env, "The Pragmatic Programmer"),
        &String::from_str(&env, "Andy Hunt"),
    );
    assert_eq!(id1, 1);

    // Initial borrow
    let borrower1 = Address::generate(&env);
    mint_to(&env, &token.address, &borrower1, 200_000_000i128);
    client.borrow_book(&borrower1, &id1);

    // Return
    client.return_book(&borrower1, &id1);

    // Re-borrow by different user
    let borrower2 = Address::generate(&env);
    mint_to(&env, &token.address, &borrower2, 200_000_000i128);
    client.borrow_book(&borrower2, &id1);

    let book = client.get_book(&id1).unwrap();
    assert_eq!(book.borrower, Some(borrower2));
}

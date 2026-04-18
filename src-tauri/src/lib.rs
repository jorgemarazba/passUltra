use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use rusqlite::{Connection, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct DecryptedPassword {
    id: i32,
    site: String,
    url: String,
    username: String,
    password_decrypted: String,
}

fn init_db() -> Result<Connection> {
    let conn = Connection::open("vault.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS passwords (
            id INTEGER PRIMARY KEY,
            site TEXT NOT NULL,
            url TEXT NOT NULL,
            username TEXT NOT NULL,
            password_blob TEXT NOT NULL
        )",
        [],
    )?;
    Ok(conn)
}

fn encrypt_text(plain_text: &str) -> String {
    let key = Key::<Aes256Gcm>::from_slice(b"una_clave_secreta_de_32_bytes!!!");
    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, plain_text.as_bytes()).unwrap();
    let mut encrypted_data = nonce.to_vec();
    encrypted_data.extend_from_slice(&ciphertext);
    hex::encode(encrypted_data)
}

fn decrypt_text(encrypted_hex: &str) -> String {
    let key = Key::<Aes256Gcm>::from_slice(b"una_clave_secreta_de_32_bytes!!!");
    let cipher = Aes256Gcm::new(&key);
    let encrypted_data = hex::decode(encrypted_hex).unwrap();
    let (nonce_bytes, ciphertext) = encrypted_data.split_at(12);
    let nonce = aes_gcm::Nonce::from_slice(nonce_bytes);
    let plaintext = cipher.decrypt(nonce, ciphertext).unwrap();
    String::from_utf8(plaintext).unwrap()
}

#[tauri::command]
fn encrypt_and_save(site: String, url: String, user: String, raw_pass: String) -> String {
    let conn = init_db().unwrap();
    let encrypted_pass = encrypt_text(&raw_pass);
    conn.execute(
        "INSERT INTO passwords (site, url, username, password_blob) VALUES (?1, ?2, ?3, ?4)",
        [&site, &url, &user, &encrypted_pass],
    )
    .unwrap();
    format!("¡PUM! 🔐 '{}' protegido.", site)
}

#[tauri::command]
fn get_all_passwords() -> Result<Vec<DecryptedPassword>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, site, url, username, password_blob FROM passwords")
        .map_err(|e| e.to_string())?;

    let password_iter = stmt
        .query_map([], |row| {
            let encrypted_blob: String = row.get(4)?;
            let final_pass = decrypt_text(&encrypted_blob);
            Ok(DecryptedPassword {
                id: row.get(0)?,
                site: row.get(1)?,
                url: row.get(2)?,
                username: row.get(3)?,
                password_decrypted: final_pass,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for pass in password_iter {
        results.push(pass.unwrap());
    }
    Ok(results)
}

// NUEVA LA FUNCION QUE DESTRUYE LOS DATOS (SQL: DELETE FROM)
#[tauri::command]
fn delete_password(id: i32) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    match conn.execute("DELETE FROM passwords WHERE id = ?1", [&id]) {
        Ok(_) => Ok("Eliminada para siempre".to_string()),
        Err(e) => Err(format!("Fallo al eliminar: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        // Registramos nuestro nuevo comando aquí:
        .invoke_handler(tauri::generate_handler![
            encrypt_and_save,
            get_all_passwords,
            delete_password,
            update_password // <--- Lo registramos aquí alistando los motores
        ])
        .run(tauri::generate_context!())
        .expect("error al correr la aplicación de Tauri");
}

// LA FUNCIÓN DE MUTACIÓN: Re-escribe un registro existente entero
#[tauri::command]
fn update_password(
    id: i32,
    site: String,
    url: String,
    user: String,
    raw_pass: String,
) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    // Primero: Usamos nuestra magia militar (AES-256) para encriptar la "nueva" contraseña
    let encrypted_pass = encrypt_text(&raw_pass);

    // Segundo: Le ordenamos a SQLite que busque en la bóveda al paciente "ID" y le inyecte los nuevos organos.
    // Usamos una Tupla (...) porque mezclamos Textos e Integers.
    match conn.execute(
        "UPDATE passwords SET site = ?1, url = ?2, username = ?3, password_blob = ?4 WHERE id = ?5",
        (&site, &url, &user, &encrypted_pass, &id),
    ) {
        Ok(_) => Ok("Modificación Exitosa".to_string()),
        Err(e) => Err(format!("Fallo Crítico al actualizar: {}", e)),
    }
}

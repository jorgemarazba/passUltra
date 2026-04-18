use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use rusqlite::{Connection, Result as SqlResult};
use serde::Serialize;
use sha2::{Digest, Sha256}; // <-- ¡Importamos la Magia Criptográfica SHA-2!

#[derive(Serialize)]
pub struct DecryptedPassword {
    id: i32,
    site: String,
    url: String,
    username: String,
    password_decrypted: String,
}

fn init_db() -> SqlResult<Connection> {
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

// 1. NUEVA FUNCIÓN MATEMÁTICA: Deriva CUALQUIER contraseña a 32 bytes exactos usando SHA-256
fn derive_master_key(master_password: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(master_password.as_bytes());
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result); // Cortamos a los 32-bytes perfectos
    key
}

// 2. Modificamos para ser dinámico y usar la llave inyectada
fn encrypt_text(plain_text: &str, master_key_hash: &[u8; 32]) -> String {
    let key = Key::<Aes256Gcm>::from_slice(master_key_hash);
    let cipher = Aes256Gcm::new(&key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher.encrypt(&nonce, plain_text.as_bytes()).unwrap();
    let mut encrypted_data = nonce.to_vec();
    encrypted_data.extend_from_slice(&ciphertext);
    hex::encode(encrypted_data)
}

// 3. Modificamos el desencriptado para BOTAR A LOS HACKERS (Si la llave es mala, lanza error)
fn decrypt_text(encrypted_hex: &str, master_key_hash: &[u8; 32]) -> Result<String, String> {
    let key = Key::<Aes256Gcm>::from_slice(master_key_hash);
    let cipher = Aes256Gcm::new(&key);
    let encrypted_data = hex::decode(encrypted_hex).map_err(|e| e.to_string())?;

    if encrypted_data.len() < 12 {
        return Err("Datos corruptos".into());
    }

    let (nonce_bytes, ciphertext) = encrypted_data.split_at(12);
    let nonce = aes_gcm::Nonce::from_slice(nonce_bytes);

    // La prueba de fuego: si intenta desencriptar con llave mala, rebota el candado
    match cipher.decrypt(nonce, ciphertext) {
        Ok(plaintext) => String::from_utf8(plaintext).map_err(|e| e.to_string()),
        Err(_) => Err("Clave Maestra Incorrecta".into()), // ¡Muro Blindado!
    }
}

// 4. Modificamos TODOS nuestros comandos públicos para exigir el Pasaporte Criptográfico "master_pass"
#[tauri::command]
fn encrypt_and_save(
    site: String,
    url: String,
    user: String,
    raw_pass: String,
    master_pass: String,
) -> Result<String, String> {
    let master_hash = derive_master_key(&master_pass);
    let conn = init_db().map_err(|e| e.to_string())?;

    let encrypted_pass = encrypt_text(&raw_pass, &master_hash);

    conn.execute(
        "INSERT INTO passwords (site, url, username, password_blob) VALUES (?1, ?2, ?3, ?4)",
        (&site, &url, &user, &encrypted_pass),
    )
    .map_err(|e| e.to_string())?;

    Ok(format!("¡PUM! 🔐 '{}' protegido.", site))
}

#[tauri::command]
fn get_all_passwords(master_pass: String) -> Result<Vec<DecryptedPassword>, String> {
    let master_hash = derive_master_key(&master_pass);
    let conn = init_db().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, site, url, username, password_blob FROM passwords")
        .map_err(|e| e.to_string())?;

    let password_iter = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, i32>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for pass in password_iter {
        let (id, site, url, username, encrypted_blob) = pass.map_err(|e| e.to_string())?;

        // Si esto falla (por meter contraseña mala en el Login), React recibirá este error directo.
        let final_pass = decrypt_text(&encrypted_blob, &master_hash)?;

        results.push(DecryptedPassword {
            id,
            site,
            url,
            username,
            password_decrypted: final_pass,
        });
    }

    Ok(results)
}

#[tauri::command]
fn update_password(
    id: i32,
    site: String,
    url: String,
    user: String,
    raw_pass: String,
    master_pass: String,
) -> Result<String, String> {
    let master_hash = derive_master_key(&master_pass);
    let conn = init_db().map_err(|e| e.to_string())?;

    let encrypted_pass = encrypt_text(&raw_pass, &master_hash);

    match conn.execute(
        "UPDATE passwords SET site = ?1, url = ?2, username = ?3, password_blob = ?4 WHERE id = ?5",
        (&site, &url, &user, &encrypted_pass, &id),
    ) {
        Ok(_) => Ok("Modificación Exitosa".to_string()),
        Err(e) => Err(format!("Fallo Crítico al actualizar: {}", e)),
    }
}

// Este no encripta datos, solo borra registros de tabla.
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
        .invoke_handler(tauri::generate_handler![
            encrypt_and_save,
            get_all_passwords,
            delete_password,
            update_password
        ])
        .run(tauri::generate_context!())
        .expect("error al correr la aplicación de Tauri");
}

use std::collections::HashMap;

const URL_UPLOAD: &str = "http://127.0.0.1:8000/v1/images/upload_base64";
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    let url = "https://www.rust-lang.org";
    let rc = reqwest::blocking::get(url).unwrap(); //同期処理にするためreqwest::blockingから呼び出す。
    let contents = rc.text().unwrap();
    println!("{}", contents);
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn add(a: i32, b: i32) -> i32 {
    return a + b;
}

#[tauri::command]
fn upload_file(img: String) -> Result<String, u16> {
    // base64プレフィックスを除去
    let img_data = if img.starts_with("data:image/jpeg;base64,") {
        img.replace("data:image/jpeg;base64,", "")
    } else {
        img
    };

    let request = HashMap::from([("image", img_data)]);
    let client = reqwest::blocking::Client::new();
    let res = client
        .post(URL_UPLOAD)
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .unwrap();

    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    let res_text = res.text().unwrap();
    let res_json: HashMap<String, String> = serde_json::from_str(&res_text).unwrap();
    Ok(res_json["image_id"].clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, add, upload_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

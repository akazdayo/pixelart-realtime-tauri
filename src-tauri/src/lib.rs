use std::collections::HashMap;
mod utils;
use crate::utils::mosaic::apply_mosaic_to_base64;
use crate::utils::string2vec::string2vec;

const URL_UPLOAD: &str = "http://127.0.0.1:8000/v1/images/upload_base64";
const URL_KMEANS: &str = "http://127.0.0.1:8000/v1/images/convert/kmeans";
const URL_CONVERT: &str = "http://127.0.0.1:8000/v1/images/convert";
const URL_GET_IMAGE: &str = "http://127.0.0.1:8000/v1/images/";

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn upload_file(img: String) -> Result<String, u16> {
    // base64プレフィックスを除去
    let img_data = if img.starts_with("data:image/png;base64,") {
        img.replace("data:image/png;base64,", "")
    } else {
        img
    };

    let request = HashMap::from([("image", img_data)]);
    let client = reqwest::Client::new();
    let res = client
        .post(URL_UPLOAD)
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|_| 500u16)?;

    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    let res_text = res.text().await.map_err(|_| 500u16)?;
    let res_json: HashMap<String, String> = serde_json::from_str(&res_text).map_err(|_| 500u16)?;
    Ok(res_json["image_id"].clone())
}

#[tauri::command]
async fn kmeans(id: String, k: u8) -> Result<Vec<Vec<i32>>, u16> {
    let request = HashMap::from([("image_id", id), ("k", k.to_string())]);
    let client = reqwest::Client::new();
    let res = client
        .post(URL_KMEANS)
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|_| 500u16)?;

    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    let res_text = res.text().await.map_err(|_| 500u16)?;
    let res_json: HashMap<String, String> = serde_json::from_str(&res_text).map_err(|_| 500u16)?;

    Ok(string2vec(&res_json["cluster"]))
}

#[tauri::command]
async fn get_image(id: String) -> Result<String, u16> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}{}", URL_GET_IMAGE, id))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|_| 500u16)?;
    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    let res_text = res.text().await.map_err(|_| 500u16)?;
    let res_json: HashMap<String, String> = serde_json::from_str(&res_text).map_err(|_| 500u16)?;
    let img_data = res_json["image"].clone();
    Ok(img_data)
}

#[tauri::command]
fn apply_mosaic(image: String, size: i32) -> Result<String, String> {
    // base64プレフィックスを除去
    let img_data = if image.starts_with("data:image/png;base64,") {
        image.replace("data:image/png;base64,", "")
    } else {
        image
    };

    apply_mosaic_to_base64(&img_data, size)
}

#[tauri::command]
async fn apply_colors(id: String, colors: Vec<Vec<i32>>) -> Result<(), u16> {
    let request = HashMap::from([
        ("image_id", id),
        (
            "palette",
            serde_json::to_string(&colors).map_err(|_| 500u16)?,
        ),
    ]);
    let client = reqwest::Client::new();
    let res = client
        .post(URL_CONVERT)
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|_| 500u16)?;

    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            upload_file,
            kmeans,
            get_image,
            apply_mosaic,
            apply_colors,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

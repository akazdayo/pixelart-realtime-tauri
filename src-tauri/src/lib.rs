use std::collections::HashMap;
mod utils;

use crate::utils::mosaic::{downscale, upscale};
use crate::utils::string2vec::string2vec;

const URL_UPLOAD: &str = "http://127.0.0.1:8000/v1/images/upload_base64";
const URL_SET: &str = "http://127.0.0.1:8000/v1/images/set";
const URL_KMEANS: &str = "http://127.0.0.1:8000/v1/images/convert/kmeans";
const URL_CONVERT: &str = "http://127.0.0.1:8000/v1/images/convert";
const URL_GET_IMAGE: &str = "http://127.0.0.1:8000/v1/images/";
const URL_DOG: &str = "http://127.0.0.1:8000/v1/images/convert/dog?image_id=";
const URL_MORPHOLOGY: &str = "http://127.0.0.1:8000/v1/images/convert/morphology?image_id=";
const URL_SATURATION: &str = "http://127.0.0.1:8000/v1/images/enchance/saturation";

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
fn apply_downscale(image: String, size: i32) -> Result<String, String> {
    // base64プレフィックスを除去
    let small = downscale(&image, size)?;
    return Ok(small);
}

#[tauri::command]
fn apply_upscale(image: String, width: i32, height: i32) -> Result<String, String> {
    // base64プレフィックスを除去
    let large = upscale(&image, width, height)?;
    return Ok(large);
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

#[tauri::command]
async fn apply_edge(id: String) -> Result<(), u16> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}{}", URL_DOG, id))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|_| 500u16)?;
    if res.status() != 200 {
        return Err(res.status().as_u16());
    }
    Ok(())
}

#[tauri::command]
async fn apply_morphology(id: String) -> Result<(), u16> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}{}", URL_MORPHOLOGY, id))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|_| 500u16)?;
    // エラーハンドリングした方がいい
    if res.status() != 200 {
        return Err(res.status().as_u16());
    }

    Ok(())
}

#[tauri::command]
async fn set_image(id: String, image: String) -> Result<(), u16> {
    let request = HashMap::from([("image_id", id), ("image_data", image)]);
    let client = reqwest::Client::new();
    let res = client
        .post(URL_SET)
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

#[tauri::command]
async fn apply_saturation(id: String, value: i8) -> Result<(), u16> {
    let request = HashMap::from([("image_id", id), ("value", value.to_string())]);
    let client = reqwest::Client::new();
    let res = client
        .get(URL_SATURATION)
        .json(&request)
        .header("Content-Type", "application/json")
        .send()
        .await
        .unwrap();
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
            apply_upscale,
            apply_downscale,
            apply_colors,
            apply_edge,
            set_image,
            apply_morphology,
            apply_saturation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

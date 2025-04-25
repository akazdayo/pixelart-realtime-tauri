use base64::{engine::general_purpose::STANDARD, Engine};
use opencv::{
    core::{Mat, Vector},
    imgcodecs,
    prelude::*,
};

pub fn to_mat(base64: &str) -> Result<Mat, String> {
    // Base64をデコードしてMatに変換
    let image_byte = STANDARD
        .decode(base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    let image_vector = Vector::from_slice(&image_byte);
    let mat_image = imgcodecs::imdecode(&image_vector, imgcodecs::IMREAD_COLOR)
        .map_err(|e| format!("Failed to decode image: {}", e))?;
    Ok(mat_image)
}
pub fn to_base64(mat: &Mat) -> Result<String, String> {
    // 画像をPNGとしてエンコード
    let mut buf = Vector::new();
    let params = Vector::new();
    imgcodecs::imencode(".png", mat, &mut buf, &params)
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    // Base64にエンコード
    Ok(STANDARD.encode(&buf.to_vec()))
}

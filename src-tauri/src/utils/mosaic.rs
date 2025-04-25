use crate::utils::cv::{to_base64, to_mat};
use opencv::{
    core::{Mat, Size_},
    imgproc,
    prelude::*,
};

fn _downscale(mat: Mat, scale: i32) -> Result<Mat, String> {
    // 画像を縮小
    let mut small = Mat::default();
    let aspect = mat.cols() / mat.rows();
    imgproc::resize(
        &mat,
        &mut small,
        Size_::new(scale, scale * aspect),
        0.0,
        0.0,
        imgproc::INTER_NEAREST,
    )
    .map_err(|e| format!("Failed to downscale image: {}", e))?;
    Ok(small)
}
fn _upscale(mat: Mat, width: i32, height: i32) -> Result<Mat, String> {
    // 画像を拡大
    let mut large = Mat::default();
    imgproc::resize(
        &mat,
        &mut large,
        Size_::new(width, height),
        0.0,
        0.0,
        imgproc::INTER_NEAREST,
    )
    .map_err(|e| format!("Failed to upscale image: {}", e))?;
    Ok(large)
}

/// Base64形式の画像データを受け取り、モザイク処理を適用して再びBase64形式で返す
pub fn downscale(base64_image: &str, block_size: i32) -> Result<String, String> {
    let mat = to_mat(base64_image).map_err(|e| format!("Failed to decode base64: {}", e))?;
    let small = _downscale(mat, block_size)?;
    Ok(to_base64(&small).map_err(|e| format!("Failed to encode image: {}", e))?)
}
pub fn upscale(base64_image: &str, width: i32, height: i32) -> Result<String, String> {
    let mat = to_mat(base64_image).map_err(|e| format!("Failed to decode base64: {}", e))?;
    let large = _upscale(mat, width, height)?;
    Ok(to_base64(&large).map_err(|e| format!("Failed to encode image: {}", e))?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_apply_mosaic() {
        // テスト用の単純な画像データを作成
        const URL: &str = "";
        // モザイク処理を適用
        let downscaled = downscale(URL, 30).unwrap();
        let upscaled = upscale(&downscaled, 256, 256).unwrap();
        let result = to_mat(&upscaled).unwrap();

        // 結果の検証
        assert_eq!(result.size().unwrap().width, 256);
        assert_eq!(result.size().unwrap().height, 256);
    }
}

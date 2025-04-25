use base64::{engine::general_purpose::STANDARD, Engine};
use opencv::{
    core::{Mat, Size_, Vector},
    imgcodecs, imgproc,
    prelude::*,
};

/// Base64形式の画像データを受け取り、モザイク処理を適用して再びBase64形式で返す
pub fn apply_mosaic_to_base64(base64_image: &str, block_size: i32) -> Result<String, String> {
    // Base64をデコードしてバイトデータに変換
    let image_data = STANDARD
        .decode(base64_image)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    // バイトデータをOpenCV Matに変換
    let img_vector = Vector::from_slice(&image_data);
    let img = imgcodecs::imdecode(&img_vector, imgcodecs::IMREAD_COLOR)
        .map_err(|e| format!("Failed to decode image: {}", e))?;

    // モザイク処理を適用
    let mosaic_img =
        apply_mosaic(&img, block_size).map_err(|e| format!("Failed to apply mosaic: {}", e))?;

    // 画像をJPEGとしてエンコード
    let mut buf = Vector::new();
    let params = Vector::new();
    imgcodecs::imencode(".png", &mosaic_img, &mut buf, &params)
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    // Base64にエンコード
    Ok(STANDARD.encode(&buf.to_vec()))
}

/// OpenCV Matに対してモザイク処理を適用する
fn apply_mosaic(img: &Mat, size: i32) -> Result<Mat, opencv::Error> {
    let aspect = img.rows() as f64 / img.cols() as f64;

    // 縮小用の一時変数
    let mut small = Mat::default();
    let mut result_image = Mat::default();

    // 画像を縮小
    imgproc::resize(
        img,
        &mut small,
        Size_::new(size, (size as f64 * aspect) as i32),
        0.0,
        0.0,
        imgproc::INTER_NEAREST,
    )?;

    // 元のサイズに戻す
    imgproc::resize(
        &small,
        &mut result_image,
        Size_::new(img.cols(), img.rows()),
        0.0,
        0.0,
        imgproc::INTER_NEAREST,
    )?;

    Ok(result_image)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_apply_mosaic() {
        // テスト用の単純な画像データを作成
        let test_img = Mat::new_rows_cols_with_default(
            100,
            100,
            opencv::core::CV_8UC3,
            opencv::core::Scalar::all(255.0),
        )
        .unwrap();

        // モザイク処理を適用
        let result = apply_mosaic(&test_img, 10).unwrap();

        // 結果の検証
        assert_eq!(result.size().unwrap().width, 100);
        assert_eq!(result.size().unwrap().height, 100);
    }
}

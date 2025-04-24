use serde_json::Value;

pub fn string2vec(cluster_str: &str) -> Vec<Vec<i32>> {
    let parsed: Value = serde_json::from_str(cluster_str).unwrap_or(Value::Array(vec![]));
    if let Value::Array(outer) = parsed {
        outer
            .into_iter()
            .filter_map(|inner| {
                if let Value::Array(nums) = inner {
                    Some(
                        nums.into_iter()
                            .filter_map(|v| v.as_i64().map(|n| n as i32))
                            .collect(),
                    )
                } else {
                    None
                }
            })
            .collect()
    } else {
        vec![]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_string2vec() {
        let input = "[[140,121,113], [ 34, 35, 38], [124,193,233], [114,138,199], [ 80, 83, 79], [ 53, 59, 61], [187,165,133], [ 69, 90,128]]";
        let expected = vec![
            vec![140, 121, 113],
            vec![34, 35, 38],
            vec![124, 193, 233],
            vec![114, 138, 199],
            vec![80, 83, 79],
            vec![53, 59, 61],
            vec![187, 165, 133],
            vec![69, 90, 128],
        ];
        assert_eq!(string2vec(input), expected);
    }
}

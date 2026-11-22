#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::webview::NewWindowResponse;
use tauri_plugin_opener::OpenerExt;

fn can_open_external(url: &tauri::Url) -> bool {
    matches!(url.scheme(), "https" | "http" | "mailto" | "tel")
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::WebviewWindowBuilder::from_config(app, &app.config().app.windows[0])?
                .on_new_window(move |url, _| {
                    if can_open_external(&url) {
                        if let Err(error) = handle.opener().open_url(url.as_str(), None::<&str>) {
                            eprintln!("Failed to open external URL: {error}");
                        }
                    }
                    NewWindowResponse::Deny
                })
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Failed to run Doocs MD desktop");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn external_urls_only_use_browser_protocols() {
        for url in [
            "https://md.doocs.org",
            "http://localhost:8787",
            "mailto:hi@example.com",
            "tel:123",
        ] {
            assert!(can_open_external(&tauri::Url::parse(url).unwrap()));
        }
        for url in [
            "file:///etc/passwd",
            "javascript:alert(1)",
            "data:text/html,hello",
            "tauri://localhost",
        ] {
            assert!(!can_open_external(&tauri::Url::parse(url).unwrap()));
        }
    }
}

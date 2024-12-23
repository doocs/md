package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed assets
var assets embed.FS

func main() {
	mutex := http.NewServeMux()
	md, _ := fs.Sub(assets, "assets")
	mutex.Handle("/", http.FileServer(http.FS(md)))
	err := http.ListenAndServe(":80", mutex)
	if err != nil {
		log.Fatal(err)
	}
}

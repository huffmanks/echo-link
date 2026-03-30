package main

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func sendError(w http.ResponseWriter, code int, errId string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": errId})
}

func main() {
	apiTarget := os.Getenv("LINKDING_CONTAINER_URL")
	apiToken := os.Getenv("LINKDING_API_TOKEN")

	target, _ := url.Parse(apiTarget)

	workDir, _ := os.Getwd()
	staticDir := filepath.Join(workDir, "dist")

	proxy := httputil.NewSingleHostReverseProxy(target)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = target.Host
		if apiToken != "" {
			req.Header.Set("Authorization", "Token "+apiToken)
		}
	}

	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		sendError(w, http.StatusBadGateway, "API_TARGET_UNREACHABLE")
	}

	isLinkdingPath := regexp.MustCompile(`^/(api|assets|favicons|media|previews|static)`)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if isLinkdingPath.MatchString(r.URL.Path) {
			if apiTarget == "" {
				sendError(w, http.StatusInternalServerError, "API_TARGET_MISSING")
				return
			}

			if apiToken == "" {
				sendError(w, http.StatusUnauthorized, "API_TOKEN_MISSING")
				return
			}

			proxy.ServeHTTP(w, r)
			return
		}

		requestedPath := filepath.Clean(r.URL.Path)
		fpath := filepath.Join(staticDir, requestedPath)

		if !strings.HasPrefix(fpath, filepath.Clean(staticDir)) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		if requestedPath == "/sw.js" || requestedPath == "/index.html" || requestedPath == "/" {
			w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
		}

		info, err := os.Stat(fpath)
		if err != nil || info.IsDir() {
			http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
			return
		}

		http.ServeFile(w, r, fpath)
	})

	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "3000"
	}

	addr := ":" + appPort
	log.Printf("Server starting on %s", addr)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

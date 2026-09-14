package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

func sendError(w http.ResponseWriter, code int, errID string, err error) {
	log.Printf("[ERROR] ID: %s | Status: %d | Message: %v", errID, code, err)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": errID,
	})
}

func serveIndex(w http.ResponseWriter, staticDir string) {
	indexPath := filepath.Join(staticDir, "index.html")
	content, err := os.ReadFile(indexPath)
	if err != nil {
		http.Error(w, "Index not found", http.StatusNotFound)
		return
	}

	html := string(content)

	userName := os.Getenv("ECHOLINK_USER_NAME")
	html = strings.ReplaceAll(html, "__ECHOLINK_USER_NAME__", userName)

	linkdingURL := os.Getenv("LINKDING_EXTERNAL_URL")
	html = strings.ReplaceAll(html, "__LINKDING_EXTERNAL_URL__", linkdingURL)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, html)
}

func proxyLinkding(w http.ResponseWriter, r *http.Request) {
	apiTarget := strings.TrimSpace(os.Getenv("LINKDING_CONTAINER_URL"))
	if apiTarget == "" {
		sendError(
			w,
			http.StatusInternalServerError,
			"API_TARGET_MISSING",
			fmt.Errorf("LINKDING_CONTAINER_URL is not configured"),
		)
		return
	}

	target, err := url.Parse(apiTarget)
	if err != nil || target.Scheme == "" || target.Host == "" {
		sendError(
			w,
			http.StatusInternalServerError,
			"API_TARGET_INVALID",
			fmt.Errorf("invalid LINKDING_CONTAINER_URL %q", apiTarget),
		)
		return
	}

	apiToken := strings.TrimSpace(os.Getenv("LINKDING_API_TOKEN"))
	if apiToken == "" {
		sendError(
			w,
			http.StatusUnauthorized,
			"API_TOKEN_MISSING",
			fmt.Errorf("LINKDING_API_TOKEN is not configured"),
		)
		return
	}

	proxy := &httputil.ReverseProxy{
		Rewrite: func(pr *httputil.ProxyRequest) {
			pr.Out.URL.Scheme = target.Scheme
			pr.Out.URL.Host = target.Host
			pr.Out.Host = target.Host
			pr.Out.Header.Set("Authorization", "Token "+apiToken)
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			sendError(
				w,
				http.StatusBadGateway,
				"API_TARGET_UNREACHABLE",
				err,
			)
		},
	}

	proxy.ServeHTTP(w, r)
}

type checkURLRequest struct {
	URL string `json:"url"`
}

type checkURLResponse struct {
	Reachable bool   `json:"reachable"`
	Warning   bool   `json:"warning,omitempty"`
	Message   string `json:"message,omitempty"`
}

func handleCheckURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req checkURLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.URL == "" {
		sendError(w, http.StatusBadRequest, "INVALID_REQUEST_BODY", err)
		return
	}

	targetURL := req.URL
	if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
		targetURL = "https://" + targetURL
	}

	isLocalhost := strings.Contains(targetURL, "localhost") || strings.Contains(targetURL, "127.0.0.1")

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	httpReq, err := http.NewRequest(http.MethodHead, targetURL, nil)
	if err != nil {
		sendError(w, http.StatusBadRequest, "INVALID_URL", err)
		return
	}
	httpReq.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EchoLink/1.0")

	resp, err := client.Do(httpReq)

	reachable := false
	warning := false
	message := ""

	if err == nil && resp != nil {
		reachable = resp.StatusCode < 400
		_ = resp.Body.Close()
	} else if err != nil {
		log.Printf("[CHECK_URL_FAILED] URL: %s | Error: %v", targetURL, err)

		if isLocalhost {
			reachable = true
			warning = true
			message = "Localhost URL cannot be verified. The URL will still be saved and may work normally."
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(checkURLResponse{
		Reachable: reachable,
		Warning:   warning,
		Message:   message,
	})
}

func main() {
	workDir, _ := os.Getwd()
	staticDir := filepath.Join(workDir, "dist")

	isLinkdingPath := regexp.MustCompile(
		`^/(api|assets|favicons|media|previews|static)(/|$)`,
	)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/app/check-url" {
			handleCheckURL(w, r)
			return
		}

		if isLinkdingPath.MatchString(r.URL.Path) {
			proxyLinkding(w, r)
			return
		}

		requestedPath := filepath.Clean(r.URL.Path)
		fpath := filepath.Join(staticDir, requestedPath)

		if !strings.HasPrefix(fpath, filepath.Clean(staticDir)) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}

		if requestedPath == "/sw.js" ||
			requestedPath == "/index.html" ||
			requestedPath == "/" {
			w.Header().Set(
				"Cache-Control",
				"no-store, no-cache, must-revalidate, proxy-revalidate",
			)
		}

		if requestedPath == "/" || requestedPath == "/index.html" {
			serveIndex(w, staticDir)
			return
		}

		info, err := os.Stat(fpath)
		if err != nil || info.IsDir() {
			serveIndex(w, staticDir)
			return
		}

		http.ServeFile(w, r, fpath)
	})

	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "3002"
	}

	addr := ":" + appPort
	log.Printf("Server starting on %s", addr)

	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

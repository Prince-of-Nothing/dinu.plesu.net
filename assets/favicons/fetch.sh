#!/bin/bash
# Fetch favicons for the prank feature
# Run this script from the project root: bash assets/favicons/fetch.sh

cd "$(dirname "$0")"

echo "Fetching favicons..."

# Google
curl -sL "https://www.google.com/favicon.ico" -o google.ico

# YouTube
curl -sL "https://www.youtube.com/favicon.ico" -o youtube.ico

# Amazon
curl -sL "https://www.amazon.com/favicon.ico" -o amazon.ico

# Reddit
curl -sL "https://www.reddit.com/favicon.ico" -o reddit.ico

# Stack Overflow
curl -sL "https://stackoverflow.com/favicon.ico" -o stackoverflow.ico

# DuckDuckGo
curl -sL "https://duckduckgo.com/favicon.ico" -o ddg.ico

# Hacker News (Y Combinator)
curl -sL "https://news.ycombinator.com/favicon.ico" -o hn.ico

# Goodreads
curl -sL "https://www.goodreads.com/favicon.ico" -o goodreads.ico

# ChatGPT / OpenAI
curl -sL "https://chat.openai.com/favicon.ico" -o chatgpt.ico

# 4chan
curl -sL "https://www.4chan.org/favicon.ico" -o 4chan.ico

# Generic fallback (using a simple icon)
curl -sL "https://www.wikipedia.org/favicon.ico" -o generic.ico

echo "Done! Check the assets/favicons/ directory."
ls -la *.ico 2>/dev/null || echo "Note: Some favicons may have failed to download."

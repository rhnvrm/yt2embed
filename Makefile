clean:
	rm -rf yt2embed.zip

chrome: clean
	zip -r yt2embed assets LICENSE manifest.json rules.json README.md popup.html popup.js

firefox: clean
	zip -r yt2embed assets LICENSE manifest.json rules.json README.md popup.html popup.js

.PHONY: clean chrome firefox
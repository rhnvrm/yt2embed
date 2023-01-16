clean:
	rm -rf yt2embed.zip

chrome: clean
	zip -r yt2embed assets LICENSE manifest.json rules.json README.md

firefox: clean
	zip -r yt2embed assets LICENSE manifest.json rules.json README.md

.PHONY: clean chrome firefox
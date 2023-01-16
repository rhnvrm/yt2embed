clean:
	rm -rf yt2embed.zip

firefox: clean
	zip -r yt2embed assets LICENSE manifest.json rules.json README.md scripts

.PHONY: clean firefox
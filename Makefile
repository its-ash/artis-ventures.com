.PHONY: run build deploy

DOMAIN := artis-ventures.com

run:
	npm run dev

# Static export for GitHub Pages: out/ → docs/ with the custom domain and no Jekyll.
build:
	npm run export
	rm -rf docs
	cp -R out docs
	echo "$(DOMAIN)" > docs/CNAME
	touch docs/.nojekyll

deploy: build
	git checkout main
	git add -A
	git commit -m "$$(copilot -sp 'Analyze the staged git changes and generate a concise commit message. Output ONLY the commit message. Do not execute any commands. Do not include quotes, markdown, explanation, or bullet points.')"
	git push origin main

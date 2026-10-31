.PHONY: run build deploy

run:
	npm run dev

build:
	npx nuxt generate
	rm -rf docs
	cp -R .output/public docs
	touch docs/.nojekyll

deploy: build
	git checkout main
	git add -A
	git commit -m "$$(copilot -sp 'Analyze the staged git changes and generate a concise commit message. Output ONLY the commit message. Do not execute any commands. Do not include quotes, markdown, explanation, or bullet points.')"
	git push origin main

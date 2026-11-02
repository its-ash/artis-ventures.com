.PHONY: run build deploy

# OpenAI-compatible endpoint for commit messages. The diff skips docs/ (build output).
LLM := http://127.0.0.1:9694/v1
MODEL := router/auto
PROMPT := Write a concise git commit message for this staged diff. Output ONLY the commit message, no quotes, markdown, explanation or bullet points.

run:
	npm run dev

# Static export for GitHub Pages: out/ → docs/ on the custom domain, no Jekyll.
DOMAIN := artis-ventures.com

build:
	npm run export
	rm -rf docs
	cp -R out docs
	touch docs/.nojekyll
	echo '$(DOMAIN)' > docs/CNAME

deploy: build
	git checkout main
	git add -A
	git diff --cached --quiet || { \
		msg=$$( { git diff --cached --stat; git diff --cached -- . ':(exclude)docs'; } | head -c 60000 \
			| jq -Rs --arg m '$(MODEL)' --arg p '$(PROMPT)' '{model: $$m, temperature: 0.2, messages: [{role: "system", content: $$p}, {role: "user", content: .}]}' \
			| curl -sf -m 90 '$(LLM)/chat/completions' -H 'Content-Type: application/json' -d @- \
			| jq -r '.choices[0].message.content // empty' | sed '/^```/d'); \
		git commit -m "$${msg:-Update site}"; \
	}
	git push origin main

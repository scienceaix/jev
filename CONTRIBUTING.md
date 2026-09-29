# Contributing to Awesome Jev

This is a curated map, not a popularity contest. Contributions should make the ecosystem easier to understand and evaluate.

## Add a project

Open a pull request with:

1. The project name, canonical URL, role, license, and deployment mode.
2. A primary source: the project repository, model card, or official documentation.
3. A dated metric if you include stars, downloads, benchmarks, or activity.
4. One sentence explaining the project’s typed-decision connection.
5. A maturity label that reflects the project’s own status and unresolved limitations.

Use these roles:

- `official` — TypeSafe SDKs, skills, and adapters.
- `application` — products or agents that use typed decisions in a workflow.
- `infrastructure` — runtimes, protocol layers, and local serving tools.
- `research` — open models, training systems, replications, or architecture studies.
- `curation` — indexes and discovery resources.

## Evidence rules

- Keep snapshot metrics labelled with a date.
- Separate author-reported benchmarks from independently reproduced results.
- Do not call a project “the open-source Jev” unless its maintainers make and support that exact claim.
- Keep hosted Jev, open SDKs, Jev-powered applications, and Jev-like models as distinct categories.
- Prefer a useful limitation over an inflated claim.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173` and check the filters, project links, narrow layout, and poster/infographic assets before submitting.

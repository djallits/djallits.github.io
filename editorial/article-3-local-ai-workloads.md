# Why More AI Workloads Should Move Back to the Local Machine

Dan Jallits · 2026-05-26

Editorial draft based on the complete supplied text.

For the past two years, much of the AI industry has focused on centralized inference: frontier models running on large cloud GPU clusters, with recurring bills to match. Some workloads justify that approach. But I think we’re overlooking what open models running locally can offer.

A compelling demo answers whether a model can do something. Deploying it across an organization raises different questions: how often will it run, what will it cost, which data will it touch, and who will control the workflow?

## A pilot’s bill is a poor guide to production

Early experiments are easy to approve. Usage is limited, the results are promising, and a few dollars a day rarely attract much scrutiny. The economics change when a workflow runs continuously or becomes part of everyone’s working day.

Coding assistants, internal copilots, document summarization, retrieval, batch enrichment, classification, and multi-agent orchestration all add demand. Contexts get larger, agents make additional calls, and a loop that goes unnoticed during a demo can create a real bill.

At that point, token usage belongs in the infrastructure conversation. A team needs to understand its recurring workloads before deciding that every one of them belongs behind a hosted frontier API.

## Choose enough capability for the task

Open-weight models from organizations including Meta, Mistral AI, Alibaba Cloud, and Google have made local and self-hosted execution more useful. That does not make every model suitable for every task, or every model license suitable for every deployment.

Many operational workflows need consistent results within a narrow domain. Ticket classification, summarization, structured extraction, semantic search, schema translation, boilerplate code, SQL generation, embeddings, and documentation drafts are candidates for evaluation.

The criterion is the least costly deployment that meets the required accuracy and reliability. A small model that misses important details is not a bargain. A frontier model whose additional capability does not improve the workflow may be an unnecessary expense.

## Keep frontier models where they earn their place

Complex synthesis, unfamiliar problems, advanced coding, research, and difficult multi-domain reasoning may still benefit substantially from frontier models. Architecture reviews, legal analysis, and strategy work can place demands on a model that a narrower local setup cannot meet.

Those examples also need appropriate review; access to a stronger model does not remove the consequences of an incorrect answer.

I’m not proposing that an organization replace all hosted inference. I’m proposing that it identify which workloads justify it. The architecture should follow the work rather than a commitment to either cloud services or local hardware.

## What local inference changes

Local execution shifts some spending from per-request charges to hardware and operation. That can make recurring workloads more predictable, particularly when the hardware is well used. Power, support, upgrades, and replacement remain part of the cost.

A lower marginal cost can make more automation worth evaluating. The next question still needs to be whether the process should be automated, how mistakes will be handled, and where a person must remain involved.

Local inference also removes a network round trip. That can improve the feel of a coding tool or desktop assistant, although a slow local model may take longer overall than a fast hosted service. End-to-end latency is what the user experiences.

Keeping source code, customer records, financial information, security findings, or proprietary research inside a controlled environment can reduce external disclosure. It does not remove the need for access controls, device security, logging policies, and careful handling of model outputs.

Open models also give a team more deployment options. Those options can reduce exposure to provider pricing changes, rate limits, API outages, model deprecations, policy changes, and regional availability. They bring their own dependencies and maintenance work, which belong in the comparison.

## Start with knowledge the team already owns

Engineering organizations have a substantial body of operational material: runbooks, infrastructure definitions, CI/CD pipelines, Terraform or OpenTofu repositories, API specifications, database schemas, incident histories, telemetry, and security findings.

That material makes useful starting points for bounded local or internal tools. A code-focused model might assist with a repository; an embedding model might support retrieval; a quantized instruction model might summarize a runbook. A specialized or fine-tuned model may help with internal terminology, provided the improvement is demonstrated.

Some of these workloads can run on a modern laptop. Others need a workstation, a small GPU server, or shared infrastructure. Model size, quantization, available memory, and concurrency determine the practical limits.

Possible applications include local coding assistance, internal RAG, self-hosted embeddings, log summaries, incident classification, infrastructure-drift analysis, and change-risk assessment. Sensitive environments may require an air-gapped deployment. These are candidates to test, not a checklist every team needs to implement.

## Separate inference from permission to act

The pattern I expect to see more often combines several components: a stronger model for difficult reasoning, a local or shared model for bounded operational work, a workflow engine for known execution paths, and a policy system that governs what actions are permitted.

Running an agent locally does not make its actions safe. A model that reviews a configuration or proposes a remediation should not automatically gain permission to change production infrastructure. Reliability, control, security, and cost all depend on the surrounding system.

## Route by requirements, then measure the result

A hybrid architecture can choose a deployment based on complexity, sensitivity, cost, latency, governance requirements, and the accuracy threshold. A repetitive extraction task may fit a local model. An unfamiliar research problem may justify a frontier model. A sensitive workflow needs an approved environment regardless of which model is capable enough.

Those routing decisions should reflect evaluations against actual work. “Simple” and “sensitive” are useful descriptions, but neither proves that a particular model or deployment is suitable.

The larger organizational change is recognizing that AI can be infrastructure a team operates, as well as a service it rents. That affects procurement, architecture, governance, and control of operational knowledge.

The next step is to find out how much of the work truly needs centralized frontier inference. I suspect many organizations will discover that it is less than they first assumed.

## LinkedIn teaser

A document summary, an embedding request, and an unfamiliar architecture problem don’t need the same inference setup. Yet it’s easy to route all three through the same hosted model.

Open models make local and shared inference worth evaluating for recurring engineering work. That can change cost, latency, and control—but hardware ownership does not make inference free or automatically secure.

The full article looks at where local models fit, where frontier models still matter, and how to build a hybrid approach around measured requirements.

Read the full article: https://dan.jallits.com/posts/local-ai-workloads/

Original: https://www.linkedin.com/pulse/why-more-ai-workloads-should-move-back-local-machine-dan-jallits-izouf/
